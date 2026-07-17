export default function WabaLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Loading workspace…</p>
      </div>
    </div>
  );
}
