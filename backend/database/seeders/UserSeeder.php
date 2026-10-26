<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Learner User
        User::updateOrCreate(
            ['email' => 'learner@bugquest.ai'],
            [
                'name' => 'Alex Chen',
                'password' => Hash::make('password123'),
                'role' => 'learner',
                'target_role' => 'Full-Stack Software Engineer',
                'bio' => 'Aspiring software engineer focusing on algorithms, problem-solving, and web application architecture.',
                'settings' => [
                    'theme' => 'dark',
                    'default_language' => 'javascript',
                    'email_notifications' => true,
                ],
            ]
        );

        // Educator User
        User::updateOrCreate(
            ['email' => 'educator@bugquest.ai'],
            [
                'name' => 'Prof. Sarah Jenkins',
                'password' => Hash::make('password123'),
                'role' => 'educator',
                'target_role' => 'Computer Science Instructor',
                'bio' => 'Reviewing learner code submissions, progress trends, and curriculum alignment.',
                'settings' => [
                    'theme' => 'dark',
                    'default_language' => 'python',
                ],
            ]
        );

        // Administrator User
        User::updateOrCreate(
            ['email' => 'admin@bugquest.ai'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'target_role' => 'Platform Architect',
                'bio' => 'BugQuest AI operations and challenge curriculum management.',
                'settings' => [
                    'theme' => 'dark',
                ],
            ]
        );
    }
}
