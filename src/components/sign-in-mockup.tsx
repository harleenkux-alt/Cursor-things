export function SignInMockup() {
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-xl border border-[#d1d5db] bg-white p-6 shadow-sm">
      <div className="mb-1 text-lg font-bold text-[#111827]">Sign in</div>
      <p className="mb-5 text-sm text-[#6b7280]">Welcome back. Enter your details below.</p>

      <label className="mb-1 block text-xs font-semibold text-[#374151]">Email address</label>
      <div className="mb-4 h-10 rounded-lg border border-[#d1d5db] bg-[#f9fafb] px-3 py-2 text-sm text-[#9ca3af]">
        you@example.com
      </div>

      <label className="mb-1 block text-xs font-semibold text-[#374151]">Password</label>
      <div className="mb-2 h-10 rounded-lg border border-[#d1d5db] bg-[#f9fafb] px-3 py-2 text-sm text-[#9ca3af]">
        ••••••••
      </div>
      <div className="mb-5 text-right text-xs font-medium text-[#1f3a35]">Forgot password?</div>

      <div className="mb-4 h-11 rounded-lg bg-[#1f3a35] text-center text-sm font-semibold leading-[2.75rem] text-white">
        Sign in
      </div>

      <div className="text-center text-xs text-[#6b7280]">
        No account? <span className="font-semibold text-[#1f3a35]">Create one</span>
      </div>
    </div>
  );
}
