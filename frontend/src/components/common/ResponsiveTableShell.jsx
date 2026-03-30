export default function ResponsiveTableShell({
  mobileContent,
  desktopContent,
  bordered = true,
  mobileMaxHeightClass = "max-h-[52vh]",
  desktopMaxHeightClass = "max-h-[58vh]"
}) {
  return (
    <section className={bordered ? "overflow-hidden rounded-2xl border border-[#ddcfba] bg-[#fbf7f0]" : ""}>
      <div className={`grid gap-3 overflow-y-auto p-3 md:hidden ${mobileMaxHeightClass}`}>
        {mobileContent}
      </div>
      <div className={`hidden overflow-auto md:block ${desktopMaxHeightClass}`}>{desktopContent}</div>
    </section>
  );
}
