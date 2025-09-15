'use client'; 

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-slate-50">
      <div className="text-center p-8">
        <h2 className="mb-4 text-3xl font-bold text-slate-800">
          Oops, something went wrong!
        </h2>
        <p className="text-slate-600 mb-8">
            An unexpected error occurred. You can try to reload the page or go back home.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
          >
            Try again
          </button>
          <Link href="/" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}
