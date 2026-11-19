<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\PanelNotification;
use App\Models\User;
use Illuminate\Http\Request;

class AuditService
{
    public static function record(
        ?User $actor,
        string $action,
        string $summary,
        ?string $targetType = null,
        ?int $targetId = null,
        array $metadata = [],
        ?Request $request = null
    ): AuditLog {
        return AuditLog::create([
            'actor_id' => $actor?->id,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'summary' => $summary,
            'metadata' => empty($metadata) ? null : $metadata,
            'ip_address' => $request?->ip(),
            'created_at' => now(),
        ]);
    }

    public static function notify(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?string $link = null
    ): PanelNotification {
        return PanelNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
        ]);
    }
}
