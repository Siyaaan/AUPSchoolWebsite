<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassRoster extends Model
{
    /** @use HasFactory<\Database\Factories\ClassRosterFactory> */
    use HasFactory;

    protected $table = 'class_roster';

    public $timestamps = false;

    protected $fillable = [
        'co_id',
        'student_id',
        'grade_id',
        'encoded_by',
        'date_encoded',
    ];

    public function courseOffering(): BelongsTo
    {
        return $this->belongsTo(CourseOffering::class, 'co_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(GradingSystem::class, 'grade_id');
    }

    public function encodedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'encoded_by');
    }
}
