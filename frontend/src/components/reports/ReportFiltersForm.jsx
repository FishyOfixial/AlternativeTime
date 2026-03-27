import ReportTypeList from "./ReportTypeList";

export default function ReportFiltersForm({
  reportOptions,
  selectedReportType,
  onSelectReportType,
  rangeOptions,
  selectedRange,
  onRangeChange,
  selectedYear,
  years,
  onYearChange,
  activeFilters,
  filters,
  onFilterChange,
  channelOptions,
  paymentOptions,
  accountOptions,
  entryTypeOptions,
  inventoryStatusOptions,
  inventoryTagOptions,
  clients,
  clientsError,
  exportFormat,
  onExportFormatChange,
  isExporting,
  onGenerate
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.6fr]">
      <div className="panel-surface p-6">
        <div>
          <p className="eyebrow">Reportes disponibles</p>
          <h2 className="mt-2 font-serif text-2xl text-[#2a221b]">
            Reportes disponibles
          </h2>
          <p className="mt-2 text-sm text-[#8a775f]">
            Selecciona un reporte para configurar filtros.
          </p>
        </div>
        <ReportTypeList
          reportOptions={reportOptions}
          selectedReportType={selectedReportType}
          onSelect={onSelectReportType}
        />
      </div>

      <div className="space-y-5">
        <section className="panel-surface p-5">
          <p className="eyebrow">Configurar reporte</p>
          <h3 className="mt-2 font-serif text-2xl text-[#2a221b]">Configurar reporte</h3>

          <div className="mt-4 grid gap-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Reporte seleccionado
              </span>
              <p className="mt-2 text-sm text-[#5d5144]">
                {reportOptions.find((option) => option.id === selectedReportType)?.title ||
                  "Selecciona un reporte"}
              </p>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Rango temporal
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {rangeOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      selectedRange === option.value
                        ? "bg-[#201914] text-[#ddb65f]"
                        : "bg-[#f7f1e8] text-[#7d6751]"
                    }`}
                    onClick={() => onRangeChange(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-[#8a775f]">
                Este rango se aplica a la exportacion si no eliges fechas.
              </p>
            </label>

            {selectedRange === "year" ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Año
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  onChange={(event) => onYearChange(Number(event.target.value))}
                  value={selectedYear}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {activeFilters.includes("date_from") ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Fecha inicio
                  </span>
                  <input
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    name="date_from"
                    onChange={onFilterChange}
                    type="date"
                    value={filters.date_from}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Fecha fin
                  </span>
                  <input
                    className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                    name="date_to"
                    onChange={onFilterChange}
                    type="date"
                    value={filters.date_to}
                  />
                </label>
              </div>
            ) : null}

            {activeFilters.includes("brand") ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Marca
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="brand"
                  onChange={onFilterChange}
                  placeholder="Ej. Seiko"
                  value={filters.brand}
                />
              </label>
            ) : null}

            {activeFilters.includes("channel") ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Canal
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="channel"
                  onChange={onFilterChange}
                  value={filters.channel}
                >
                  {channelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {activeFilters.includes("payment_method") ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Metodo de pago
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="payment_method"
                  onChange={onFilterChange}
                  value={filters.payment_method}
                >
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {activeFilters.includes("account") ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Cuenta
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="account"
                  onChange={onFilterChange}
                  value={filters.account}
                >
                  {accountOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {activeFilters.includes("type") ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Tipo de movimiento
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="type"
                  onChange={onFilterChange}
                  value={filters.type}
                >
                  {entryTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {activeFilters.includes("status") ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Estado de inventario
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="status"
                  onChange={onFilterChange}
                  value={filters.status}
                >
                  {inventoryStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {activeFilters.includes("tag") ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Etiqueta de inventario
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="tag"
                  onChange={onFilterChange}
                  value={filters.tag}
                >
                  {inventoryTagOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {activeFilters.includes("customer_id") ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Cliente
                </span>
                <select
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="customer_id"
                  onChange={onFilterChange}
                  value={filters.customer_id}
                >
                  <option value="">Todos</option>
                  {clients.map((client) => {
                    const labelParts = [
                      client.name,
                      client.phone,
                      client.instagram_handle,
                      client.email
                    ].filter(Boolean);
                    return (
                      <option key={client.id} value={client.id}>
                        {labelParts.join(" · ")}
                      </option>
                    );
                  })}
                </select>
                {clientsError ? (
                  <p className="mt-2 text-xs text-[#9b6a5b]">
                    No pudimos cargar clientes. Puedes dejar el filtro en "Todos".
                  </p>
                ) : null}
              </label>
            ) : null}

            {activeFilters.includes("dias_minimos") ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Dias minimos (productos lentos)
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-[#dccfb9] bg-[#fffdf9] px-4 py-3"
                  name="dias_minimos"
                  onChange={onFilterChange}
                  placeholder="60"
                  value={filters.dias_minimos}
                />
              </label>
            ) : null}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Formato de exportacion
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  className={`rounded-md border px-4 py-2 text-xs ${
                    exportFormat === "xlsx"
                      ? "border-[#201914] bg-[#201914] text-[#ddb65f]"
                      : "border-[#dccfb9] bg-[#fffdf9] text-[#7d6751]"
                  }`}
                  onClick={() => onExportFormatChange("xlsx")}
                  type="button"
                >
                  Excel
                </button>
                <button
                  className={`rounded-md border px-4 py-2 text-xs ${
                    exportFormat === "csv"
                      ? "border-[#201914] bg-[#201914] text-[#ddb65f]"
                      : "border-[#dccfb9] bg-[#fffdf9] text-[#7d6751]"
                  }`}
                  onClick={() => onExportFormatChange("csv")}
                  type="button"
                >
                  CSV
                </button>
              </div>
            </div>

            <button
              className="gold-button w-full px-4 py-2 text-xs"
              disabled={isExporting}
              onClick={onGenerate}
              type="button"
            >
              {isExporting ? "Generando..." : "Generar reporte"}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
