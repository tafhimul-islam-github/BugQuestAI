<?php

namespace App\Services;

use App\Models\PlatformSetting;
use App\Models\User;

class PlatformSettingService
{
    /**
     * Safe, non-secret platform settings defaults.
     * Never store API keys, tokens, or database credentials here.
     */
    public const DEFAULTS = [
        'feature_ai_coach_enabled' => [
            'value' => true,
            'category' => 'features',
            'description' => 'Enable progressive AI debugging coach hints in the learner workspace.',
        ],
        'feature_byob_import_enabled' => [
            'value' => true,
            'category' => 'features',
            'description' => 'Allow educators and admins to import sanitized GitHub issues as draft quests.',
        ],
        'feature_live_interviews_enabled' => [
            'value' => true,
            'category' => 'features',
            'description' => 'Enable collaborative pair-debugging live interview rooms.',
        ],
        'feature_educator_registration_enabled' => [
            'value' => true,
            'category' => 'features',
            'description' => 'Allow new accounts to register with the educator role directly.',
        ],
        'require_validation_before_review' => [
            'value' => false,
            'category' => 'moderation',
            'description' => 'Require passing mutation validation before educators can submit challenges for review.',
        ],
        'supported_languages' => [
            'value' => ['javascript', 'python', 'typescript'],
            'category' => 'languages',
            'description' => 'Programming languages enabled for challenge authoring and execution.',
        ],
        'challenge_categories' => [
            'value' => [
                'logic_state',
                'boundary_off_by_one',
                'auth_security',
                'data_parsing',
                'concurrency_race',
                'api_integration',
            ],
            'category' => 'curriculum',
            'description' => 'Active defect categories available in the challenge studio and library.',
        ],
    ];

    public static function ensureDefaults(): void
    {
        foreach (self::DEFAULTS as $key => $config) {
            PlatformSetting::firstOrCreate(
                ['key' => $key],
                [
                    'value' => $config['value'],
                    'category' => $config['category'],
                    'description' => $config['description'],
                ]
            );
        }
    }

    public static function allGrouped(): array
    {
        self::ensureDefaults();

        return PlatformSetting::with('updater:id,name')
            ->orderBy('category')
            ->orderBy('key')
            ->get()
            ->map(fn (PlatformSetting $s) => [
                'key' => $s->key,
                'value' => $s->value,
                'category' => $s->category,
                'description' => $s->description,
                'updated_by' => $s->updater?->name,
                'updated_at' => $s->updated_at?->toIso8601String(),
            ])
            ->all();
    }

    public static function getValue(string $key, mixed $fallback = null): mixed
    {
        $setting = PlatformSetting::where('key', $key)->first();
        if ($setting) {
            return $setting->value;
        }

        return self::DEFAULTS[$key]['value'] ?? $fallback;
    }

    public static function updateMany(array $updates, User $actor): array
    {
        self::ensureDefaults();

        $allowedKeys = array_keys(self::DEFAULTS);
        $changed = [];

        foreach ($updates as $key => $value) {
            if (!in_array($key, $allowedKeys, true)) {
                continue;
            }

            $setting = PlatformSetting::where('key', $key)->first();
            if (!$setting) {
                continue;
            }

            $oldValue = $setting->value;
            if ($oldValue !== $value) {
                $setting->update([
                    'value' => $value,
                    'updated_by' => $actor->id,
                ]);
                $changed[$key] = ['from' => $oldValue, 'to' => $value];
            }
        }

        return $changed;
    }
}
