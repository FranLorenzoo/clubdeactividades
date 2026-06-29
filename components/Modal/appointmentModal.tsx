import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type appointments = {
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
  appointments: appointments[];
  onReservationSuccess: () => Promise<void>;
};

export default function AppointmentModal({
  open,
  onClose,
  credit,
  appointments,
  onReservationSuccess,
}: AppointmentModalProps) {
  const [reservingId, setReservingId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "auto";
    }

    return () => {
        document.body.style.overflow = "auto";
    };
    }, [open]);

  const reserveAppointment = async (appointmentId: number) => {
  try {
    setReservingId(appointmentId);

    const response = await fetch("/api/credit/reserve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentId,
        creditId: credit?.id,
      }),
    });

    if (!response.ok) {
      throw new Error();
    }
    await onReservationSuccess();
    toast.success("Reserva realizada con éxito");
    onClose();
  } catch (error) {
    toast.error("Error al reservar el turno");
  } finally {
    setReservingId(null);
  }
};

  if (!open || !credit) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/15 flex items-center justify-center">
      <div className="bg-zinc-900 rounded-xl p-6 w-[600px] max-h-[80vh] flex flex-col">
        <div className="flex-1 overflow-y-auto">
            {appointments.length === 0 ? (
                <p className="text-zinc-400">No hay turnos disponibles.</p>
            ) : (
                appointments.map((appointment) => (
                <div
                    key={appointment.id}
                    className="border border-zinc-700 rounded-lg p-4 mb-3"
                >
                    <p>
                    {new Date(appointment.initialDate).toLocaleString("es-AR",{
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    </p>

                    <p>
                    {appointment.professor.user.name}{" "}
                    {appointment.professor.user.lastName}
                    </p>

                    <button onClick={() => {reserveAppointment(appointment.id)}}
                    className="mt-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded">
                    {reservingId === appointment.id
                      ? "Reservando..."
                      : "Reservar"}
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