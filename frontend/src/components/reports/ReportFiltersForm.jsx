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
  isExporting,
  onGenerate
}) {
  const selectedReport = reportOptions.find((option) => option.id === selectedReportType);
  const isSalesByMonthReport = selectedReportType === "sales-by-month";
  const compactLabelClassName =
    "text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]";
  const fieldClassName =
    "mt-2 block w-full max-w-full min-w-0 appearance-none rounded-xl border border-[#dccfb9] bg-[#fffdf9] px-4 py-2 text-sm text-[#2a221b] outline-none transition placeholder:text-[#b8aa95] focus:border-[#c7a55b]";

  return (
    <section className="grid gap-6 xl:h-full xl:min-h-0 xl:grid-cols-[1.2fr_0.6fr] xl:items-start">
      <div className="hidden panel-surface p-6 md:block xl:sticky xl:top-8 xl:flex xl:max-h-[calc(100vh-8rem)] xl:min-h-0 xl:flex-col xl:overflow-hidden">
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

      <div className="space-y-2 xl:sticky xl:top-8 xl:h-fit">
        <section className="scrollbar-hidden panel-surface min-w-0 overflow-x-hidden p-5 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
          <p className="eyebrow">Configurar reporte</p>
          <h3 className="mt-2 font-serif text-2xl text-[#2a221b]">Configurar reporte</h3>

          <div className="mt-4 grid min-w-0 grid-cols-2 gap-4">
            <label className="col-span-2 block min-w-0 md:hidden">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                Reporte
              </span>
              <select
                className={fieldClassName}
                onChange={(event) => onSelectReportType(event.target.value)}
                value={selectedReportType}
              >
                {reportOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
              {selectedReport?.description ? (
                <p className="mt-2 text-sm text-[#8a775f]">{selectedReport.description}</p>
              ) : null}
            </label>

            {isSalesByMonthReport ? (
              <div className="col-span-2 grid min-w-0 grid-cols-2 gap-4">
                <label className="block min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Cobertura
                  </span>
                  <select
                    className={fieldClassName}
                    onChange={(event) => onRangeChange(event.target.value)}
                    value={selectedRange === "lifetime" ? "lifetime" : "year"}
                  >
                    <option value="year">Por año</option>
                    <option value="lifetime">Siempre</option>
                  </select>
                </label>

                {selectedRange === "year" ? (
                  <label className="block min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                      Año
                    </span>
                    <select
                      className={fieldClassName}
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
                ) : (
                  <div />
                )}
              </div>
            ) : null}

            {!isSalesByMonthReport &&
            (activeFilters.includes("date_from") || activeFilters.includes("date_to")) ? (
              <label className="col-span-2 block min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Rango temporal
                </span>
                <div className="scrollbar-hidden mt-2 overflow-x-auto">
                  <div className="flex min-w-max gap-2 md:w-full md:min-w-0 md:flex-nowrap md:gap-1.5">
                    {rangeOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition md:min-w-fit md:px-3 ${
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
                </div>
              </label>
            ) : null}

            {selectedRange === "year" &&
            !isSalesByMonthReport &&
            (activeFilters.includes("date_from") || activeFilters.includes("date_to")) ? (
              <label className="block min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Año
                </span>
                <select
                  className={fieldClassName}
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

            {activeFilters.includes("date_from") && selectedRange !== "lifetime" ? (
              <div className="col-span-2 grid min-w-0 grid-cols-2 gap-4">
                <label className="block min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Fecha inicio
                  </span>
                  <input
                    className={fieldClassName}
                    name="date_from"
                    onChange={onFilterChange}
                    type="date"
                    value={filters.date_from}
                  />
                </label>
                <label className="block min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                    Fecha fin
                  </span>
                  <input
                    className={fieldClassName}
                    name="date_to"
                    onChange={onFilterChange}
                    type="date"
                    value={filters.date_to}
                  />
                </label>
              </div>
            ) : null}

            {activeFilters.includes("brand") ? (
              <label className="col-span-2 block min-w-0">
                <span className={compactLabelClassName}>
                  Marca
                </span>
                <input
                  className={fieldClassName}
                  name="brand"
                  onChange={onFilterChange}
                  placeholder="Ej. Seiko"
                  value={filters.brand}
                />
              </label>
            ) : null}

            {activeFilters.includes("channel") ? (
              <label className="block min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Canal
                </span>
                <select
                  className={fieldClassName}
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
              <label className="block min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Metodo de pago
                </span>
                <select
                  className={fieldClassName}
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
              <label className="block min-w-0">
                <span className={compactLabelClassName}>
                  Cuenta
                </span>
                <select
                  className={fieldClassName}
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
              <label className="block min-w-0">
                <span className={compactLabelClassName}>
                  <span className="sm:hidden">Tipo mov.</span>
                  <span className="hidden sm:inline">Tipo de movimiento</span>
                </span>
                <select
                  className={fieldClassName}
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
              <label className="block min-w-0">
                <span className={compactLabelClassName}>
                  <span className="sm:hidden">Estado inv.</span>
                  <span className="hidden sm:inline">Estado de inventario</span>
                </span>
                <select
                  className={fieldClassName}
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
              <label className="block min-w-0">
                <span className={compactLabelClassName}>
                  <span className="sm:hidden">Etiqueta inv.</span>
                  <span className="hidden sm:inline">Etiqueta de inventario</span>
                </span>
                <select
                  className={fieldClassName}
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
              <label className="block min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Cliente
                </span>
                <select
                  className={fieldClassName}
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
              <label className="block min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b09a7e]">
                  Dias minimos (productos lentos)
                </span>
                <input
                  className={fieldClassName}
                  name="dias_minimos"
                  onChange={onFilterChange}
                  placeholder="60"
                  value={filters.dias_minimos}
                />
              </label>
            ) : null}

            <button
              className="gold-button col-span-2 w-full px-4 py-2 text-xs"
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
