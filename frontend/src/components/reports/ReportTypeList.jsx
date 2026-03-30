export default function ReportTypeList({ reportOptions, selectedReportType, onSelect }) {
  return (
    <div className="scrollbar-hidden mt-6 space-y-3 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-2">
      {reportOptions.map((report) => {
        const isActive = report.id === selectedReportType;
        return (
          <button
            key={report.id}
            className={`flex w-full flex-wrap items-start justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition ${
              isActive
                ? "border-[#201914] bg-[#201914] text-[#f8f1e7]"
                : "border-[#eadfcd] bg-[#fffdf9] text-[#2a221b]"
            }`}
            onClick={() => onSelect(report.id)}
            type="button"
          >
            <div>
              <p className={`font-semibold ${isActive ? "text-[#f8f1e7]" : "text-[#2a221b]"}`}>
                {report.title}
              </p>
              <p className={`text-sm ${isActive ? "text-[#d8c9b2]" : "text-[#8a775f]"}`}>
                {report.description}
              </p>
            </div>
            <span
              className={`text-xs uppercase tracking-[0.2em] ${
                isActive ? "text-[#ddb65f]" : "text-[#b09a7e]"
              }`}
            >
              {isActive ? "Seleccionado" : "Elegir"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
