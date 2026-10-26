<?php

use App\Http\Controllers\AiCoachController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\ReadinessReportController;
use App\Http\Controllers\SubmissionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| BugQuest AI REST API Routes
|--------------------------------------------------------------------------
*/

// Public Health & Diagnostics
Route::get('/health', [HealthController::class, 'check']);

// Public Authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Challenges (Public with optional user context for completion status)
Route::get('/challenges', [ChallengeController::class, 'index']);
Route::get('/challenges/{slugOrId}', [ChallengeController::class, 'show']);

// Public Read-Only Share Token Access (Consent Based)
Route::get('/reports/shared/{shareToken}', [ReadinessReportController::class, 'getPublicSharedReport']);

// Authenticated Endpoints
Route::middleware('auth:sanctum')->group(function () {
    // Current User & Profile
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Submissions & Assessment Engine (Rate Limited: max 15 submissions per min)
    Route::middleware('throttle:15,1')->group(function () {
        Route::post('/submissions', [SubmissionController::class, 'store']);
    });
    Route::get('/submissions', [SubmissionController::class, 'index']);
    Route::get('/submissions/{id}', [SubmissionController::class, 'show']);

    // AI Debugging Coach (Rate Limited: max 20 hints per min)
    Route::middleware('throttle:20,1')->group(function () {
        Route::post('/ai/hint', [AiCoachController::class, 'requestHint']);
    });
    Route::get('/ai/history/{challengeId}', [AiCoachController::class, 'history']);

    // Learning Intelligence & Evidence
    Route::prefix('learning')->group(function () {
        Route::get('/profile', [LearningController::class, 'getSkillProfile']);
        Route::get('/recommendations', [LearningController::class, 'getRecommendations']);
        Route::post('/recommendations/{id}/dismiss', [LearningController::class, 'dismissRecommendation']);
    });

    // Readiness Reports & Consent Sharing
    Route::prefix('reports')->group(function () {
        Route::post('/generate', [ReadinessReportController::class, 'generate']);
        Route::get('/', [ReadinessReportController::class, 'listUserReports']);
        Route::get('/{uuid}', [ReadinessReportController::class, 'getReport']);
        Route::post('/{uuid}/share', [ReadinessReportController::class, 'createShareToken']);
        Route::post('/share/{token}/revoke', [ReadinessReportController::class, 'revokeShareToken']);
    });

    // Administrative Management
    Route::prefix('admin')->group(function () {
        Route::post('/challenges', [ChallengeController::class, 'adminStore']);
    });
});
