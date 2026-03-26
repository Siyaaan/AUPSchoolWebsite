<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;

class PromoteAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:promote-admin {email : Email address of the user to promote}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Promote an existing user account to admin role';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = (string) $this->argument('email');

        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            $this->error("User with email '{$email}' was not found.");

            return self::FAILURE;
        }

        $user->forceFill([
            'role' => UserRole::Admin,
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();

        $this->info("{$user->email} is now an admin.");

        return self::SUCCESS;
    }
}
