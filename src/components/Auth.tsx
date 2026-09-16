import { supabase } from '../supabaseClient'

export function Auth() {
  async function handleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) console.error('Sign-in error:', error.message)
  }

  return (
    <div className="board-bg min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-10 w-full max-w-sm flex flex-col items-center gap-7">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
            T
          </div>
          <span className="font-display font-bold text-slate-900 text-xl tracking-wide">
            TASK
          </span>
        </div>

        {/* Copy */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to access your personal board
          </p>
        </div>

        {/* Google button */}
        <button
          id="google-sign-in-btn"
          type="button"
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-sm font-medium rounded-xl px-4 py-3 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:ring-offset-2"
        >
          {/* Google G */}
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <p className="text-xs text-slate-400 text-center">
          Your tasks are private and visible only to you.
        </p>
      </div>
    </div>
  )
}
