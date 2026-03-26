<?php

namespace App\Http\Requests;

use App\Models\Subject;
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
            'subject_name' => ['required', 'string', 'max:255'],
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

    /**
     * Get the validated data from the request, converting subject_name to subject_id.
     */
    public function validated(): array
    {
        $data = parent::validated();

        $subject = Subject::query()
            ->where('name', $data['subject_name'])
            ->first();

        if (! $subject) {
            $this->validator->errors()->add('subject_name', 'The selected subject does not exist.');

            throw new \Illuminate\Validation\ValidationException($this->validator);
        }

        $data['subject_id'] = $subject->id;
        unset($data['subject_name']);

        return $data;
    }
}
