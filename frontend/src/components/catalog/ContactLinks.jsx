const whatsappUrl =
  import.meta.env.VITE_WHATSAPP_URL || "https://wa.me/";
const instagramUrl =
  import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/";

export default function ContactLinks({
  productName = "",
  compact = false,
  message = "",
  whatsappLabel = "WhatsApp",
  showInstagram = true,
  orientation = "row"
}) {
  const whatsappMessage = message || (productName ? `Hola, me interesa el reloj ${productName}.` : "");
  const whatsappHref = whatsappMessage
    ? `${whatsappUrl}${whatsappUrl.includes("?") ? "&" : "?"}text=${encodeURIComponent(whatsappMessage)}`
    : whatsappUrl;
  const sharedClass = compact
    ? "inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold"
    : "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold";

  return (
    <div className={`flex gap-3 ${orientation === "column" ? "flex-col items-start" : "flex-wrap"}`}>
      <a
        className={`${sharedClass} bg-[#c9a85f] text-[#16130f] transition hover:bg-[#dfc075]`}
        href={whatsappHref}
        rel="noreferrer"
        target="_blank"
      >
        {whatsappLabel}
      </a>
      {showInstagram ? (
        <a
          className={`${sharedClass} border border-white/25 bg-white/5 text-white transition hover:bg-white/10`}
          href={instagramUrl}
          rel="noreferrer"
          target="_blank"
        >
          Instagram
        </a>
      ) : null}
    </div>
  );
}
