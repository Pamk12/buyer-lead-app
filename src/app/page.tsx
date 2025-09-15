import Link from 'next/link';
import { auth } from '@/auth';
import { SignIn, SignOut } from '@/components/auth-buttons';
console.log(`[page.tsx] Is 'auth' a function when imported? ==> ${typeof auth === 'function'}`);
export default async function HomePage() {
  const session = await auth();
   

return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Buyer Lead Management
        </h1>
        {session?.user ? (
          <>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Welcome back, {session.user.name || session.user.email}!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/buyers" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                View All Buyers
              </Link>
              <SignOut />
            </div>
          </>
        ) : (
          <>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Your central hub for managing and tracking all buyer leads efficiently.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SignIn />
            </div>
          </>
        )}
      </div>
    </main>
  );
}