<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourseOffering extends Model
{
    /** @use HasFactory<\Database\Factories\CourseOfferingFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'subject_id',
        'day',
        'room',
        'start_time',
        'end_time',
        'teacher_id',
        'year',
        'sem',
        'encoded_by',
        'date_encoded',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function classRoster(): HasMany
    {
        return $this->hasMany(ClassRoster::class, 'co_id');
    }
}
