import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import toast from "react-hot-toast";

function formatWeekLabel(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
  return `Semana del ${fmt(start)} al ${fmt(end)}`;
}

type Turno = {
  id: number;
  initialDate: string;
  endDate: string;
  professorId: number;
  activity: {
    id: number;
    name: string;
  };
};

function getWeekRange(offset: number): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Sun
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday + offset * 7);
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  saturday.setHours(23, 59, 59, 999);
  return { start: monday, end: saturday };
}


function formatDay(date: Date) {
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}

export default function MyTurnsPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeSlot, setActiveSlot] = useState<{ day: string; time: string } | null>(null);
  const { start: weekStart, end: weekEnd } = getWeekRange(weekOffset);
  const weekLabel = formatWeekLabel(weekStart, weekEnd);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [filteredTurnos, setFilteredTurnos] = useState<Turno[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [loadingTurnoId, setLoadingTurnoId] = useState<number | null>(null);
  const [requestedReplacements, setRequestedReplacements] = useState<number[]>([]);

  const handleRequestReplacement = async (turno: Turno) => {
    setLoadingTurnoId(turno.id);
    
    try {
      const response = await fetch("/api/send-replacement-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          turno: turno.id,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }
      setRequestedReplacements((prev) => [...prev, turno.id]);
      toast.success("Solicitud enviada");
    } catch {
      toast.error("No se pudo enviar la solicitud");
    }
    setLoadingTurnoId(null);
  };
  useEffect(() => {
    const userId = localStorage.getItem("userId");
      setLoadingTurnos(true);
      async function fetchTurnos() {
        try {
          const professorRes = await fetch(`/api/professor/user/${userId}`);
          const professor = await professorRes.json();
          const res = await fetch(`/api/appointment?professorId=${professor.id}`);
          if (res.ok) {
            const data = await res.json();
            console.log("TURNOS DEL PROFESOR:", data);
            console.log("PRIMER TURNO:", data[0]);
            setTurnos(data);
            setFilteredTurnos(data);
          }
        } catch (err) {
          console.error("Error cargando turnos", err);
        }
        setLoadingTurnos(false);
      }
      fetchTurnos();
    }, []);


  const weekDates = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return date;
    });
  }, [weekStart]);

  const weekTurnos = useMemo(() => {
    const start = weekDates[0];
    const end = new Date(weekDates[5]);
    end.setHours(23, 59, 59, 999);
    return turnos.filter((turno) => {
      const turnoDate = new Date(turno.initialDate);

      return turnoDate >= start && turnoDate <= end;
    });
  }, [weekDates, turnos]);

  const turnosByDay = useMemo(() => {
    const map = new Map<string, Turno[]>();
    weekDates.forEach((date) => {
      map.set(date.toISOString().slice(0, 10), []);
    });
    weekTurnos.forEach((turno) => {
      const dayKey = turno.initialDate.slice(0, 10);
      const items = map.get(dayKey);
      if (items) {
        items.push(turno);
      }
    });
    return map;
  }, [weekDates, weekTurnos]);


  return (
    <DashboardLayout role="PROFESSOR">
        <h1 className="text-white text-3xl font-bold"> Mis turnos </h1>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setWeekOffset((o) => o - 1); setActiveSlot(null);}}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-lg"
                aria-label="Semana anterior"
              >
                ‹
              </button>
              <span className="text-sm text-zinc-400 min-w-[200px] text-center">{weekLabel}</span>
              <button
                onClick={() => { setWeekOffset((o) => o + 1); setActiveSlot(null);}}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-lg"
                aria-label="Semana siguiente"
              >
                ›
              </button>
            </div>
          </div>

          {loadingTurnos ? (
            <div className="text-sm text-zinc-500">Cargando turnos...</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {weekDates.map((date) => {
                  const dayKey = date.toISOString().slice(0, 10);
                  const turnos = turnosByDay.get(dayKey) || [];

                return (
                  <div
                    key={dayKey}
                    className="border border-zinc-700 rounded-xl p-4 bg-zinc-800"
                  >
                    <div className="mb-3">
                      <strong className="block text-sm mb-1 text-white">
                        {formatDay(date)}
                      </strong>

                      <span className="text-sm text-zinc-400">
                        {date.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>

                    {turnos.length === 0 ? (
                      <div className="text-sm text-zinc-500">
                        Sin turnos
                      </div>
                    ) : (
                      turnos.map((turno) => (
                        <div
                          key={turno.id}
                          className="border border-zinc-600 rounded-lg p-3 mb-3 bg-zinc-900"
                        >
                          <div className="text-sm text-zinc-300">
                            {new Date(turno.initialDate).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <button
                            disabled={
                              loadingTurnoId === turno.id ||
                              requestedReplacements.includes(turno.id)
                            }
                            onClick={() => handleRequestReplacement(turno)}
                            className={`mt-3 w-full text-white text-sm py-2 rounded-lg transition ${
                              requestedReplacements.includes(turno.id)
                                ? "bg-zinc-600 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {loadingTurnoId === turno.id
                              ? "Solicitando..."
                              : requestedReplacements.includes(turno.id)
                                ? "Reemplazo solicitado"
                                : "Solicitar reemplazo"}
                        </button>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}