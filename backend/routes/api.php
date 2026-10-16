<?php

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('v1')->group(function () {
    Route::get('/articles', [ArticleController::class, 'index']);
    Route::get('/articles/{slug}', [ArticleController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
});

// Rotas admin via HTTP (protegidas por X-Admin-Token)
Route::prefix('v1/admin')->group(function () {
    Route::post('/fetch-news', [AdminController::class, 'fetchNews']);
    Route::get('/status', [AdminController::class, 'status']);
    Route::apiResource('articles', ArticleController::class)->except(['index', 'show']);
});
