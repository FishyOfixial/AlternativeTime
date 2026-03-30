import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { navigationLinks } from "../../constants/navigation";

export default function MobileSidebarDrawer({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  function handleLogout() {
    onClose();
    logout();
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 lg:hidden" role="dialog">
      <button
        aria-label="Cerrar menu"
        className="absolute inset-0 bg-[#120f0b]/60"
        onClick={onClose}
        type="button"
      />

      <aside className="relative flex h-full max-h-screen w-80 max-w-[84vw] flex-col overflow-y-auto border-r border-[#3c3023] bg-[#211b16]">
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <p className="font-brand text-xl text-[#d9b35f]">Alternative Time Co.</p>
          <button
            ref={closeButtonRef}
            aria-label="Cerrar menu"
            className="rounded-md border border-[#4a3d2e] px-3 py-2 text-xs text-[#d8cab6]"
            onClick={onClose}
            type="button"
          >
            Cerrar
          </button>
        </div>

        <div className="flex-1 border-y border-[#34291d] px-5 py-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6f5c49]">Navegacion</p>
          <nav className="mt-4 flex flex-col gap-2">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
                onClick={onClose}
              >
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-[#34291d] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 text-sm text-[#8f7b63]">
          <p className="font-semibold text-[#d8cab6]">{user?.first_name || user?.username || "Admin"}</p>
          <p className="mt-1 text-xs">{user?.email || "Sesion activa"}</p>
          <button
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[#4a3d2e] bg-[#2a2119] px-4 py-3 text-sm font-semibold text-[#e2ba63] transition hover:bg-[#34291f] hover:text-[#f5d07a]"
            onClick={handleLogout}
            type="button"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>
    </div>
  );
}
