export default function SaleHoldPanel({ onRegister, disabled }) {
  return (
    <section className="panel-surface p-5">
      <p className="font-serif text-xl text-[#2a221b]">El cliente pagara en parcialidades?</p>
      <button
        className="mt-4 w-full rounded-md border border-[#dec5bd] bg-[#fff4f1] px-4 py-3 text-sm text-[#8d5b4d]"
        disabled={disabled}
        onClick={onRegister}
        type="button"
      >
        Registrar como apartado
      </button>
    </section>
  );
}
