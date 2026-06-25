import { useEffect, useState } from "react";
import UpdateAppointment from "./Modal/update-appointment";
import toast from "react-hot-toast";

export default function WeeklyCalendar({ deporte }: { deporte: string }) {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [turnoAEditar, setTurnoAEditar] = useState<any | null>(null);


  useEffect(() => {
    fetch("/api/appointment")
      .then(res => res.json())
      .then(data => {
        const filtrados = data.filter(
          (t: any) => t.activity?.name?.toLowerCase() === deporte.toLowerCase()
        );

        const grupos: Record<string, any> = {};
        filtrados.forEach((t: any) => {
          const date = new Date(t.initialDate);
          const dayWeek = date.toLocaleDateString("es-AR", { weekday: "long" });
          const hour = date.getHours();
          const key = `${dayWeek}-${hour}`;

          if (!grupos[key]) {
            grupos[key] = t;
          }
        });

        setTurnos(Object.values(grupos));
      });
  }, [deporte]);


  const deleteAppointment = async (id: number) => {
    try {
      const res= await fetch(`/api/appointment/${id}`, { method: "DELETE" });
      if (res.ok){
        setTurnos((prev) => prev.filter((t) => t.id !== id));
        toast.success("La clase fue eliminada con éxito");
      }
    } catch (error) {
      console.error("Error eliminando clase:", error);
      toast.error("Error inesperado al eliminar clase");
    }
  };

  const appointmentsPerDay: Record<string, any[]> = {};
  turnos.forEach((t: any) => {
    const fecha = new Date(t.initialDate);
    const diaSemana = fecha.toLocaleDateString("es-AR", { weekday: "long" });
    if (!appointmentsPerDay[diaSemana]) appointmentsPerDay[diaSemana] = [];
    appointmentsPerDay[diaSemana].push(t);
  });

  Object.keys(appointmentsPerDay).forEach(dia => {
    appointmentsPerDay[dia].sort(
      (turnoUno, turnoDos) =>
        new Date(turnoUno.initialDate).getTime() - new Date(turnoDos.initialDate).getTime()
    );
  });


  const daysOrder = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  return (
    <div className="bg-black min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-400">
        Agenda semanal de {deporte}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {daysOrder.map(day => (
          <div
            key={day}
            className="bg-gray-900 text-white border border-green-500 rounded-lg p-3"
          >
            <h3 className="text-lg font-bold mb-2 capitalize text-green-300">
              {day}
            </h3>
            {appointmentsPerDay[day]?.length ? (
              appointmentsPerDay[day].map((t: any) => {
                const fecha = new Date(t.initialDate);
                const hora = fecha.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });

                return (
                  <div
                    key={t.id}
                    className="border border-green-500 rounded-md p-2 mb-2 text-xs flex flex-col bg-gray-800 justify-between min-h-[140px] font-medium text-[14px]"
                  >
                    <div>
                      <p className="text-gray-300 font-semibold mb-1">{hora} hs</p>
                      <p className="text-gray-400">Cupo total: {t.slotsAvailable}</p>
                      <p className="text-gray-400 truncate">Profe: {t.professor?.user?.name}</p>
                    </div>
                    <button
                      onClick={() => setTurnoAEditar(t)}
                      className="w-full bg-gray-700 text-green-400 py-1 rounded border border-gray-600 hover:bg-green-600 hover:text-white hover:border-green-500 transition-colors"
                    >
                      Editar Clase
                    </button>
                    <button onClick={() => deleteAppointment(t.id)} 
                     className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm font-semibold">
                      Eliminar</button>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">Sin turnos</p>
            )}
          </div>
        ))}
        
        {turnoAEditar && ( <UpdateAppointment 
            turno={turnoAEditar} 
            onClose={() => setTurnoAEditar(null)} 
          />
        )}

      </div>
    </div>
  );
}
