import { useEffect, useState } from "react";

export default function AgendaSemanal({ deporte }: { deporte: string }) {
  const [turnos, setTurnos] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/appointment")
      .then(res => res.json())
      .then(data => {
        const filtrados = data.filter(
          (t: any) => t.activity?.name?.toLowerCase() === deporte.toLowerCase()
        );

        const grupos: Record<string, any> = {};
        filtrados.forEach((t: any) => {
          const fecha = new Date(t.initialDate);
          const diaSemana = fecha.toLocaleDateString("es-AR", { weekday: "long" });
          const hora = fecha.getHours();
          const clave = `${diaSemana}-${hora}`;

          if (!grupos[clave]) {
            grupos[clave] = t;
          }
        });

        setTurnos(Object.values(grupos));
      });
  }, [deporte]);

  const eliminarTurno = async (id: number) => {
    try {
      await fetch(`/api/appointment/${id}`, { method: "DELETE" });
      setTurnos(turnos.filter((t: any) => t.id !== id));
      alert("El turno fue eliminado con éxito");
    } catch (error) {
      console.error("Error eliminando turno:", error);
      alert("Error inesperado al eliminar turno");
    }
  };

  const turnosPorDia: Record<string, any[]> = {};
  turnos.forEach((t: any) => {
    const fecha = new Date(t.initialDate);
    const diaSemana = fecha.toLocaleDateString("es-AR", { weekday: "long" });
    if (!turnosPorDia[diaSemana]) turnosPorDia[diaSemana] = [];
    turnosPorDia[diaSemana].push(t);
  });

  Object.keys(turnosPorDia).forEach(dia => {
    turnosPorDia[dia].sort(
      (a, b) =>
        new Date(a.initialDate).getTime() - new Date(b.initialDate).getTime()
    );
  });


  const diasOrden = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  return (
    <div className="bg-black min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-400">
        Agenda semanal de {deporte}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {diasOrden.map(dia => (
          <div
            key={dia}
            className="bg-gray-900 text-white border border-green-500 rounded-lg p-3"
          >
            <h3 className="text-lg font-bold mb-2 capitalize text-green-300">
              {dia}
            </h3>
            {turnosPorDia[dia]?.length ? (
              turnosPorDia[dia].map((t: any) => {
                const fecha = new Date(t.initialDate);
                const hora = fecha.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });

                return (
                  <div
                    key={t.id}
                    className="border border-green-500 rounded-md p-2 mb-2 text-xs flex flex-col bg-gray-800"
                  >
                    <p className="text-gray-300">{hora} hs</p>
                    <p className="text-gray-400">Cupos disponibles: {t.currentSlots}</p>
                    <p className="text-gray-400">Cupo total: {t.slotsAvailable}</p>
                    <p className="text-gray-400">Precio: ${t.price}</p>
                    <button
                      onClick={() => eliminarTurno(t.id)}
                      className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 mt-1 self-end"
                    >
                      Eliminar
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">Sin turnos</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
