import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-blue-50 text-blue-950">
                <header className="mx-auto w-full max-w-6xl px-6 py-6 lg:px-8">
                    <nav className="flex items-center justify-end gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-yellow-300"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>
                <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 pb-12 lg:px-8 lg:pb-16">
                    <section className="w-full rounded-2xl border border-blue-200 bg-white p-8 shadow-sm lg:p-12">
                        <div className="max-w-3xl space-y-6">
                            <p className="inline-flex rounded-full border border-yellow-200 bg-yellow-100 px-3 py-1 text-sm font-semibold text-blue-800">
                                Welcome
                            </p>
                            <h1 className="text-3xl font-semibold tracking-tight text-blue-900 lg:text-5xl">
                                Philippians 1:29 (NIV)
                            </h1>
                            <p className="text-base leading-7 text-blue-800 lg:text-lg">
                                "For it has been granted to you on behalf of Christ not only to believe on him, but also to suffer for him"
                            </p>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <Link
                                    href={login()}
                                    className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Login to your account
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center rounded-md border border-yellow-300 bg-yellow-100 px-5 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-yellow-200"
                                    >
                                        Create an account
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
