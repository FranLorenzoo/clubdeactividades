import Link from "next/link";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 text-center">
    
            <h1 className="text-6xl font-bold leading-tight mb-6">
              Reservá tus actividades <br />
              <span className="text-green-500">en segundos</span>
            </h1>
    
            <p className="text-zinc-400 text-xl max-w-2xl mx-auto mb-10">
              Fútbol, vóley, pádel y básquet. Elegí horario, reservá y disfrutá.
            </p>
    
            <div className="flex justify-center gap-4">
              <Link
                href="/register"
                className="bg-green-600 px-8 py-4 rounded-2xl font-semibold hover:bg-green-700 transition"
              >
                Empezar ahora
              </Link>
    
              <Link
                href="#actividades"
                className="border border-zinc-700 px-8 py-4 rounded-2xl hover:bg-zinc-800 transition"
              >
                Ver actividades
              </Link>
            </div>
          </section>
    
  );
}