<?php

use App\Http\Controllers\AdminPanelController;
use App\Http\Controllers\AiCoachController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\EducatorPanelController;
use App\Http\Controllers\FeedbackNotificationController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\InterviewSessionController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\PostMortemController;
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

// Live Collaborative "Pair Debugging" Interview Mode (Accessible for both authenticated and guest interview rooms)
Route::post('/interviews', [InterviewSessionController::class, 'store']);
Route::get('/interviews/{sessionCode}', [InterviewSessionController::class, 'show']);
Route::post('/interviews/{sessionCode}/evaluate', [InterviewSessionController::class, 'evaluate']);

// Authenticated Endpoints (enforce active account status)
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    // Current User & Profile
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Learner Challenge Feedback / Issue Reporting
    Route::post('/challenges/{id}/feedback', [FeedbackNotificationController::class, 'reportChallengeIssue']);

    // Panel Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [FeedbackNotificationController::class, 'notifications']);
        Route::post('/read-all', [FeedbackNotificationController::class, 'markAllRead']);
        Route::post('/{id}/read', [FeedbackNotificationController::class, 'markNotificationRead']);
    });

    // Submissions & Assessment Engine (Rate Limited: max 15 submissions per min)
    Route::middleware('throttle:15,1')->group(function () {
        Route::post('/submissions', [SubmissionController::class, 'store']);
    });
    Route::get('/submissions', [SubmissionController::class, 'index']);
    Route::get('/submissions/{id}', [SubmissionController::class, 'show']);
    Route::post('/submissions/{id}/chaos-test', [SubmissionController::class, 'chaosTest']);

    // Incident Post-Mortem & RCA Studio
    Route::post('/challenges/{id}/post-mortem', [PostMortemController::class, 'store']);
    Route::get('/challenges/{id}/post-mortem', [PostMortemController::class, 'show']);

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

    // Legacy Authoring & Validation Endpoints (Educator & Admin)
    Route::prefix('admin')->middleware('role:educator,admin')->group(function () {
        Route::post('/challenges', [ChallengeController::class, 'store']);
        Route::post('/challenges/import-github', [ChallengeController::class, 'importGithub']);
        Route::post('/challenges/{id}/validate', [ChallengeController::class, 'validateChallenge']);
    });

    // Educator Panel — Teaching, Content Authoring, Feedback Inbox & Classrooms
    Route::prefix('educator')->middleware('role:educator,admin')->group(function () {
        Route::get('/overview', [EducatorPanelController::class, 'overview']);

        // Challenge Studio
        Route::get('/challenges', [EducatorPanelController::class, 'listChallenges']);
        Route::post('/challenges', [EducatorPanelController::class, 'createChallenge']);
        Route::get('/challenges/{id}', [EducatorPanelController::class, 'showChallenge']);
        Route::put('/challenges/{id}', [EducatorPanelController::class, 'updateChallenge']);
        Route::post('/challenges/{id}/validate', [EducatorPanelController::class, 'validateChallenge']);
        Route::post('/challenges/{id}/submit-review', [EducatorPanelController::class, 'submitForReview']);
        Route::post('/challenges/import-github', [ChallengeController::class, 'importGithub']);

        // Feedback & Issue Triage Inbox
        Route::get('/feedback', [EducatorPanelController::class, 'listFeedback']);
        Route::patch('/feedback/{id}', [EducatorPanelController::class, 'updateFeedback']);

        // Classrooms, Assigned Learners & Scoped Progress
        Route::get('/classrooms', [EducatorPanelController::class, 'listClassrooms']);
        Route::post('/classrooms', [EducatorPanelController::class, 'createClassroom']);
        Route::post('/classrooms/{id}/learners', [EducatorPanelController::class, 'addLearnerToClassroom']);
        Route::delete('/classrooms/{id}/learners/{learnerId}', [EducatorPanelController::class, 'removeLearnerFromClassroom']);
        Route::post('/classrooms/{id}/assignments', [EducatorPanelController::class, 'assignChallengeToClassroom']);
        Route::delete('/classrooms/{id}/assignments/{assignmentId}', [EducatorPanelController::class, 'removeAssignment']);
        Route::get('/classrooms/{id}/progress', [EducatorPanelController::class, 'classroomProgress']);
    });

    // Admin Panel — Platform Governance, Moderation, Users, Analytics, Audit & Settings
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/overview', [AdminPanelController::class, 'overview']);

        // User Management
        Route::get('/users', [AdminPanelController::class, 'listUsers']);
        Route::patch('/users/{id}/role', [AdminPanelController::class, 'updateUserRole']);
        Route::patch('/users/{id}/status', [AdminPanelController::class, 'updateUserStatus']);
        Route::get('/users/{id}/history', [AdminPanelController::class, 'userHistory']);

        // Challenge Moderation & Lifecycle
        Route::get('/challenges', [AdminPanelController::class, 'listChallenges']);
        Route::post('/challenges/bulk', [AdminPanelController::class, 'bulkChallenges']);
        Route::post('/challenges/{id}/approve', [AdminPanelController::class, 'approveChallenge']);
        Route::post('/challenges/{id}/request-changes', [AdminPanelController::class, 'requestChanges']);
        Route::post('/challenges/{id}/publish', [AdminPanelController::class, 'publishChallenge']);
        Route::post('/challenges/{id}/disable', [AdminPanelController::class, 'disableChallenge']);
        Route::post('/challenges/{id}/archive', [AdminPanelController::class, 'archiveChallenge']);
        Route::post('/challenges/{id}/restore', [AdminPanelController::class, 'restoreChallenge']);

        // Platform-Wide Feedback Moderation
        Route::get('/feedback', [AdminPanelController::class, 'listFeedback']);
        Route::patch('/feedback/{id}', [AdminPanelController::class, 'updateFeedback']);

        // Advanced Operations: Analytics, Audit Search & Safe Platform Settings
        Route::get('/analytics', [AdminPanelController::class, 'analytics']);
        Route::get('/audit-logs', [AdminPanelController::class, 'auditLogs']);
        Route::get('/settings', [AdminPanelController::class, 'getSettings']);
        Route::put('/settings', [AdminPanelController::class, 'updateSettings']);
    });
});
