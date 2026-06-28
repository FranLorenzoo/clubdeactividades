import { useEffect, useState } from "react";

type Appointment = {
  id: number;
  initialDate: string;
  endDate: string;
  currentSlots: number;
  slotsAvailable: number;
  professor: {
    user: {
      name: string;
      lastName: string;
    };
  };
};

type Credit = {
  id: number;
  activity: {
    id: number;
    name: string;
  };
  grantedAt: string;
  endDate: string;
  isValid: boolean;
};

type AppointmentModalProps = {
  open: boolean;
  onClose: () => void;
  credit: Credit | null;
};

export default function AppointmentModal({
  open,
  onClose,
  credit,
}: AppointmentModalProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !credit) return;

    const fetchAppointments = async () => {
      setLoading(true);

      const res = await fetch(
        `/api/appointment/activity/${credit.activity.id}`
      );

      const data = await res.json();

      setAppointments(data);
      setLoading(false);
    };

    fetchAppointments();
  }, [open, credit]);
  
  const availableAppointments = appointments.filter(
  appointment => appointment.currentSlots < appointment.slotsAvailable
);

  if (!open || !credit) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-zinc-900 rounded-xl p-6 w-[600px] min-h-[500px] max-h-[80vh] flex flex-col">
        <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
                <p>Cargando...</p>
            ) : availableAppointments.length === 0 ? (
                <p className="text-zinc-400">No hay turnos disponibles.</p>
            ) : (
                availableAppointments.map((appointment) => (
                <div
                    key={appointment.id}
                    className="border border-zinc-700 rounded-lg p-4 mb-3"
                >
                    <p>
                    {new Date(appointment.initialDate).toLocaleString("es-AR")}
                    </p>

                    <p>
                    {appointment.professor.user.name}{" "}
                    {appointment.professor.user.lastName}
                    </p>

                    <button className="mt-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded">
                    Reservar
                    </button>
                </div>
                ))
            )}
         </div>
         <button onClick={onClose} className="mt-4 bg-red-600 px-4 py-2 rounded" > Cerrar </button>
      </div>
    </div>
  );
}