<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\StorePeopleRequest;
use App\Http\Requests\UpdatePeopleRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PeopleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', User::class);

        return Inertia::render('People/Index', [
            'people' => User::query()
                ->where('role', '!=', UserRole::Admin->value)
                ->latest()
                ->get(),
            'roles' => [
                ['value' => UserRole::Teacher->value, 'label' => 'Teacher'],
                ['value' => UserRole::Student->value, 'label' => 'Student'],
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('People/Form', [
            'roles' => [
                ['value' => UserRole::Teacher->value, 'label' => 'Teacher'],
                ['value' => UserRole::Student->value, 'label' => 'Student'],
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePeopleRequest $request): RedirectResponse
    {
        User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
            'role' => $request->validated('role'),
        ]);

        return redirect()->route('people.index')->with('success', 'Person added successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $person): Response
    {
        Gate::authorize('update', $person);

        return Inertia::render('People/Form', [
            'person' => $person,
            'roles' => [
                ['value' => UserRole::Teacher->value, 'label' => 'Teacher'],
                ['value' => UserRole::Student->value, 'label' => 'Student'],
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePeopleRequest $request, User $person): RedirectResponse
    {
        $data = [
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'role' => $request->validated('role'),
        ];

        if ($request->validated('password')) {
            $data['password'] = Hash::make($request->validated('password'));
        }

        $person->update($data);

        return redirect()->route('people.index')->with('success', 'Person updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $person): RedirectResponse
    {
        Gate::authorize('delete', $person);

        $person->delete();

        return redirect()->route('people.index')->with('success', 'Person deleted successfully.');
    }
}
