import Link from "next/link";

export default function ActividadHero({ actividad }: any) {
  return (
    <section className={`bg-gradient-to-r ${actividad.color} py-20 px-6`}>
      <div className="max-w-7xl mx-auto">

        <Link href="/" className="text-white/80 hover:text-white text-sm">
          ← Volver al inicio
        </Link>

        <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">

          <div>
            <p className="text-7xl mb-4">{actividad.icono}</p>

            <h1 className="text-5xl md:text-6xl font-bold mb-5">
              {actividad.nombre}
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              {actividad.descripcion}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 min-w-[280px]">
            <p className="text-sm text-white/70 mb-2">
              Disponibilidad semanal
            </p>

            <h3 className="text-4xl font-bold mb-2">
              {actividad.dias.length} días
            </h3>

            <p className="text-white/80">
              Elegí el día y reservá tu lugar.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}