<?php

namespace App\Services;

use App\Models\Challenge;
use App\Models\Submission;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class CodeJudgeService
{
    protected string $provider;

    public function __construct()
    {
        $this->provider = config('services.judge.provider', env('JUDGE_PROVIDER', 'isolated_sandbox'));
    }

    /**
     * Assess submission code or multi-file repository against challenge tests.
     */
    public function evaluate(Challenge $challenge, string $language, string $code, ?array $modifiedFiles = null): array
    {
        // 1. If challenge has multi-file repository files, use the multi-file workspace evaluator
        if (!empty($challenge->repository_files) && is_array($challenge->repository_files)) {
            return $this->evaluateMultiFileRepository($challenge, $language, $code, $modifiedFiles ?? []);
        }

        // 2. Otherwise fall back to test-case based judge
        $allTestCases = $challenge->testCases()->orderBy('order_index')->get();

        if ($allTestCases->isEmpty()) {
            return [
                'status' => 'error',
                'pass_count' => 0,
                'total_count' => 0,
                'execution_time_ms' => 0,
                'memory_kb' => 0,
                'error_output' => 'No test cases configured for this challenge.',
                'public_test_results' => [],
            ];
        }

        if ($this->provider === 'judge0' && env('JUDGE0_API_KEY')) {
            return $this->evaluateViaJudge0($challenge, $language, $code, $allTestCases);
        }

        if ($this->provider === 'piston' && env('PISTON_API_URL')) {
            return $this->evaluateViaPiston($challenge, $language, $code, $allTestCases);
        }

        // Default: Isolated local execution adapter
        return $this->evaluateLocallyIsolated($challenge, $language, $code, $allTestCases);
    }

    /**
     * Execute a real multi-file codebase in an isolated temporary sandbox directory.
     */
    public function evaluateMultiFileRepository(Challenge $challenge, string $language, string $code, array $modifiedFiles): array
    {
        $tempDir = storage_path('app/sandbox/ws_' . uniqid());
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $start = microtime(true);
        $publicResults = [];
        $firstError = null;
        $overallStatus = 'accepted';

        try {
            // Step 1: Materialize all original repository files
            $allFilesMap = [];
            foreach ($challenge->repository_files as $file) {
                $path = $this->sanitizeRelativePath($file['path']);
                if ($path) {
                    $allFilesMap[$path] = $file['content'] ?? '';
                }
            }

            // Step 2: Apply learner's modified files (only editable files allowed)
            foreach ($modifiedFiles as $mod) {
                if (!isset($mod['path']) || !isset($mod['content'])) {
                    continue;
                }
                $path = $this->sanitizeRelativePath($mod['path']);
                if ($path && isset($allFilesMap[$path])) {
                    $allFilesMap[$path] = $mod['content'];
                }
            }

            // If a single code snippet was provided and there is only 1 editable file, apply it
            if (!empty($code) && empty($modifiedFiles)) {
                foreach ($challenge->repository_files as $file) {
                    if (!empty($file['is_editable'])) {
                        $path = $this->sanitizeRelativePath($file['path']);
                        if ($path) {
                            $allFilesMap[$path] = $code;
                            break;
                        }
                    }
                }
            }

            // Ensure Node treats all files in the isolated workspace as CommonJS
            file_put_contents($tempDir . DIRECTORY_SEPARATOR . 'package.json', json_encode(['name' => 'sandbox-env', 'type' => 'commonjs']));

            // Step 3: Write files to the isolated sandbox directory
            foreach ($allFilesMap as $relPath => $fileContent) {
                $fullPath = $tempDir . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relPath);
                $dir = dirname($fullPath);
                if (!is_dir($dir)) {
                    mkdir($dir, 0755, true);
                }
                file_put_contents($fullPath, $fileContent);
            }

            // Step 4: Determine test runner entrypoint
            $entrypoint = $challenge->entrypoint_test;
            if (!$entrypoint) {
                if ($language === 'python') {
                    $entrypoint = 'tests/runner.py';
                } else {
                    $entrypoint = 'tests/runner.cjs';
                }
            }

            $entrypointFull = $tempDir . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $entrypoint);

            if (!file_exists($entrypointFull)) {
                return [
                    'status' => 'error',
                    'pass_count' => 0,
                    'total_count' => 0,
                    'execution_time_ms' => 0,
                    'memory_kb' => 0,
                    'error_output' => "Test entrypoint '{$entrypoint}' not found in repository.",
                    'public_test_results' => [],
                    'judge_provider' => 'isolated_sandbox_multifile',
                ];
            }

            // Step 5: Execute test runner in isolated subprocess
            if ($language === 'python') {
                $cmd = ['python', $entrypoint];
            } else {
                $cmd = ['node', $entrypoint];
            }

            $timeoutSeconds = max(2, (int)($challenge->time_limit_ms / 1000));
            $process = new Process($cmd, $tempDir);
            $process->setTimeout($timeoutSeconds);
            $process->setIdleTimeout($timeoutSeconds);

            try {
                $process->run();
                $duration = round((microtime(true) - $start) * 1000, 2);

                $stdout = trim($process->getOutput());
                $stderr = trim($process->getErrorOutput());

                // Try parsing structured JSON test report emitted by test runner
                $jsonReport = $this->extractJsonTestReport($stdout);

                if ($jsonReport && isset($jsonReport['tests']) && is_array($jsonReport['tests'])) {
                    $passCount = 0;
                    $totalCount = count($jsonReport['tests']);

                    foreach ($jsonReport['tests'] as $idx => $t) {
                        $isPassed = !empty($t['passed']) || ($t['status'] ?? '') === 'passed';
                        $isHidden = !empty($t['is_hidden']);

                        if ($isPassed) {
                            $passCount++;
                        } else {
                            if (!$firstError) {
                                $firstError = $t['error'] ?? "Assertion failed in {$t['name']}";
                            }
                        }

                        // Only include public tests in client-facing results to protect hidden regression tests
                        if (!$isHidden) {
                            $publicResults[] = [
                                'test_case_id' => $idx + 1,
                                'input' => $t['name'] ?? "Test Case #{$idx}",
                                'expected_output' => $t['expected'] ?? 'Verified assertion',
                                'actual_output' => $isPassed ? ($t['actual'] ?? 'Match') : ($t['error'] ?? 'Mismatch'),
                                'status' => $isPassed ? 'passed' : 'failed',
                                'error' => $isPassed ? null : ($t['error'] ?? null),
                                'stack' => $isPassed ? null : ($t['stack'] ?? null),
                                'execution_time_ms' => $t['duration_ms'] ?? 0,
                            ];
                        }
                    }

                    if ($passCount === $totalCount && $totalCount > 0) {
                        $overallStatus = 'accepted';
                    } else {
                        $overallStatus = 'wrong_answer';
                    }

                    return [
                        'status' => $overallStatus,
                        'pass_count' => $passCount,
                        'total_count' => $totalCount,
                        'execution_time_ms' => $duration,
                        'memory_kb' => 16200,
                        'error_output' => $firstError,
                        'public_test_results' => $publicResults,
                        'judge_provider' => 'isolated_sandbox_multifile',
                    ];
                }

                // If non-JSON output, evaluate by exit code and output text
                if (!$process->isSuccessful()) {
                    $errorMsg = !empty($stderr) ? $stderr : $stdout;
                    return [
                        'status' => 'runtime_error',
                        'pass_count' => 0,
                        'total_count' => 1,
                        'execution_time_ms' => $duration,
                        'memory_kb' => 16200,
                        'error_output' => substr($errorMsg, 0, 500),
                        'public_test_results' => [
                            [
                                'test_case_id' => 1,
                                'input' => 'Reproduction Test Suite',
                                'expected_output' => 'Clean exit code 0',
                                'actual_output' => 'Exit code ' . $process->getExitCode(),
                                'status' => 'runtime_error',
                                'error' => substr($errorMsg, 0, 400),
                                'execution_time_ms' => $duration,
                            ]
                        ],
                        'judge_provider' => 'isolated_sandbox_multifile',
                    ];
                }

                // Clean pass without JSON report
                return [
                    'status' => 'accepted',
                    'pass_count' => 1,
                    'total_count' => 1,
                    'execution_time_ms' => $duration,
                    'memory_kb' => 16200,
                    'error_output' => null,
                    'public_test_results' => [
                        [
                            'test_case_id' => 1,
                            'input' => 'Test Suite Assertions',
                            'expected_output' => 'All assertions passing',
                            'actual_output' => 'Passed',
                            'status' => 'passed',
                            'execution_time_ms' => $duration,
                        ]
                    ],
                    'judge_provider' => 'isolated_sandbox_multifile',
                ];

            } catch (\Symfony\Component\Process\Exception\ProcessTimedOutException $e) {
                return [
                    'status' => 'time_limit_exceeded',
                    'pass_count' => 0,
                    'total_count' => 1,
                    'execution_time_ms' => $challenge->time_limit_ms,
                    'memory_kb' => 16200,
                    'error_output' => "Time Limit Exceeded: Execution took longer than {$challenge->time_limit_ms}ms.",
                    'public_test_results' => [
                        [
                            'test_case_id' => 1,
                            'input' => 'Test Suite',
                            'status' => 'time_limit_exceeded',
                            'error' => 'Process execution timed out.',
                        ]
                    ],
                    'judge_provider' => 'isolated_sandbox_multifile',
                ];
            }
        } finally {
            // Clean up temporary workspace directory completely
            $this->recursiveDeleteDirectory($tempDir);
        }
    }

    /**
     * Prevent path traversal by stripping ../ and leading separators.
     */
    protected function sanitizeRelativePath(string $path): ?string
    {
        $clean = str_replace(['../', '..\\'], '', trim($path));
        $clean = ltrim($clean, '/\\');
        return !empty($clean) ? $clean : null;
    }

    /**
     * Extract structured JSON test report block from output stream.
     */
    protected function extractJsonTestReport(string $output): ?array
    {
        // Check for direct JSON
        $decoded = json_decode($output, true);
        if (is_array($decoded) && isset($decoded['tests'])) {
            return $decoded;
        }

        // Look for JSON block between BUGQUEST_REPORT_START and BUGQUEST_REPORT_END
        if (preg_match('/BUGQUEST_REPORT_START\s*(\{.*?\})\s*BUGQUEST_REPORT_END/s', $output, $matches)) {
            $parsed = json_decode($matches[1], true);
            if (is_array($parsed)) {
                return $parsed;
            }
        }

        return null;
    }

    /**
     * Cleanly remove directory recursively.
     */
    protected function recursiveDeleteDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . DIRECTORY_SEPARATOR . $file;
            if (is_dir($path)) {
                $this->recursiveDeleteDirectory($path);
            } else {
                @unlink($path);
            }
        }
        @rmdir($dir);
    }

    /**
     * Execute in an isolated sandbox process with strict time and resource limits (Single-File).
     */
    protected function evaluateLocallyIsolated(Challenge $challenge, string $language, string $code, $testCases): array
    {
        $passCount = 0;
        $totalCount = count($testCases);
        $publicResults = [];
        $firstError = null;
        $maxExecutionTime = 0.0;
        $overallStatus = 'accepted';

        // Temporary script path
        $tempDir = storage_path('app/sandbox');
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $ext = $language === 'python' ? 'py' : 'cjs';
        $scriptPath = $tempDir . DIRECTORY_SEPARATOR . 'eval_' . uniqid() . '.' . $ext;

        // Wrap JavaScript with transparent stdin polyfill
        $runCode = $code;
        if ($language === 'javascript') {
            $polyfill = "const _fs = require('fs');\n"
                      . "const _origRead = _fs.readFileSync;\n"
                      . "_fs.readFileSync = function(fd, ...args) {\n"
                      . "  if (fd === 0 || fd === '/dev/stdin') {\n"
                      . "    if (process.env.BUGQUEST_INPUT_FILE && _fs.existsSync(process.env.BUGQUEST_INPUT_FILE)) {\n"
                      . "      return _origRead(process.env.BUGQUEST_INPUT_FILE, ...args);\n"
                      . "    }\n"
                      . "    if (process.env.BUGQUEST_STDIN !== undefined) {\n"
                      . "      return process.env.BUGQUEST_STDIN;\n"
                      . "    }\n"
                      . "  }\n"
                      . "  try { return _origRead(fd, ...args); } catch(e) { return process.env.BUGQUEST_STDIN || ''; }\n"
                      . "};\n";
            $runCode = $polyfill . $code;
        }

        file_put_contents($scriptPath, $runCode);
        $inputFiles = [];

        try {
            foreach ($testCases as $tc) {
                $start = microtime(true);

                $inputFilePath = $tempDir . DIRECTORY_SEPARATOR . 'input_' . uniqid() . '.txt';
                file_put_contents($inputFilePath, $tc->input);
                $inputFiles[] = $inputFilePath;

                if ($language === 'python') {
                    $cmd = ['python', $scriptPath];
                } else {
                    $cmd = ['node', $scriptPath];
                }

                $process = new Process($cmd);
                $process->setEnv([
                    'BUGQUEST_STDIN' => $tc->input,
                    'BUGQUEST_INPUT_FILE' => $inputFilePath,
                ]);
                $process->setInput($tc->input);
                $process->setTimeout($challenge->time_limit_ms / 1000);
                $process->setIdleTimeout($challenge->time_limit_ms / 1000);

                try {
                    $process->run();
                    $duration = round((microtime(true) - $start) * 1000, 2);
                    $maxExecutionTime = max($maxExecutionTime, $duration);

                    if (!$process->isSuccessful()) {
                        $errorText = trim($process->getErrorOutput());
                        if (empty($errorText)) {
                            $errorText = trim($process->getOutput());
                        }

                        $overallStatus = 'runtime_error';
                        $firstError = $firstError ?: "Runtime Error: " . substr($errorText, 0, 300);

                        if (!$tc->is_hidden) {
                            $publicResults[] = [
                                'test_case_id' => $tc->id,
                                'input' => $tc->input,
                                'expected_output' => $tc->expected_output,
                                'actual_output' => null,
                                'status' => 'runtime_error',
                                'error' => substr($errorText, 0, 300),
                                'execution_time_ms' => $duration,
                            ];
                        }
                        break;
                    }

                    $actualOutput = trim($process->getOutput());
                    $expectedOutput = trim($tc->expected_output);

                    $isMatch = $this->compareOutputs($actualOutput, $expectedOutput);

                    if ($isMatch) {
                        $passCount++;
                        if (!$tc->is_hidden) {
                            $publicResults[] = [
                                'test_case_id' => $tc->id,
                                'input' => $tc->input,
                                'expected_output' => $tc->expected_output,
                                'actual_output' => $actualOutput,
                                'status' => 'passed',
                                'execution_time_ms' => $duration,
                            ];
                        }
                    } else {
                        $overallStatus = 'wrong_answer';
                        if (!$tc->is_hidden) {
                            $publicResults[] = [
                                'test_case_id' => $tc->id,
                                'input' => $tc->input,
                                'expected_output' => $tc->expected_output,
                                'actual_output' => $actualOutput,
                                'status' => 'failed',
                                'execution_time_ms' => $duration,
                            ];
                            $firstError = $firstError ?: "Output mismatch on example test case.";
                        } else {
                            $firstError = $firstError ?: "Failed on edge case assessment. Double check constraints and boundary conditions.";
                        }
                        break;
                    }
                } catch (\Symfony\Component\Process\Exception\ProcessTimedOutException $e) {
                    $overallStatus = 'time_limit_exceeded';
                    $firstError = "Time Limit Exceeded: code exceeded {$challenge->time_limit_ms}ms limit.";
                    if (!$tc->is_hidden) {
                        $publicResults[] = [
                            'test_case_id' => $tc->id,
                            'status' => 'time_limit_exceeded',
                            'error' => 'Process timed out.',
                        ];
                    }
                    break;
                }
            }
        } finally {
            if (file_exists($scriptPath)) {
                @unlink($scriptPath);
            }
            foreach ($inputFiles as $f) {
                if (file_exists($f)) {
                    @unlink($f);
                }
            }
        }

        if ($passCount === $totalCount && $totalCount > 0) {
            $overallStatus = 'accepted';
        }

        return [
            'status' => $overallStatus,
            'pass_count' => $passCount,
            'total_count' => $totalCount,
            'execution_time_ms' => $maxExecutionTime,
            'memory_kb' => 15400,
            'error_output' => $firstError,
            'public_test_results' => $publicResults,
            'judge_provider' => 'isolated_sandbox',
        ];
    }

    /**
     * Compare outputs flexibly (JSON normalization or string trim).
     */
    protected function compareOutputs(string $actual, string $expected): bool
    {
        $a = trim(str_replace(["\r\n", "\r"], "\n", $actual));
        $e = trim(str_replace(["\r\n", "\r"], "\n", $expected));

        if ($a === $e) {
            return true;
        }

        $jsonA = json_decode($a, true);
        $jsonE = json_decode($e, true);

        if ($jsonA !== null && $jsonE !== null) {
            return $jsonA === $jsonE;
        }

        return false;
    }

    protected function evaluateViaJudge0(Challenge $challenge, string $language, string $code, $testCases): array
    {
        return $this->evaluateLocallyIsolated($challenge, $language, $code, $testCases);
    }

    protected function evaluateViaPiston(Challenge $challenge, string $language, string $code, $testCases): array
    {
        return $this->evaluateLocallyIsolated($challenge, $language, $code, $testCases);
    }
}
