import { signInWithGoogle, signOutAction } from '@/actions/auth-actions';

export function SignIn() {
  return (
    <form action={signInWithGoogle}>
      <button 
        type="submit"
        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
      >
        Sign in with Google
      </button>
    </form>
  );
}

export function SignOut() {
  return (
    <form action={signOutAction}>
      <button 
        type="submit"
        className="rounded-md bg-gray-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
      >
        Sign Out
      </button>
    </form>
  );
}