import { FormEvent, useState } from 'react'
import { Link, useForm } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Role {
  value: string
  label: string
}

interface Person {
  id: number
  name: string
  email: string
  role: 'teacher' | 'student'
}

interface PeopleFormProps {
  person?: Person
  roles: Role[]
}

export default function PeopleForm({ person, roles }: PeopleFormProps) {
  const isEdit = !!person
  const [selectedRole, setSelectedRole] = useState(person?.role || '')

  const { data, setData, post, put, processing, errors } = useForm({
    name: person?.name || '',
    email: person?.email || '',
    password: '',
    password_confirmation: '',
    role: person?.role || '',
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isEdit) {
      put(`/people/${person.id}`, {
        onSuccess: () => {
          // Redirect handled by Laravel
        },
      })
    } else {
      post('/people', {
        onSuccess: () => {
          // Redirect handled by Laravel
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/people">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Edit Person' : 'Add New Person'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isEdit
              ? `Update ${person?.name}'s information`
              : 'Create a new student or teacher account'}
          </p>
        </div>
      </div>

      <form className="rounded-lg border bg-white p-6" onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={data.role}
              onValueChange={(value) => setData('role', value)}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEdit && <span className="text-gray-500">(leave blank to keep current)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isEdit ? 'Enter to change password' : 'Create a strong password'}
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
            {!isEdit && (
              <p className="text-xs text-gray-500">Minimum 8 characters</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 border-t pt-6">
            <Button type="submit" disabled={processing}>
              {processing ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/people">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
