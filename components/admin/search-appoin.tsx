import { useState } from "react";
import WeeklyCalendar from "./search-bar-appointment"; 

export default function InitialView() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const deportes = [
    { id: 1, name: "futbol" },
    { id: 2, name: "voley" },
    { id: 3, name: "basquet" },
    { id: 4, name: "padel" },
  ];

  return (
    <div className="bg-black min-h-screen p-6">
      {!selectedSport ? (
        <>
          <h2 className="text-2xl font-bold mb-6 text-green-400 text-center">
            Seleccioná tu deporte
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {deportes.map((dep) => (
              <div
                key={dep.id}
                className="bg-gray-900 border border-green-500 rounded-lg p-4 flex flex-col items-center shadow-md hover:shadow-lg transition"
              >
                <p className="text-green-300 font-semibold mb-4">{dep.name}</p>
                <button
                  onClick={() => setSelectedSport(dep.name)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Seleccionar
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedSport(null)}
            className="mb-4 bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800"
          >
            ← Volver a deportes
          </button>
          <h2 className="text-2xl font-bold mb-6 text-green-400">
            Clases de {selectedSport}
          </h2>
          <WeeklyCalendar deporte={selectedSport} />
        </>
      )}
    </div>
  );
}
