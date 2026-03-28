export default function SalePaymentSection({ paymentOptions, selectedMethod, onSelect }) {
  return (
    <section className="panel-surface p-5">
      <h2 className="font-serif text-2xl text-[#2a221b]">Metodo de pago</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {paymentOptions.map((option) => (
          <button
            key={option.value}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
              selectedMethod === option.value
                ? "border-[#b69556] bg-[#fff5dd] text-[#2a221b]"
                : "border-[#dccfb9] bg-[#fffdf9] text-[#7d6751]"
            }`}
            onClick={() => onSelect(option.value)}
            type="button"
          >
            <span>{option.label}</span>
            {selectedMethod === option.value ? <span className="text-[#b69556]">?</span> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
