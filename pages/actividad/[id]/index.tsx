import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";

import ActivityHero from "@/components/activity/activity-hero";
import ActivityInfo from "@/components/activity/activities-info";
import ScheduleGrid from "@/components/activity/schedule-grid";
import { useEffect, useState } from "react";


const activities: Record<
  string,
  {
    name: string;
    description: string;
    color: string;
    icon: string;
    days: string[];
  }
> = {
  "1": {
    name: "Fútbol",
    description:
      "Entrenamientos dinámicos, partidos recreativos y competitivos para todas las edades.",
    color: "from-green-500 to-emerald-700",
    icon: "⚽",
    days: ["lunes", "miercoles", "viernes", "sabado"],
  },

  "2": {
    name: "Vóley",
    description:
      "Clases grupales enfocadas en técnica, coordinación y trabajo en equipo.",
    color: "from-blue-500 to-cyan-700",
    icon: "🏐",
    days: ["martes", "jueves", "sabado"],
  },
  "3": {
    name: "Pádel",
    description: "Clases recreativas y partidos intensos.",
    color: "from-orange-500 to-red-600",
    icon: "🎾",
    days: ["lunes", "miercoles", "viernes"],
  },

  "4": {
    name: "Básquet",
    description:
      "Clases intensivas, recreativas y para jugar en equipo.",
    color: "from-purple-500 to-indigo-700",
    icon: "🏀",
    days: ["martes", "jueves", "sabado"],
  },
};

export default function ActividadDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [activity, setActivity] = useState<any>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    const activityFromAPI = ()=> {
      try {
        setLoading(true);

        setActivity(activities[parseInt(id as string)]);

      } catch (error) {
        console.error(error);
        router.push("/");
      } finally {
      setLoading(false);
      }
    }
    activityFromAPI()
  }, [id, router]);

  return (
    <>
      <Navbar />

      {loading || !activity ? (
        <p>Cargando...</p>
      ) : (
        <main className="min-h-screen bg-zinc-950 text-white">
          <ActivityHero activity={activity} />
          <ScheduleGrid activityDays={activity.days} activityId={id as string} />
          <ActivityInfo />
        </main>
      )}
    </>
  );
} 