export function SignInMockup() {
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="font-serif mb-1 text-xl font-bold">Sign in</div>
      <p className="mb-5 text-sm text-[var(--muted-foreground)]">Welcome back. Enter your details below.</p>

      <label className="mb-1 block text-xs font-semibold">Email address</label>
      <div className="mb-4 h-10 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--muted-foreground)]">
        you@example.com
      </div>

      <label className="mb-1 block text-xs font-semibold">Password</label>
      <div className="mb-2 h-10 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--muted-foreground)]">
        ••••••••
      </div>
      <div className="mb-5 text-right text-xs font-medium underline">Forgot password?</div>

      <div className="mb-4 h-11 rounded-full bg-[var(--primary)] text-center text-sm font-semibold leading-[2.75rem] text-white">
        Sign in
      </div>

      <div className="text-center text-xs text-[var(--muted-foreground)]">
        No account? <span className="font-semibold text-[var(--foreground)]">Create one</span>
      </div>
    </div>
  );
}
