<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('viewer')->after('password');
            $table->timestamp('last_active_at')->nullable()->after('role');
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('client')->nullable();
            $table->string('video_url')->nullable();
            $table->string('thumbnail')->nullable();
            $table->string('status')->default('draft'); // published | draft | review
            $table->unsignedBigInteger('views')->default(0);
            $table->date('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('company')->nullable();
            $table->string('email');
            $table->string('type')->nullable();
            $table->string('budget')->nullable();
            $table->text('message')->nullable();
            $table->boolean('unread')->default(true);
            $table->timestamps();
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('daily_views', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->unsignedBigInteger('views')->default(0);
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('studio_name')->default('KML Production');
            $table->string('contact_email')->default('hello@kmlproduction.com');
            $table->boolean('email_on_inquiries')->default(true);
            $table->boolean('auto_publish')->default(true);
            $table->boolean('show_drafts')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('daily_views');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('inquiries');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('categories');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'last_active_at']);
        });
    }
};
