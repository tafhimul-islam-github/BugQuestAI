<?php

namespace Database\Seeders;

use App\Models\Challenge;
use App\Models\ChallengeTestCase;
use Illuminate\Database\Seeder;

class ChallengeSeeder extends Seeder
{
    public function run(): void
    {
        // Wipe existing challenges and test cases cleanly before seeding the 22 production-ready problems
        ChallengeTestCase::query()->delete();
        Challenge::query()->delete();

        $challenges = [
            // 1. Two Sum Target Finder (Order Book Liquidity Pair Matcher)
            [
                'slug' => 'two-sum-target-finder',
                'title' => 'Order Book Engine: Complementary Liquidity Pair Matcher (Two Sum)',
                'difficulty' => 'beginner',
                'category' => 'algorithms_lookup',
                'framework' => 'Node.js / Python 3',
                'investigation_time_minutes' => 15,
                'description' => "In our financial order-matching microservice, we need to pair two resting limit orders whose lot sizes (`nums`) sum to an institutional block order size (`target`).\n\nGiven an array of integers `nums` and an integer `target`, return the 0-based indices of the two orders such that they add up to `target` as a JSON array `[index1, index2]`. You may not match the same order index with itself.",
                'bug_report' => [
                    'issue_title' => 'Starter matcher matches an element with itself when target = 2 * nums[i]',
                    'symptoms' => 'For nums = [3, 2, 4] and target = 6, the current implementation returns [0, 0] instead of [1, 2] because it inserts nums[i] into the lookup table before checking for the complement.',
                    'expected_behavior' => 'Must return two distinct indices [i, j] (with i < j) in O(N) time complexity.',
                    'actual_behavior' => 'Pre-populating or inserting into the map before querying complement matches index 0 with itself.',
                    'reproduction_steps' => [
                        '1. Pass input "3,2,4\\n6".',
                        '2. Observe starter code matches 3 + 3 at index [0, 0] or returns empty.'
                    ],
                ],
                'input_spec' => "Line 1: Comma-separated integers representing nums (e.g., `2,7,11,15`)\nLine 2: Single integer representing target (e.g., `9`)",
                'output_spec' => "JSON array of two 0-based indices, e.g. `[0,1]`",
                'constraints' => [
                    "2 <= nums.length <= 10^4",
                    "-10^9 <= nums[i] <= 10^9",
                    "-10^9 <= target <= 10^9",
                    "Exactly one valid pair exists."
                ],
                'public_examples' => [
                    [
                        'input' => "2,7,11,15\n9",
                        'output' => "[0,1]",
                        'explanation' => "nums[0] + nums[1] == 2 + 7 == 9, so return [0, 1]."
                    ],
                    [
                        'input' => "3,2,4\n6",
                        'output' => "[1,2]",
                        'explanation' => "nums[1] + nums[2] == 2 + 4 == 6, so return [1, 2]."
                    ]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length < 2) process.exit(0);\n\nconst nums = input[0].split(',').map(Number);\nconst target = Number(input[1]);\n\nfunction twoSum(nums, target) {\n    // BUG: Inserting into map BEFORE checking complement matches an element with itself!\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        map.set(nums[i], i);\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n    }\n    return [];\n}\n\nconsole.log(JSON.stringify(twoSum(nums, target)));",
                    'python' => "import sys, json\n\nlines = sys.stdin.read().strip().splitlines()\nif not lines: sys.exit(0)\n\nnums = [int(x) for x in lines[0].split(',')]\ntarget = int(lines[1])\n\ndef two_sum(nums, target):\n    # BUG: Recording seen[num] = i before checking complement matches an element with itself!\n    seen = {}\n    for i, num in enumerate(nums):\n        seen[num] = i\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n    return []\n\nprint(json.dumps(two_sum(nums, target)))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['arrays', 'hash_maps', 'lookup'],
                'hints' => [
                    ['level' => 'nudge', 'title' => 'Order of map lookup vs insertion', 'content' => 'What happens when `target` is 6 and `nums[0]` is 3 if you insert `3` into the map before checking whether `6 - 3` is already in the map?'],
                    ['level' => 'direction', 'title' => 'Query complement first, then store', 'content' => 'Check `if (map.has(complement))` first. Only call `map.set(nums[i], i)` after confirming the complement was not yet seen.'],
                    ['level' => 'debugging_guidance', 'title' => 'Swap the set and has statements', 'content' => 'Move `map.set(nums[i], i)` (or `seen[num] = i`) to the bottom of the loop body after the `if` statement.'],
                    ['level' => 'detailed_explanation', 'title' => 'O(N) Single-Pass Hash Map', 'content' => 'For each index `i`, compute `complement = target - nums[i]`. Check if `complement` is in the map; if so, return `[map.get(complement), i]`. Otherwise store `map.set(nums[i], i)`.']
                ],
                'editorial' => "### Single-Pass Complement Lookup\nAlways check for `target - nums[i]` in the hash map **before** inserting `nums[i]`. This prevents matching an element with itself on even targets and correctly handles duplicate values like `[3, 3]` with `target = 6`.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 13,
                'test_cases' => [
                    ['input' => "2,7,11,15\n9", 'expected_output' => "[0,1]", 'is_hidden' => false, 'explanation' => 'Standard pair'],
                    ['input' => "3,2,4\n6", 'expected_output' => "[1,2]", 'is_hidden' => false, 'explanation' => 'Self-match trap'],
                    ['input' => "3,3\n6", 'expected_output' => "[0,1]", 'is_hidden' => true, 'explanation' => 'Duplicate elements'],
                    ['input' => "-1,-2,-3,-4,-5\n-8", 'expected_output' => "[2,4]", 'is_hidden' => true, 'explanation' => 'Negative integers'],
                    ['input' => "1000,2000,3000,4000\n7000", 'expected_output' => "[2,3]", 'is_hidden' => true, 'explanation' => 'Large block volumes'],
                ]
            ],

            // 2. Valid Palindrome Sanitizer
            [
                'slug' => 'valid-palindrome-sanitizer',
                'title' => 'Input Sanitizer: Case-Insensitive Alphanumeric Palindrome Verifier',
                'difficulty' => 'beginner',
                'category' => 'data_parsing',
                'framework' => 'Node.js / Python 3',
                'investigation_time_minutes' => 15,
                'description' => "Our content moderation filter normalizes incoming tokens by stripping all non-alphanumeric characters and converting letters to lowercase before checking if the normalized sequence is symmetric (a palindrome).\n\nGiven a raw string `s`, return `true` if it is a valid alphanumeric palindrome, or `false` otherwise.",
                'bug_report' => [
                    'issue_title' => 'Regex sanitizer forgets to strip underscores and mixed-case characters',
                    'symptoms' => 'Strings with punctuation, spaces, or uppercase characters like "A man, a plan, a canal: Panama" fail validation.',
                    'expected_behavior' => 'Strip all non-alphanumeric characters (`[^a-z0-9]`), lowercase the string, and verify forward === backward.',
                    'actual_behavior' => 'Starter code compares raw string directly without case normalization or non-alphanumeric filtering.',
                    'reproduction_steps' => [
                        '1. Pass "A man, a plan, a canal: Panama".',
                        '2. Starter code returns false instead of true.'
                    ],
                ],
                'input_spec' => "A single line containing raw string `s`.",
                'output_spec' => "`true` or `false`",
                'constraints' => [
                    "1 <= s.length <= 2 * 10^5",
                    "`s` consists of printable ASCII characters."
                ],
                'public_examples' => [
                    ['input' => "A man, a plan, a canal: Panama", 'output' => "true", 'explanation' => "Normalized string 'amanaplanacanalpanama' is symmetric."],
                    ['input' => "race a car", 'output' => "false", 'explanation' => "Normalized string 'raceacar' is not symmetric."]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\n\nfunction isPalindrome(s) {\n    // BUG: Compares raw string without lowercasing or stripping non-alphanumeric chars!\n    return s === s.split('').reverse().join('');\n}\n\nconsole.log(isPalindrome(s));",
                    'python' => "import sys\ns = sys.stdin.read().strip()\n\ndef is_palindrome(s: str) -> bool:\n    # BUG: Compares raw string without lowercasing or filtering non-alphanumeric chars!\n    return s == s[::-1]\n\nprint(str(is_palindrome(s)).lower())"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['strings', 'two_pointers', 'sanitization'],
                'hints' => [
                    ['level' => 'nudge', 'title' => 'Normalize before comparing', 'content' => 'Spaces, punctuation, and uppercase letters cause direct comparisons to fail.'],
                    ['level' => 'direction', 'title' => 'Filter to [a-z0-9]', 'content' => 'In JS use `s.toLowerCase().replace(/[^a-z0-9]/g, "")`. In Python use `[c.lower() for c in s if c.isalnum()]`.'],
                    ['level' => 'debugging_guidance', 'title' => 'Compare cleaned string with its reverse', 'content' => 'Once `clean` contains only lowercase alphanumeric characters, check if `clean` equals its reversed form.'],
                    ['level' => 'detailed_explanation', 'title' => 'Complete O(N) Sanitizer', 'content' => 'Lowercase the string, strip all characters outside `a-z` and `0-9`, and compare with the reversed string (or use two pointers `left` and `right`).']
                ],
                'editorial' => "### String Normalization & Two-Pointer Symmetry\nFiltering to `[a-z0-9]` in lowercase ensures punctuation and casing never cause false negatives.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 14,
                'test_cases' => [
                    ['input' => "A man, a plan, a canal: Panama", 'expected_output' => "true", 'is_hidden' => false, 'explanation' => 'Mixed case and punctuation'],
                    ['input' => "race a car", 'expected_output' => "false", 'is_hidden' => false, 'explanation' => 'Non-palindrome'],
                    ['input' => " ", 'expected_output' => "true", 'is_hidden' => true, 'explanation' => 'Whitespace only'],
                    ['input' => "0P", 'expected_output' => "false", 'is_hidden' => true, 'explanation' => 'Digit and letter'],
                    ['input' => "No 'x' in Nixon", 'expected_output' => "true", 'is_hidden' => true, 'explanation' => 'Quotes and spaces'],
                ]
            ],

            // 3. Balanced Brackets Validator
            [
                'slug' => 'balanced-brackets-validator',
                'title' => 'Config AST Lexer: Nested Delimiter & Bracket Validator',
                'difficulty' => 'beginner',
                'category' => 'data_parsing',
                'framework' => 'Node.js / Python 3',
                'investigation_time_minutes' => 20,
                'description' => "Our configuration parser validates whether all opening delimiters `(`, `{`, `[` in an expression string `s` are closed in strict LIFO order by their matching closing delimiters `)`, `}`, `]`.\n\nReturn `true` if the delimiter sequence is valid, or `false` otherwise.",
                'bug_report' => [
                    'issue_title' => 'Lexer returns true when unclosed opening brackets remain on the stack',
                    'symptoms' => 'Input "(((((" returns true instead of false because the function forgets to check if the stack is empty after the loop finishes.',
                    'expected_behavior' => 'Must verify both matching pop pairs during iteration AND `stack.length === 0` at termination.',
                    'actual_behavior' => 'Unclosed opening brackets remain on the stack while the function unconditionally returns `true`.',
                    'reproduction_steps' => [
                        '1. Pass input "([{}])" -> returns true.',
                        '2. Pass input "(((((" -> returns true (DEFECT).'
                    ],
                ],
                'input_spec' => "A single line containing bracket characters `s`.",
                'output_spec' => "`true` or `false`",
                'constraints' => [
                    "1 <= s.length <= 10^4",
                    "`s` consists only of `'()[]{}'`."
                ],
                'public_examples' => [
                    ['input' => "()[]{}", 'output' => "true", 'explanation' => "All brackets close in valid LIFO order."],
                    ['input' => "(]", 'output' => "false", 'explanation' => "Mismatched closing bracket."]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\n\nfunction isValid(s) {\n    const stack = [];\n    const pairs = { ')': '(', '}': '{', ']': '[' };\n    for (const char of s) {\n        if (char === '(' || char === '{' || char === '[') {\n            stack.push(char);\n        } else {\n            if (stack.pop() !== pairs[char]) return false;\n        }\n    }\n    // BUG: Unconditionally returns true even when unclosed brackets remain in stack!\n    return true;\n}\n\nconsole.log(isValid(s));",
                    'python' => "import sys\ns = sys.stdin.read().strip()\n\ndef is_valid(s: str) -> bool:\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in '({[':\n            stack.append(char)\n        else:\n            if not stack or stack.pop() != pairs.get(char):\n                return False\n    # BUG: Unconditionally returns True even if stack still has unclosed opening brackets!\n    return True\n\nprint(str(is_valid(s)).lower())"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['stacks', 'parsing', 'data_structures'],
                'hints' => [
                    ['level' => 'nudge', 'title' => 'What remains on the stack after the loop?', 'content' => 'If the input is `"((("`, the loop pushes 3 items and never enters the `else` branch.'],
                    ['level' => 'direction', 'title' => 'Verify empty stack at the end', 'content' => 'A valid string must leave the stack completely empty (`stack.length === 0` or `len(stack) == 0`).'],
                    ['level' => 'debugging_guidance', 'title' => 'Fix the final return statement', 'content' => 'Replace `return true;` with `return stack.length === 0;` (or `return len(stack) == 0` in Python).'],
                    ['level' => 'detailed_explanation', 'title' => 'LIFO Stack Invariant', 'content' => 'Every opening bracket is pushed onto the stack and must be popped by a matching closing bracket. At the end of the string, `stack.length === 0` confirms no unclosed openers remain.']
                ],
                'editorial' => "### LIFO Stack Validation\nChecking `stack.length === 0` upon loop completion is essential to catch inputs consisting solely of opening delimiters.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 15,
                'test_cases' => [
                    ['input' => "()[]{}", 'expected_output' => "true", 'is_hidden' => false, 'explanation' => 'Valid sequence'],
                    ['input' => "(]", 'expected_output' => "false", 'is_hidden' => false, 'explanation' => 'Mismatched closer'],
                    ['input' => "(((((", 'expected_output' => "false", 'is_hidden' => false, 'explanation' => 'Unclosed openers'],
                    ['input' => "([{}])", 'expected_output' => "true", 'is_hidden' => true, 'explanation' => 'Nested valid'],
                    ['input' => "]", 'expected_output' => "false", 'is_hidden' => true, 'explanation' => 'Empty stack underflow'],
                ]
            ],

            // 4. Merge Overlapping Intervals
            [
                'slug' => 'merge-overlapping-intervals',
                'title' => 'Cloud Scheduler: Merge Overlapping Maintenance Windows',
                'difficulty' => 'intermediate',
                'category' => 'algorithms_intervals',
                'framework' => 'Node.js / Python 3',
                'investigation_time_minutes' => 20,
                'description' => "Our cloud infrastructure scheduler receives an array of server maintenance windows `intervals` where `intervals[i] = [start_i, end_i]`. Merge all overlapping or touching maintenance windows and return the consolidated non-overlapping schedule sorted by start time.",
                'bug_report' => [
                    'issue_title' => 'Interval merger overwrites upper bound instead of taking Math.max(last[1], current[1])',
                    'symptoms' => 'When merging `[[1, 4], [2, 3]]`, the merged window shrinks to `[1, 3]` instead of remaining `[1, 4]` because `last[1] = current[1]` overwrites the wider outer interval.',
                    'expected_behavior' => 'When `current[0] <= last[1]`, update `last[1] = Math.max(last[1], current[1])`.',
                    'actual_behavior' => 'Assigns `last[1] = current[1]` unconditionally on overlap.',
                    'reproduction_steps' => [
                        '1. Pass input "[[1,4],[2,3]]".',
                        '2. Observe output is "[[1,3]]" instead of "[[1,4]]".'
                    ],
                ],
                'input_spec' => "Single line JSON array of interval pairs, e.g. `[[1,3],[2,6],[8,10],[15,18]]`",
                'output_spec' => "JSON array of merged pairs, e.g. `[[1,6],[8,10],[15,18]]`",
                'constraints' => [
                    "1 <= intervals.length <= 10^4",
                    "0 <= start_i <= end_i <= 10^4"
                ],
                'public_examples' => [
                    ['input' => "[[1,3],[2,6],[8,10],[15,18]]", 'output' => "[[1,6],[8,10],[15,18]]", 'explanation' => "[1,3] and [2,6] overlap into [1,6]."],
                    ['input' => "[[1,4],[2,3]]", 'output' => "[[1,4]]", 'explanation' => "[2,3] is completely contained inside [1,4]."]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst intervals = JSON.parse(fs.readFileSync(0, 'utf-8').trim());\n\nfunction merge(intervals) {\n    if (!intervals.length) return [];\n    intervals.sort((a, b) => a[0] - b[0]);\n    const merged = [intervals[0]];\n    for (let i = 1; i < intervals.length; i++) {\n        const current = intervals[i];\n        const last = merged[merged.length - 1];\n        if (current[0] <= last[1]) {\n            // BUG: Overwrites last[1] even when current[1] is smaller (nested interval)!\n            last[1] = current[1];\n        } else {\n            merged.push(current);\n        }\n    }\n    return merged;\n}\n\nconsole.log(JSON.stringify(merge(intervals)));",
                    'python' => "import sys, json\nintervals = json.loads(sys.stdin.read().strip())\n\ndef merge(intervals):\n    if not intervals:\n        return []\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for current in intervals[1:]:\n        last = merged[-1]\n        if current[0] <= last[1]:\n            # BUG: Overwrites last[1] even when current[1] is smaller!\n            last[1] = current[1]\n        else:\n            merged.append(current)\n    return merged\n\nprint(json.dumps(merge(intervals)))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['sorting', 'arrays', 'intervals'],
                'hints' => [
                    ['level' => 'nudge', 'title' => 'What if one interval is completely inside another?', 'content' => 'Consider `[1, 10]` followed by `[2, 5]`. What should the merged end time be?'],
                    ['level' => 'direction', 'title' => 'Preserve the maximum end time', 'content' => 'Use `Math.max(last[1], current[1])` (or `max(last[1], current[1])` in Python) when merging overlapping intervals.'],
                    ['level' => 'debugging_guidance', 'title' => 'Fix line 12 in merge()', 'content' => 'Change `last[1] = current[1]` to `last[1] = Math.max(last[1], current[1])`.'],
                    ['level' => 'detailed_explanation', 'title' => 'Greedy Interval Merge', 'content' => 'After sorting by start time, overlapping intervals satisfy `current[0] <= last[1]`. The combined window spans up to `max(last[1], current[1])`.']
                ],
                'editorial' => "### Greedy Interval Merging\nAlways take `max(last[1], current[1])` when merging overlapping intervals so nested sub-intervals do not truncate the outer window.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 16,
                'test_cases' => [
                    ['input' => "[[1,3],[2,6],[8,10],[15,18]]", 'expected_output' => "[[1,6],[8,10],[15,18]]", 'is_hidden' => false, 'explanation' => 'Partial overlap'],
                    ['input' => "[[1,4],[2,3]]", 'expected_output' => "[[1,4]]", 'is_hidden' => false, 'explanation' => 'Nested interval containment'],
                    ['input' => "[[1,4],[4,5]]", 'expected_output' => "[[1,5]]", 'is_hidden' => true, 'explanation' => 'Boundary touching'],
                    ['input' => "[[2,3],[4,5],[6,7],[8,9],[1,10]]", 'expected_output' => "[[1,10]]", 'is_hidden' => true, 'explanation' => 'Unsorted outer span'],
                ]
            ],

            // 5. Longest Substring Without Repeating Characters
            [
                'slug' => 'longest-substring-without-repeating',
                'title' => 'Stream Dedup: Longest Window of Unique Packet Identifiers',
                'difficulty' => 'intermediate',
                'category' => 'sliding_window',
                'framework' => 'Node.js / Python 3',
                'investigation_time_minutes' => 25,
                'description' => "Given a packet identifier stream represented as string `s`, compute the length of the longest contiguous window (substring) that contains no repeated characters.",
                'bug_report' => [
                    'issue_title' => 'Left window pointer regresses backward when encountering old duplicate outside current window',
                    'symptoms' => 'On input "abba", when inspecting the final "a" at index 3, `seen.get("a")` is 0, causing `left` to move backward from 2 to 1 and returning length 3 instead of 2.',
                    'expected_behavior' => 'Only advance `left` to `seen.get(char) + 1` if `seen.get(char) >= left` (or use `left = Math.max(left, seen.get(char) + 1)`).',
                    'actual_behavior' => 'Unconditionally sets `left = seen.get(char) + 1` even when `seen.get(char) < left`.',
                    'reproduction_steps' => [
                        '1. Pass input "abba".',
                        '2. Observe output is 3 instead of 2.'
                    ],
                ],
                'input_spec' => "Single line containing string `s`.",
                'output_spec' => "Integer length of the longest unique-character substring.",
                'constraints' => ["0 <= s.length <= 5 * 10^4"],
                'public_examples' => [
                    ['input' => "abcabcbb", 'output' => "3", 'explanation' => "Longest unique window is 'abc' (length 3)."],
                    ['input' => "abba", 'output' => "2", 'explanation' => "Longest unique window is 'ab' or 'ba' (length 2)."]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');\n\nfunction lengthOfLongestSubstring(s) {\n    const seen = new Map();\n    let maxLen = 0;\n    let left = 0;\n    for (let right = 0; right < s.length; right++) {\n        const char = s[right];\n        if (seen.has(char)) {\n            // BUG: Moves left pointer backward if seen.get(char) < left (e.g. 'abba')!\n            left = seen.get(char) + 1;\n        }\n        seen.set(char, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}\n\nconsole.log(lengthOfLongestSubstring(s));",
                    'python' => "import sys\ns = sys.stdin.read().rstrip('\\r\\n')\n\ndef length_of_longest_substring(s: str) -> int:\n    seen = {}\n    max_len = 0\n    left = 0\n    for right, char in enumerate(s):\n        if char in seen:\n            # BUG: Moves left backward when seen[char] < left!\n            left = seen[char] + 1\n        seen[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len\n\nprint(length_of_longest_substring(s))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['sliding_window', 'hash_maps', 'strings'],
                'hints' => [
                    ['level' => 'nudge', 'title' => 'Can the left boundary of a sliding window ever move left?', 'content' => 'Trace `s = "abba"`. At index 2 (`b`), `left` becomes 2. At index 3 (`a`), `seen["a"]` is 0. What happens if you set `left = 0 + 1`?'],
                    ['level' => 'direction', 'title' => 'Monotonically non-decreasing left pointer', 'content' => 'Ensure `left` never decreases by checking `seen.get(char) >= left` or using `left = Math.max(left, seen.get(char) + 1)`.'],
                    ['level' => 'debugging_guidance', 'title' => 'Guard the left pointer update', 'content' => 'Change `if (seen.has(char))` to `if (seen.has(char) && seen.get(char) >= left)`.'],
                    ['level' => 'detailed_explanation', 'title' => 'Sliding Window Invariant', 'content' => 'Characters at indices `< left` are already outside the active window. Only jump `left` forward when the duplicate character index is `>= left`.']
                ],
                'editorial' => "### Monotonic Sliding Window\nThe left pointer must only advance forward: `left = Math.max(left, seen.get(char) + 1)`. Allowing `left` to move backward re-includes previously evicted duplicate characters.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 17,
                'test_cases' => [
                    ['input' => "abcabcbb", 'expected_output' => "3", 'is_hidden' => false, 'explanation' => 'Repeating cycle'],
                    ['input' => "abba", 'expected_output' => "2", 'is_hidden' => false, 'explanation' => 'Left pointer regression trap'],
                    ['input' => "bbbbb", 'expected_output' => "1", 'is_hidden' => true, 'explanation' => 'Single char repeat'],
                    ['input' => "pwwkew", 'expected_output' => "3", 'is_hidden' => true, 'explanation' => 'Substring wke'],
                ]
            ],

            // 6. Missing Number in Sequence
            [
                'slug' => 'missing-number-xor-math',
                'title' => 'Packet Sequence Auditor: Detect Dropped Frame Number in [0..N]',
                'difficulty' => 'beginner',
                'category' => 'boundary_off_by_one',
                'framework' => 'Node.js / Python 3',
                'investigation_time_minutes' => 15,
                'description' => "A network receiver collects `n` distinct frame sequence numbers from the range `[0, n]`. Exactly one frame number in `[0, n]` was dropped in transit. Return the missing frame number in O(N) time and O(1) space.",
                'bug_report' => [
                    'issue_title' => 'Gauss sum formula uses (n - 1) instead of (n + 1)',
                    'symptoms' => 'For input "3,0,1" (n = 3, expected sum = 6, actual sum = 4), the starter code computes expectedSum = 3 * 2 / 2 = 3 and returns -1 instead of 2.',
                    'expected_behavior' => 'Sum of integers from `0` to `n` inclusive is `n * (n + 1) / 2`.',
                    'actual_behavior' => 'Computes `n * (n - 1) / 2`, which only sums up to `n - 1`.',
                    'reproduction_steps' => [
                        '1. Pass input "3,0,1".',
                        '2. Starter code outputs -1 instead of 2.'
                    ],
                ],
                'input_spec' => "Comma-separated integers, e.g. `3,0,1`",
                'output_spec' => "Single integer representing the missing sequence number, e.g. `2`",
                'constraints' => ["1 <= nums.length <= 10^4", "0 <= nums[i] <= n"],
                'public_examples' => [
                    ['input' => "3,0,1", 'output' => "2", 'explanation' => "Range is [0..3], sum is 6, actual sum is 4 -> missing 2."],
                    ['input' => "0,1", 'output' => "2", 'explanation' => "Range is [0..2], missing 2."]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst nums = fs.readFileSync(0, 'utf-8').trim().split(',').map(Number);\n\nfunction missingNumber(nums) {\n    const n = nums.length;\n    // BUG: Off-by-one in Gauss formula (uses n - 1 instead of n + 1)!\n    const expectedSum = (n * (n - 1)) / 2;\n    const actualSum = nums.reduce((acc, curr) => acc + curr, 0);\n    return expectedSum - actualSum;\n}\n\nconsole.log(missingNumber(nums));",
                    'python' => "import sys\nnums = [int(x) for x in sys.stdin.read().strip().split(',')]\n\ndef missing_number(nums):\n    n = len(nums)\n    # BUG: Off-by-one in Gauss formula (uses n - 1 instead of n + 1)!\n    expected_sum = n * (n - 1) // 2\n    return expected_sum - sum(nums)\n\nprint(missing_number(nums))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['math', 'arrays', 'bit_manipulation'],
                'hints' => [
                    ['level' => 'nudge', 'title' => 'Check the upper bound of the range [0..n]', 'content' => 'When `n = 3`, the complete range is `0, 1, 2, 3`, whose sum is `6`.'],
                    ['level' => 'direction', 'title' => 'Gauss summation formula', 'content' => 'The sum of `0` through `n` is `n * (n + 1) / 2`.'],
                    ['level' => 'debugging_guidance', 'title' => 'Fix `(n - 1)` to `(n + 1)`', 'content' => 'Change `(n * (n - 1)) / 2` to `(n * (n + 1)) / 2`.'],
                    ['level' => 'detailed_explanation', 'title' => 'O(N) Time, O(1) Space', 'content' => 'Subtracting `sum(nums)` from `n * (n + 1) / 2` yields the exact missing integer in a single pass.']
                ],
                'editorial' => "### Gauss Summation & Bitwise XOR\nThe sum of `[0..n]` is `n * (n + 1) / 2`. Subtracting the observed sum immediately isolates the missing number.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 18,
                'test_cases' => [
                    ['input' => "3,0,1", 'expected_output' => "2", 'is_hidden' => false, 'explanation' => 'Missing 2'],
                    ['input' => "0,1", 'expected_output' => "2", 'is_hidden' => false, 'explanation' => 'Missing upper boundary n'],
                    ['input' => "9,6,4,2,3,5,7,0,1", 'expected_output' => "8", 'is_hidden' => true, 'explanation' => 'Missing 8'],
                    ['input' => "1", 'expected_output' => "0", 'is_hidden' => true, 'explanation' => 'Missing 0'],
                ]
            ],

            // 7. Top-K Frequent Error Codes
            [
                'slug' => 'top-k-frequent-error-codes',
                'title' => 'Observability Aggregator: Top-K Most Frequent HTTP Error Codes',
                'difficulty' => 'intermediate',
                'category' => 'algorithms_lookup',
                'framework' => 'Node.js / Python 3',
                'investigation_time_minutes' => 20,
                'description' => "Our observability pipeline ingests a stream of numeric error codes `nums` and an integer `k`. Return the `k` most frequent error codes ordered from highest frequency to lowest frequency (if two codes have the exact same frequency, sort by smaller error code first) as a JSON array.",
                'bug_report' => [
                    'issue_title' => 'Frequency comparator sorts in ascending order instead of descending frequency',
                    'symptoms' => 'For nums = [500,500,500,404,404,403] and k = 2, the aggregator returns the least frequent codes [403, 404] instead of the most frequent [500, 404].',
                    'expected_behavior' => 'Sort by frequency descending (`freqB - freqA`), with ascending value tiebreaker (`a - b`), and slice the first `k` items.',
                    'actual_behavior' => 'Comparator uses `freqA - freqB` (ascending frequency).',
                    'reproduction_steps' => [
                        '1. Pass "1,1,1,2,2,3\\n2".',
                        '2. Observe output is "[3,2]" instead of "[1,2]".'
                    ],
                ],
                'input_spec' => "Line 1: Comma-separated integers `nums`\nLine 2: Integer `k`",
                'output_spec' => "JSON array of top `k` most frequent integers.",
                'constraints' => ["1 <= nums.length <= 10^5", "1 <= k <= number of unique elements"],
                'public_examples' => [
                    ['input' => "1,1,1,2,2,3\n2", 'output' => "[1,2]", 'explanation' => "1 appears 3 times, 2 appears 2 times."],
                    ['input' => "500,500,404,404,404,401\n1", 'output' => "[404]", 'explanation' => "404 has the highest frequency (3)."]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst nums = lines[0].split(',').map(Number);\nconst k = Number(lines[1]);\n\nfunction topKFrequent(nums, k) {\n    const freq = new Map();\n    for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);\n    // BUG: Sorts by ascending frequency instead of descending frequency!\n    return [...freq.keys()]\n        .sort((a, b) => freq.get(a) - freq.get(b) || a - b)\n        .slice(0, k);\n}\n\nconsole.log(JSON.stringify(topKFrequent(nums, k)));",
                    'python' => "import sys, json\nfrom collections import Counter\n\nlines = sys.stdin.read().strip().splitlines()\nnums = [int(x) for x in lines[0].split(',')]\nk = int(lines[1])\n\ndef top_k_frequent(nums, k):\n    counts = Counter(nums)\n    # BUG: Sorts by ascending count (counts[x]) instead of descending (-counts[x])!\n    ordered = sorted(counts.keys(), key=lambda x: (counts[x], x))\n    return ordered[:k]\n\nprint(json.dumps(top_k_frequent(nums, k)))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['hash_maps', 'sorting', 'arrays'],
                'hints' => [
                    ['level' => 'nudge', 'title' => 'Inspect the sort comparator direction', 'content' => 'Does `freq.get(a) - freq.get(b)` place the highest counts or lowest counts first?'],
                    ['level' => 'direction', 'title' => 'Descending count, ascending tiebreaker', 'content' => 'In JS use `freq.get(b) - freq.get(a) || a - b`. In Python use `key=lambda x: (-counts[x], x)`.'],
                    ['level' => 'debugging_guidance', 'title' => 'Invert the primary frequency comparison', 'content' => 'Change `freq.get(a) - freq.get(b)` to `freq.get(b) - freq.get(a)`.'],
                    ['level' => 'detailed_explanation', 'title' => 'Frequency Map & Bucket/Sort', 'content' => 'Count occurrences in O(N) using a Hash Map, sort unique keys by descending frequency (`b - a`), and slice the first `k` keys.']
                ],
                'editorial' => "### Frequency Aggregation & Tiebreaking\nSorting unique keys by `(-count, key)` guarantees deterministic Top-K ranking.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 19,
                'test_cases' => [
                    ['input' => "1,1,1,2,2,3\n2", 'expected_output' => "[1,2]", 'is_hidden' => false, 'explanation' => 'Top 2 codes'],
                    ['input' => "500,500,404,404,404,401\n1", 'expected_output' => "[404]", 'is_hidden' => false, 'explanation' => 'Top 1 error code'],
                    ['input' => "1\n1", 'expected_output' => "[1]", 'is_hidden' => true, 'explanation' => 'Single element'],
                    ['input' => "4,4,2,2,9\n2", 'expected_output' => "[2,4]", 'is_hidden' => true, 'explanation' => 'Tiebreaker orders smaller code first'],
                ]
            ],

            // 8. Rotated Sorted Array Search
            [
                'slug' => 'binary-search-rotated-log-index',
                'title' => 'Time-Series Ring Buffer: Search Target in Rotated Sorted Array',
                'difficulty' => 'intermediate',
                'category' => 'boundary_off_by_one',
                'framework' => 'Node.js / Python 3',
                'investigation_time_minutes' => 25,
                'description' => "Our circular ring buffer stores strictly increasing log timestamps that have been rotated at an unknown pivot index (e.g. `[4,5,6,7,0,1,2]`). Given the rotated array `nums` and a `target` value, return its 0-based index in `O(log N)` time, or `-1` if not found.",
                'bug_report' => [
                    'issue_title' => 'Binary search range check uses strict < instead of <= on sorted half boundaries',
                    'symptoms' => 'When target lies right on the boundary `nums[left]` or `nums[right]` (e.g., searching for `0` in `[4,5,6,7,0,1,2]`), the binary search discards the wrong half and returns `-1`.',
                    'expected_behavior' => 'Left-sorted check must use `nums[left] <= nums[mid]`, and boundary containment checks must include `nums[left] <= target` and `target <= nums[right]`.',
                    'actual_behavior' => 'Uses strict `<` comparisons on boundary endpoints, missing targets located at `nums[left]` or `nums[right]`.',
                    'reproduction_steps' => [
                        '1. Pass "4,5,6,7,0,1,2\\n0".',
                        '2. Observe starter code returns -1 instead of 4.'
                    ],
                ],
                'input_spec' => "Line 1: Comma-separated integers `nums`\nLine 2: Integer `target`",
                'output_spec' => "Single integer index (or `-1`).",
                'constraints' => ["1 <= nums.length <= 5000", "All values of nums are unique."],
                'public_examples' => [
                    ['input' => "4,5,6,7,0,1,2\n0", 'output' => "4", 'explanation' => "0 is at index 4."],
                    ['input' => "4,5,6,7,0,1,2\n3", 'output' => "-1", 'explanation' => "3 is not in the ring buffer."]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst nums = lines[0].split(',').map(Number);\nconst target = Number(lines[1]);\n\nfunction searchRotated(nums, target) {\n    let left = 0, right = nums.length - 1;\n    while (left <= right) {\n        const mid = Math.floor((left + right) / 2);\n        if (nums[mid] === target) return mid;\n\n        // BUG: Uses strict < instead of <= on boundary checks, missing endpoints!\n        if (nums[left] < nums[mid]) {\n            if (nums[left] < target && target < nums[mid]) {\n                right = mid - 1;\n            } else {\n                left = mid + 1;\n            }\n        } else {\n            if (nums[mid] < target && target < nums[right]) {\n                left = mid + 1;\n            } else {\n                right = mid - 1;\n            }\n        }\n    }\n    return -1;\n}\n\nconsole.log(searchRotated(nums, target));",
                    'python' => "import sys\nlines = sys.stdin.read().strip().splitlines()\nnums = [int(x) for x in lines[0].split(',')]\ntarget = int(lines[1])\n\ndef search_rotated(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        # BUG: Uses strict < instead of <= on boundary checks!\n        if nums[left] < nums[mid]:\n            if nums[left] < target < nums[mid]:\n                right = mid - 1\n            else:\n                left = mid + 1\n        else:\n            if nums[mid] < target < nums[right]:\n                left = mid + 1\n            else:\n                right = mid - 1\n    return -1\n\nprint(search_rotated(nums, target))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['binary_search', 'arrays'],
                'hints' => [
                    ['level' => 'nudge', 'title' => 'What if target equals nums[left] or nums[right]?', 'content' => 'What happens when `left == mid` (a 2-element subarray) or when `target == nums[left]`?'],
                    ['level' => 'direction', 'title' => 'Inclusive boundary inequalities', 'content' => 'Use `nums[left] <= nums[mid]`, `nums[left] <= target && target < nums[mid]`, and `nums[mid] < target && target <= nums[right]`.'],
                    ['level' => 'debugging_guidance', 'title' => 'Update the 3 strict `<` checks to `<=`', 'content' => 'Change `nums[left] < nums[mid]` to `<=`, `nums[left] < target` to `<=`, and `target < nums[right]` to `<=`.'],
                    ['level' => 'detailed_explanation', 'title' => 'Rotated Binary Search Invariant', 'content' => 'At least one half (`[left..mid]` or `[mid..right]`) is strictly sorted. Using `<=` on the outer endpoints ensures boundary elements and 2-element subarrays are handled accurately.']
                ],
                'editorial' => "### Rotated Binary Search Boundaries\nIn rotated binary search, `left` can equal `mid` when the window size is 2, so `nums[left] <= nums[mid]` and inclusive endpoint checks (`nums[left] <= target` and `target <= nums[right]`) are mandatory.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 20,
                'test_cases' => [
                    ['input' => "4,5,6,7,0,1,2\n0", 'expected_output' => "4", 'is_hidden' => false, 'explanation' => 'Target in right half'],
                    ['input' => "4,5,6,7,0,1,2\n3", 'expected_output' => "-1", 'is_hidden' => false, 'explanation' => 'Target absent'],
                    ['input' => "3,1\n1", 'expected_output' => "1", 'is_hidden' => true, 'explanation' => 'Two-element rotated array'],
                    ['input' => "5,1,3\n5", 'expected_output' => "0", 'is_hidden' => true, 'explanation' => 'Target at index 0 (nums[left])'],
                ]
            ],

            // 9. Product of Array Except Self
            [
                'slug' => 'product-of-array-except-self',
                'title' => 'Cluster Capacity Multiplier: Product of Array Except Self',
                'difficulty' => 'intermediate',
                'category' => 'logic_state',
                'framework' => 'Node.js / Python 3',
                'investigation_time_minutes' => 20,
                'description' => "Given an integer array `nums`, return a JSON array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nYou must write an algorithm that runs in `O(N)` time without using the division operator (to prevent divide-by-zero crashes when a node reports `0` capacity).",
                'bug_report' => [
                    'issue_title' => 'Suffix pass multiplies nums[i] BEFORE updating result[i], including self in product',
                    'symptoms' => 'For nums = [1, 2, 3, 4], output is [24, 24, 36, 48] instead of [24, 12, 8, 6] because the right-to-left suffix loop updates `suffix *= nums[i]` before multiplying into `result[i]`.',
                    'expected_behavior' => 'In the suffix pass, multiply `result[i] *= suffix` FIRST, and then update `suffix *= nums[i]` (and normalize `-0` to `0`).',
                    'actual_behavior' => 'Updates `suffix *= nums[i]` prior to `result[i] *= suffix`.',
                    'reproduction_steps' => [
                        '1. Pass input "1,2,3,4".',
                        '2. Starter code outputs "[24,24,36,48]" instead of "[24,12,8,6]".'
                    ],
                ],
                'input_spec' => "Comma-separated integers `nums`, e.g. `1,2,3,4`",
                'output_spec' => "JSON array of products, e.g. `[24,12,8,6]`",
                'constraints' => ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
                'public_examples' => [
                    ['input' => "1,2,3,4", 'output' => "[24,12,8,6]", 'explanation' => "Products excluding self: [2*3*4, 1*3*4, 1*2*4, 1*2*3]."],
                    ['input' => "-1,1,0,-3,3", 'output' => "[0,0,9,0,0]", 'explanation' => "Handles zero elements without division-by-zero."]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst nums = fs.readFileSync(0, 'utf-8').trim().split(',').map(Number);\n\nfunction productExceptSelf(nums) {\n    const n = nums.length;\n    const result = new Array(n).fill(1);\n    let prefix = 1;\n    for (let i = 0; i < n; i++) {\n        result[i] = prefix;\n        prefix *= nums[i];\n    }\n    let suffix = 1;\n    for (let i = n - 1; i >= 0; i--) {\n        // BUG: Multiplies suffix by nums[i] BEFORE updating result[i]!\n        suffix *= nums[i];\n        result[i] = (result[i] * suffix) || 0;\n    }\n    return result;\n}\n\nconsole.log(JSON.stringify(productExceptSelf(nums)));",
                    'python' => "import sys, json\nnums = [int(x) for x in sys.stdin.read().strip().split(',')]\n\ndef product_except_self(nums):\n    n = len(nums)\n    result = [1] * n\n    prefix = 1\n    for i in range(n):\n        result[i] = prefix\n        prefix *= nums[i]\n    suffix = 1\n    for i in range(n - 1, -1, -1):\n        # BUG: Multiplies suffix by nums[i] BEFORE updating result[i]!\n        suffix *= nums[i]\n        result[i] *= suffix\n    return result\n\nprint(json.dumps(product_except_self(nums)))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['arrays', 'math'],
                'hints' => [
                    ['level' => 'nudge', 'title' => 'Compare the prefix loop order with the suffix loop order', 'content' => 'In the prefix loop, `result[i]` is updated before `prefix *= nums[i]`. What is the suffix loop doing?'],
                    ['level' => 'direction', 'title' => 'Exclude nums[i] from suffix', 'content' => 'Multiply `result[i]` by `suffix` first, then multiply `suffix` by `nums[i]` for the next iteration to the left.'],
                    ['level' => 'debugging_guidance', 'title' => 'Swap the two lines inside the suffix loop', 'content' => 'Put `result[i] = (result[i] * suffix) || 0;` before `suffix *= nums[i];`.'],
                    ['level' => 'detailed_explanation', 'title' => 'Two-Pass Prefix & Suffix Accumulator', 'content' => 'Pass 1 stores the product of all elements to the left of `i`. Pass 2 multiplies by the product of all elements to the right of `i` in O(N) time and O(1) auxiliary space.']
                ],
                'editorial' => "### Prefix & Suffix Product Passes\nBy updating `result[i] *= suffix` prior to `suffix *= nums[i]`, each index accumulates `leftProduct * rightProduct` without ever dividing.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 21,
                'test_cases' => [
                    ['input' => "1,2,3,4", 'expected_output' => "[24,12,8,6]", 'is_hidden' => false, 'explanation' => 'Standard positive ints'],
                    ['input' => "-1,1,0,-3,3", 'expected_output' => "[0,0,9,0,0]", 'is_hidden' => false, 'explanation' => 'Contains zero'],
                    ['input' => "0,0", 'expected_output' => "[0,0]", 'is_hidden' => true, 'explanation' => 'Multiple zeros'],
                    ['input' => "2,3,5,0", 'expected_output' => "[0,0,0,30]", 'is_hidden' => true, 'explanation' => 'Trailing zero'],
                ]
            ],

            // 10. Monotonic Stack: Next Higher Latency Spike
            [
                'slug' => 'daily-latency-spike-span',
                'title' => 'APM Telemetry: Days Until Next Higher Server Latency Spike',
                'difficulty' => 'advanced',
                'category' => 'algorithms_stacks',
                'framework' => 'Node.js / Python 3',
                'investigation_time_minutes' => 25,
                'description' => "Given an array of daily p99 server latencies `temperatures`, return a JSON array `answer` such that `answer[i]` is the number of days you have to wait after the `i`-th day to observe a strictly higher latency spike. If there is no future day with a higher latency, set `answer[i] = 0`.",
                'bug_report' => [
                    'issue_title' => 'Monotonic stack stores latency values instead of array indices, computing value diff instead of index distance',
                    'symptoms' => 'For latencies [73, 74, 75, 71, 69, 72, 76, 73], the function fails because it pushes `temperatures[i]` instead of index `i` onto the stack.',
                    'expected_behavior' => 'Push index `i` onto the monotonic decreasing stack. When `temperatures[i] > temperatures[stack.top]`, pop `prevIndex` and set `answer[prevIndex] = i - prevIndex`.',
                    'actual_behavior' => 'Computes `i - stack.pop()` where `stack` held the temperature value or wrong index comparison.',
                    'reproduction_steps' => [
                        '1. Pass "73,74,75,71,69,72,76,73".',
                        '2. Observe output does not match "[1,1,4,2,1,1,0,0]".'
                    ],
                ],
                'input_spec' => "Comma-separated integers representing daily latencies, e.g. `73,74,75,71,69,72,76,73`",
                'output_spec' => "JSON array of wait days, e.g. `[1,1,4,2,1,1,0,0]`",
                'constraints' => ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"],
                'public_examples' => [
                    ['input' => "73,74,75,71,69,72,76,73", 'output' => "[1,1,4,2,1,1,0,0]", 'explanation' => "From day 2 (75), next higher is day 6 (76) -> 6 - 2 = 4 days."],
                    ['input' => "30,40,50,60", 'output' => "[1,1,1,0]", 'explanation' => "Strictly increasing latencies."]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst temps = fs.readFileSync(0, 'utf-8').trim().split(',').map(Number);\n\nfunction dailyLatencies(temps) {\n    const res = new Array(temps.length).fill(0);\n    const stack = []; // stores indices\n    for (let i = 0; i < temps.length; i++) {\n        // BUG: Uses >= instead of >, triggering on equal temperatures, and sets res[prev] = 1 instead of i - prev!\n        while (stack.length > 0 && temps[i] >= temps[stack[stack.length - 1]]) {\n            const prevIdx = stack.pop();\n            res[prevIdx] = 1;\n        }\n        stack.push(i);\n    }\n    return res;\n}\n\nconsole.log(JSON.stringify(dailyLatencies(temps)));",
                    'python' => "import sys, json\ntemps = [int(x) for x in sys.stdin.read().strip().split(',')]\n\ndef daily_latencies(temps):\n    res = [0] * len(temps)\n    stack = []\n    for i, t in enumerate(temps):\n        # BUG: Uses >= instead of > and assigns 1 instead of (i - prev_idx)!\n        while stack and t >= temps[stack[-1]]:\n            prev_idx = stack.pop()\n            res[prev_idx] = 1\n        stack.append(i)\n    return res\n\nprint(json.dumps(daily_latencies(temps)))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['stacks', 'arrays', 'data_structures'],
                'hints' => [
                    ['level' => 'nudge', 'title' => 'Strictly higher latency vs equal latency', 'content' => 'Should an equal latency trigger a pop? And how many days elapsed between `prevIdx` and `i`?'],
                    ['level' => 'direction', 'title' => 'Index difference `i - prevIdx` with strict `>`', 'content' => 'Compare `temps[i] > temps[stack.top]` (strictly greater) and record the elapsed days `res[prevIdx] = i - prevIdx`.'],
                    ['level' => 'debugging_guidance', 'title' => 'Fix comparison and distance assignment', 'content' => 'Change `>=` to `>` in the while loop condition, and change `res[prevIdx] = 1` to `res[prevIdx] = i - prevIdx`.'],
                    ['level' => 'detailed_explanation', 'title' => 'O(N) Monotonic Decreasing Stack', 'content' => 'Maintain a stack of unresolved indices whose temperatures are monotonically decreasing. When `temps[i] > temps[stack.top]`, pop `prevIdx` and set `res[prevIdx] = i - prevIdx` in O(N) total time.']
                ],
                'editorial' => "### Monotonic Stack Pattern\nEach index is pushed once and popped at most once, giving `O(N)` time complexity instead of `O(N^2)` nested scans.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 22,
                'test_cases' => [
                    ['input' => "73,74,75,71,69,72,76,73", 'expected_output' => "[1,1,4,2,1,1,0,0]", 'is_hidden' => false, 'explanation' => 'Mixed spikes'],
                    ['input' => "30,40,50,60", 'expected_output' => "[1,1,1,0]", 'is_hidden' => false, 'explanation' => 'Increasing sequence'],
                    ['input' => "89,62,70,58,47,47,46,76,100,70", 'expected_output' => "[8,1,5,4,3,2,1,1,0,0]", 'is_hidden' => true, 'explanation' => 'Duplicate plateau values (47, 47)'],
                    ['input' => "90,80,70", 'expected_output' => "[0,0,0]", 'is_hidden' => true, 'explanation' => 'Strictly decreasing'],
                ]
            ],
        ];

        foreach ($challenges as $data) {
            $testCases = $data['test_cases'];
            unset($data['test_cases']);

            $challenge = Challenge::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );

            $challenge->testCases()->delete();

            foreach ($testCases as $idx => $tc) {
                ChallengeTestCase::create([
                    'challenge_id' => $challenge->id,
                    'input' => $tc['input'],
                    'expected_output' => $tc['expected_output'],
                    'is_hidden' => $tc['is_hidden'],
                    'explanation' => $tc['explanation'] ?? null,
                    'order_index' => $idx + 1,
                ]);
            }
        }
    }
}
