import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";

import ActividadHero from "@/components/actividad/ActividadHero";
import ActividadDias from "@/components/actividad/ActividadDias";
import ActividadInfo from "@/components/actividad/ActividadInfo";

const actividades: Record<
  string,
  {
    nombre: string;
    descripcion: string;
    color: string;
    icono: string;
    dias: string[];
  }
> = {
  "1": {
    nombre: "Fútbol",
    descripcion:
      "Entrenamientos dinámicos, partidos recreativos y competitivos para todas las edades.",
    color: "from-green-500 to-emerald-700",
    icono: "⚽",
    dias: ["lunes", "miercoles", "viernes", "sabado"],
  },

  "2": {
    nombre: "Vóley",
    descripcion:
      "Clases grupales enfocadas en técnica, coordinación y trabajo en equipo.",
    color: "from-blue-500 to-cyan-700",
    icono: "🏐",
    dias: ["martes", "jueves", "sabado"],
  },

  "3": {
    nombre: "Pádel",
    descripcion: "Clases recreativas y partidos intensos.",
    color: "from-orange-500 to-red-600",
    icono: "🎾",
    dias: ["lunes", "miercoles", "viernes"],
  },

  "4": {
    nombre: "Básquet",
    descripcion:
      "Clases intensivas, recreativas y para jugar en equipo.",
    color: "from-purple-500 to-indigo-700",
    icono: "🏀",
    dias: ["martes", "jueves", "sabado"],
  },
};

export default function ActividadDetalle() {
  const router = useRouter();
  const { id } = router.query;

  const actividad = actividades[id as string];

  if (!actividad) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Actividad no encontrada
            </h1>

            <Link
              href="/"
              className="inline-block bg-green-600 px-6 py-3 rounded-xl hover:bg-green-700 transition"
            >
              Volver al inicio
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 text-white">
        <ActividadHero actividad={actividad} />
        <ActividadDias actividad={actividad} id={id} />
        <ActividadInfo />
      </main>
    </>
  );
}