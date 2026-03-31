import { useState } from "react";
import { usePwaStatus } from "../../contexts/PwaContext";

function bannerStyle(variant) {
  if (variant === "offline") {
    return "border-[#dec5bd] bg-[#fff4f1] text-[#8d5b4d]";
  }

  if (variant === "restored") {
    return "border-[#c9ddc7] bg-[#edf7ee] text-[#426748]";
  }

  if (variant === "update") {
    return "border-[#d8ceb8] bg-[#fcf8f2] text-[#6f5b3b]";
  }

  return "border-[#d7d3c8] bg-[#f8f6f1] text-[#5f5a50]";
}

export default function PwaStatusBanner() {
  const {
    isOnline,
    connectionBanner,
    needRefresh,
    offlineReady,
    canPromptInstall,
    shouldShowManualInstallGuide,
    installInstructionLabel,
    installInstructionHint,
    promptInstall,
    applyAppUpdate,
    dismissInstallGuide
  } = usePwaStatus();
  const [isInstalling, setIsInstalling] = useState(false);

  let variant = null;
  let title = "";
  let message = "";
  let actionLabel = "";
  let action = null;
  let secondaryActionLabel = "";
  let secondaryAction = null;

  if (needRefresh) {
    variant = "update";
    title = "Nueva version disponible";
    message = "Hay una actualizacion lista para activar. Recargala para usar la version mas reciente.";
    actionLabel = "Actualizar ahora";
    action = applyAppUpdate;
  } else if (!isOnline && connectionBanner === "offline") {
    variant = "offline";
    title = "Sin conexion";
    message =
      "La app sigue abierta desde cache, pero las vistas con datos en linea pueden fallar hasta que vuelva internet.";
  } else if (connectionBanner === "restored") {
    variant = "restored";
    title = "Conexion restaurada";
    message = "La red ya regreso. Puedes seguir operando y refrescar vistas que dependan de la API.";
  } else if (canPromptInstall) {
    variant = "install";
    title = "Instalar app";
    message =
      "Instala ATC POS para abrirlo como app independiente. En esta fase el shell abre offline, pero los datos siguen requiriendo conexion.";
    actionLabel = isInstalling ? "Instalando..." : "Instalar";
    action = async () => {
      setIsInstalling(true);
      try {
        await promptInstall();
      } finally {
        setIsInstalling(false);
      }
    };
  } else if (shouldShowManualInstallGuide) {
    variant = "install";
    title = installInstructionLabel;
    message =
      `${installInstructionHint} En esta fase la app se puede instalar y abrir sin red, pero los datos en vivo siguen necesitando conexion.`;
    secondaryActionLabel = "Ocultar";
    secondaryAction = dismissInstallGuide;
  } else if (offlineReady) {
    variant = "restored";
    title = "Modo instalable listo";
    message = "El shell de la app ya puede abrir desde cache cuando no tengas conexion.";
  }

  if (!variant) {
    return null;
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-[0_10px_28px_rgba(42,34,27,0.06)] ${bannerStyle(variant)}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
            PWA / conectividad
          </p>
          <p className="mt-1 font-serif text-lg">{title}</p>
          <p className="mt-1 text-sm leading-6">{message}</p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {secondaryAction ? (
            <button
              className="rounded-lg border border-current/20 bg-white/60 px-4 py-2 text-sm font-semibold transition hover:bg-white/80"
              onClick={secondaryAction}
              type="button"
            >
              {secondaryActionLabel}
            </button>
          ) : null}
          {action ? (
            <button
              className="rounded-lg border border-current/20 bg-white/80 px-4 py-2 text-sm font-semibold transition hover:bg-white"
              disabled={isInstalling}
              onClick={action}
              type="button"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
