<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseOfferingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'integer', Rule::exists('subjects', 'id')],
            'teacher_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('role', 'teacher'),
            ],
            'day' => ['required', 'string', 'max:15'],
            'room' => ['required', 'string', 'max:30'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'sem' => ['required', 'string', Rule::in(['1ST', '2ND'])],
        ];
    }
}
