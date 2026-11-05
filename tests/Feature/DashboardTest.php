<?php

use App\Models\User;

test('users can visit the operations dashboard', function () {
    $this->get('/dashboard')->assertOk();
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});