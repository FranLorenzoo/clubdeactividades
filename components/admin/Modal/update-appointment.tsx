import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface UpdateAppointmentProps {
  turno: any;
  onClose: () => void;
}

export default function UpdateAppointment({ turno, onClose }: UpdateAppointmentProps) {
  const [price, setPrice] = useState(turno.price || 0); 
  const [professorId, setProfessorId] = useState(turno.professor?.id || "");
  const [slotsAvailable, setSlotsAvailable] = useState(turno.slotsAvailable || 0);
  const [profesoresDisponibles, setProfesoresDisponibles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const idActividad = turno.activityId || turno.activity?.id;
    if (!idActividad) return;

    fetch(`/api/professor/activity/${idActividad}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al traer los profesores");
        return res.json();
      })
      .then((data) => {
        setProfesoresDisponibles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error en la petición de profesores:", err);
        setLoading(false);
      });
  }, [turno]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      price: price,
      professorId: professorId,
      slotsAvailable: slotsAvailable,
      activityId: turno.activityId || turno.activity?.id
    };

    try {
      const response = await fetch("/api/appointment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Actualización de clase exitosa");
        onClose();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error("Error en la respuesta del servidor");
      }
    } catch (error) {
      console.error("Error en la petición fetch:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-green-500 rounded-lg p-6 w-full max-w-md shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-green-400 tracking-wide">
            Editar Clase
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl transition-colors">
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-6 border-b border-gray-800 pb-3">
          Deporte: <span className="text-green-300 capitalize">{turno.activity?.name}</span> <br />
          Horario: <span className="text-white font-medium">
            {new Date(turno.initialDate).toLocaleTimeString("es-AR", { 
              hour: "2-digit", 
              minute: "2-digit",
              hour12: false // <-- Esto elimina el p. m. / a. m. y fuerza las 24 hs
            })} hs
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-green-300 mb-2">
              Precio del turno ($)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5 text-white text-base focus:border-green-500 outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-300 mb-2">
              Profesor asignado
            </label>
            <select
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5 text-white text-base focus:border-green-500 outline-none transition-colors appearance-none"
              disabled={loading}
              required
            >
              {loading ? (
                <option>Cargando profesores...</option>
              ) : profesoresDisponibles.length > 0 ? (
                profesoresDisponibles.map((prof) => (
                  <option key={prof.id} value={prof.id} className="bg-gray-900">
                    {prof.user?.name} {prof.user?.lastName}
                  </option>
                ))
              ) : (
                <option value={turno.professor?.id}>{turno.professor?.user?.name || "Sin profes"}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-green-300 mb-2">
              Cupo máximo disponible
            </label>
            <input
              type="number"
              value={slotsAvailable}
              onChange={(e) => setSlotsAvailable(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5 text-white text-base focus:border-green-500 outline-none transition-colors"
              min="1"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-6">
            <button
              type="submit"
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-md transition-colors shadow-md shadow-green-900/30"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}