export default function ActividadInfo() {
  return (
    <section className="border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">

        <div className="bg-zinc-900 rounded-2xl p-6">
          <h4 className="font-bold text-xl mb-2">Profesores</h4>
          <p className="text-zinc-400">
            Staff capacitado y seguimiento constante.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6">
          <h4 className="font-bold text-xl mb-2">Instalaciones</h4>
          <p className="text-zinc-400">
            Espacios modernos y preparados para entrenar.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6">
          <h4 className="font-bold text-xl mb-2">Reservas rápidas</h4>
          <p className="text-zinc-400">
            Elegí día, turno y confirmá en segundos.
          </p>
        </div>

      </div>
    </section>
  );
}