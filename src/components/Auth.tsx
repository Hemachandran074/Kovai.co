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
    /*
     * Canvas Base: #F8FAFC (Slate 50) — Level 0 flat base, no shadow.
     * Card: Level 1 — #FFFFFF + 1px #E2E8F0 border + shadow 0 1px 2px rgba(15,23,42,0.04)
     */
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#f8fafc' }}
    >
      <div
        className="w-full max-w-sm flex flex-col items-center gap-8 rounded-xl bg-white p-10 ks-shadow-1"
        style={{ border: '1px solid #e2e8f0' }}
      >
        {/* ── Logo mark ── */}
        <div className="flex items-center gap-3">
          {/* Primary container indigo pill avatar */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base"
            style={{ background: '#4f46e5' }}
          >
            T
          </div>
          {/* headline-md: Plus Jakarta Sans 18px 600 */}
          <span
            className="font-display font-semibold tracking-tight"
            style={{ fontSize: '18px', lineHeight: '26px', color: '#0f172a', letterSpacing: '-0.015em' }}
          >
            Task Manager
          </span>
        </div>

        {/* ── Copy ── */}
        <div className="text-center flex flex-col gap-1">
          {/* headline-lg: 24px 600 */}
          <h1
            className="font-display font-semibold"
            style={{ fontSize: '24px', lineHeight: '32px', color: '#0f172a', letterSpacing: '-0.02em' }}
          >
            Welcome back
          </h1>
          {/* body-md: Inter 14px 400 */}
          <p style={{ fontSize: '14px', lineHeight: '20px', color: '#64748b', letterSpacing: '-0.006em' }}>
            Sign in to access your personal board
          </p>
        </div>

        {/* ── Primary button (DESIGN.md §Buttons — Primary) ──
            Dark slate #0F172A bg, white text, inner top glow, hover #1E293B */}
        <button
          id="google-sign-in-btn"
          type="button"
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-2 rounded-md text-white transition-colors duration-150 focus:outline-none"
          style={{
            height: '36px',
            padding: '0 12px',
            fontSize: '14px',
            fontWeight: '500',
            letterSpacing: '-0.006em',
            background: '#0f172a',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0f172a')}
        >
          {/* Google G SVG */}
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        {/* label-sm: Inter 11px 600 0.02em — disabled/muted */}
        <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.02em', color: '#94a3b8', textAlign: 'center', textTransform: 'uppercase' }}>
          Your tasks are private &amp; visible only to you
        </p>
      </div>
    </div>
  )
}
