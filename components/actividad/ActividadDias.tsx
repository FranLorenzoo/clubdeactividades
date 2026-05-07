import Link from "next/link";

export default function ActividadDias({ actividad, id }: any) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      <div className="text-center mb-14">
        <p className="text-green-500 font-semibold uppercase tracking-widest mb-3">
          Próximo paso
        </p>

        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Seleccioná un día
        </h2>

        <p className="text-zinc-400 text-lg">
          Luego vas a poder elegir horario, profesor y reservar.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {actividad.dias.map((dia: string, index: number) => (
          <Link
            key={index}
            href={`/actividad/${id}/${dia}`}
            className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-green-500 hover:-translate-y-1 transition"
          >
            <p className="text-zinc-500 text-sm mb-3">
              Día disponible
            </p>

            <h3 className="text-3xl font-bold capitalize mb-6 group-hover:text-green-400 transition">
              {dia}
            </h3>

            <span className="inline-block bg-green-600 px-5 py-3 rounded-xl font-semibold group-hover:bg-green-500 transition">
              Ver turnos
            </span>
          </Link>
        ))}

      </div>
    </section>
  );
}