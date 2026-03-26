import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="page-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="mb-10 flex items-center justify-between gap-6">
          <div>
            <p className="eyebrow">Alternative Time</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Frontend base para crecer por modulos.
            </h1>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            Sprint Frontend 1
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
