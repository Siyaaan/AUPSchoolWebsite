<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GradingSystem extends Model
{
    /** @use HasFactory<\Database\Factories\GradingSystemFactory> */
    use HasFactory;

    protected $table = 'grading_system';

    public $timestamps = false;

    protected $fillable = [
        'letter_grade',
        'points',
    ];

    public function classRoster(): HasMany
    {
        return $this->hasMany(ClassRoster::class, 'grade_id');
    }
}
