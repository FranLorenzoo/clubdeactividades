import Link from "next/link";

export default function DiaHeader({ id, dia }: any) {
  return (
    <div className="mb-10">
      <Link
        href={`/actividad/${id}`}
        className="text-zinc-400 hover:text-white"
      >
        ← Volver
      </Link>

      <p className="text-green-500 font-medium mt-6 mb-2 capitalize">
        {dia}
      </p>

      <h1 className="text-5xl font-bold mb-4">
        Turnos disponibles
      </h1>

      <p className="text-zinc-400 text-lg">
        Elegí el horario ideal para vos.
      </p>
    </div>
  );
}