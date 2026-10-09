<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sources', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('base_url');
            $table->string('source_type');
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('language')->default('pt');
            $table->boolean('is_active')->default(true);
            $table->integer('trust_level')->default(5);
            $table->timestamp('last_fetched_at')->nullable();
            $table->json('configuration')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sources');
    }
};
