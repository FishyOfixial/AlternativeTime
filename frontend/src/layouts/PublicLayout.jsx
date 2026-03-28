import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="page-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="mb-8 flex items-center justify-between gap-6 border-b border-[#dacdb8] pb-6">
          <div>
            <p className="eyebrow">Alternative Time Co.</p>
            <h1 className="mt-3 font-serif text-2xl tracking-tight text-[#2a221b] sm:text-3xl">
              Vintage · Classic · Timeless
            </h1>
          </div>
          <div className="rounded-full border border-[#ddcfba] bg-[#fbf6ee] px-4 py-2 text-sm text-[#7d6751]">
            Sprint Frontend 1
          </div>
        </header>
        <main className="flex flex-1 items-start">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
