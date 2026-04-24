export default function TurnoCard({ turno }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

      <div>
        <h3 className="text-3xl font-bold">
          {turno.hora}
        </h3>

        <p className="text-zinc-400">
          Profesor: {turno.profesor}
        </p>

        <p className="text-zinc-400">
          Cupos disponibles: {turno.cupos}
        </p>
      </div>

      {turno.cupos > 0 ? (
        <button className="bg-green-600 px-6 py-3 rounded-xl hover:bg-green-700 transition font-semibold">
          Reservar
        </button>
      ) : (
        <button className="bg-orange-500 px-6 py-3 rounded-xl hover:bg-orange-600 transition font-semibold">
          Lista de espera
        </button>
      )}
    </div>
  );
}