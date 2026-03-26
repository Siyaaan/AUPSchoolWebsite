<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\StoreAdminUserRequest;
use App\Http\Requests\UpdateAdminUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    /**
     * Display a listing of managed users.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', User::class);

        return Inertia::render('Users/Index', [
            'users' => User::query()
                ->whereIn('role', [UserRole::Teacher->value, UserRole::Admin->value, UserRole::Student->value])
                ->latest()
                ->get(),
            'roles' => [
                ['value' => UserRole::Teacher->value, 'label' => 'Teacher'],
                ['value' => UserRole::Admin->value, 'label' => 'Admin'],
                ['value' => UserRole::Student->value, 'label' => 'Student'],
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAdminUserRequest $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
            'role' => $request->validated('role'),
        ]);

        return redirect()->route('users.index')->with('success', 'User added successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAdminUserRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $data = [
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'role' => $request->validated('role'),
        ];

        if ($request->validated('password')) {
            $data['password'] = Hash::make($request->validated('password'));
        }

        $user->update($data);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }
}
