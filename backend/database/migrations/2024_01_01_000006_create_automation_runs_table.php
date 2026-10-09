<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_id')->nullable()->constrained()->nullOnDelete();
            $table->string('job_type');
            $table->string('status')->default('running');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->integer('items_processed')->default(0);
            $table->integer('items_succeeded')->default(0);
            $table->integer('items_failed')->default(0);
            $table->decimal('estimated_cost', 10, 6)->default(0);
            $table->text('error_summary')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_runs');
    }
};
