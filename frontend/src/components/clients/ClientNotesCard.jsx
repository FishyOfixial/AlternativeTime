export default function ClientNotesCard({ notes }) {
  return (
    <section className="panel-surface p-6">
      <p className="font-serif text-2xl text-[#2a221b]">Notas del cliente</p>
      <div className="mt-4 rounded-xl border border-[#ddcfba] bg-[#fffdf9] p-4 text-sm leading-6 text-[#5d5144]">
        {notes || "Sin notas registradas para este cliente."}
      </div>
    </section>
  );
}
