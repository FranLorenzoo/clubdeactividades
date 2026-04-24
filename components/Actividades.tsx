import Link from "next/link";
import Image from "next/image";

const actividades = [
  { id: 1, nombre: "Fútbol", imagen: "/futbol.jpg" },
  { id: 2, nombre: "Vóley", imagen: "/voley.jpg" },
  { id: 3, nombre: "Pádel", imagen: "/padel.jpg" },
  { id: 4, nombre: "Básquet", imagen: "/basquet.jpg" },
];

export default function Actividades() {
  return (
    <section
      id="actividades"
      className="max-w-7xl mx-auto px-6 pb-20"
    >
      <h2 className="text-4xl font-bold mb-10 text-center">
        Actividades disponibles
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

        {actividades.map((actividad) => (
          <div
            key={actividad.id}
            className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-green-500 transition"
          >
            <Image
              src={actividad.imagen}
              alt={actividad.nombre}
              width={500}
              height={300}
              className="w-full h-52 object-cover"
            />

            <div className="p-5">
              <h3 className="text-2xl font-bold mb-4">
                {actividad.nombre}
              </h3>

              <Link
                href={`/actividad/${actividad.id}`}
                className="block text-center bg-green-600 py-3 rounded-xl hover:bg-green-700 transition"
              >
                Reservar
              </Link>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}