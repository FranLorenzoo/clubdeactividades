import Image from "next/image";
import { useEffect, useState } from "react";

const activityImage = [
  { id: 1, nombre: "Futbol", imagen: "/futbol.jpg" },
  { id: 2, nombre: "Voley", imagen: "/voley.jpg" },
  { id: 3, nombre: "Paddle", imagen: "/basquet.jpg" },
  { id: 4, nombre: "Basquet", imagen: "/padel.jpg" },
];

export default function Activities() {
  const [activities, setActivities] = useState<any[]>();
  useEffect(() => {
    const fetchActivities = async () => {
      const res = await fetch("/api/activity");
      const data = await res.json();
      setActivities(data);
      console.log(data);
    };
    fetchActivities();
  }, []);
  return (
    <section
      id="actividades"
      className="max-w-7xl mx-auto px-6 pb-20"
    >
      <h2 className="text-4xl font-bold mb-10 text-center">
        Actividades disponibles
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

        {activities?.map((activity) => (
          <div
            key={activity.id}
            className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-green-500 transition"
          >
            <Image
              src={activityImage[activity.id as number - 1].imagen}
              alt={activity.name}
              width={500}
              height={300}
              className="w-full h-52 object-cover"
            />

            <div className="p-5">
              <h3 className="text-2xl font-bold mb-4">
                {activity.name}
              </h3>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}