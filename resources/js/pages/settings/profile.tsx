import { Transition } from '@headlessui/react';
import { Form, Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit(),
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
    avatarUrl,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    avatarUrl?: string | null;
}) {
    const { auth } = usePage().props;

    const avatarForm = useForm<{ avatar: File | null }>({ avatar: null });
    const fileInputRef = useRef<HTMLInputElement>(null);

    function submitAvatar(e: React.FormEvent) {
        e.preventDefault();
        avatarForm.post('/settings/profile/avatar', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                avatarForm.reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile picture"
                        description="Upload a profile photo (JPG, PNG or WebP, max 2 MB)"
                    />

                    <div className="flex items-center gap-6">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Profile picture"
                                className="h-20 w-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <form onSubmit={submitAvatar} className="flex items-center gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="avatar">Choose photo</Label>
                                <Input
                                    id="avatar"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) =>
                                        avatarForm.setData('avatar', e.target.files?.[0] ?? null)
                                    }
                                    className="cursor-pointer"
                                />
                                {avatarForm.errors.avatar && (
                                    <p className="text-sm text-destructive">{avatarForm.errors.avatar}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={avatarForm.processing || !avatarForm.data.avatar}
                                className="mt-6"
                            >
                                Upload
                            </Button>
                        </form>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
