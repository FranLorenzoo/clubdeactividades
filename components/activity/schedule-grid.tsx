import { useEffect, useState } from "react";

const ALL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const DAY_INDEX_MAP: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  0: "Domingo",
};

type ReserveType = "mensual" | "unica" | null;

interface ReservePopupProps {
  time: string;
  available: number;
  waitingList: boolean;
  reserveType: ReserveType;
  onTypeChange: (t: ReserveType) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function ReservePopup({
  time,
  available,
  waitingList,
  reserveType,
  onTypeChange,
  onConfirm,
  onClose,
}: ReservePopupProps) {
  const canConfirm = reserveType !== null;
  return (
    <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto">
      <div className="flex justify-between items-center mb-2">
        <p className="font-bold text-base">{time}hs</p>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white text-sm leading-none"
        >
          ✕
        </button>
      </div>
      <p className="text-xs text-zinc-400 mb-3">
        {waitingList
          ? "Lista de espera"
          : available > 0
          ? `${available} cupos disponibles`
          : "Sin cupos"}
      </p>
      <p className="text-xs text-zinc-400 mb-2">Tipo de reserva</p>
      <div className="flex flex-col gap-2 mb-3">
        <button
          onClick={() => onTypeChange(reserveType === "mensual" ? null : "mensual")}
          className={`w-full text-xs font-semibold py-1.5 rounded-xl border transition ${
            reserveType === "mensual"
              ? "bg-green-600 border-green-600 text-white"
              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => onTypeChange(reserveType === "unica" ? null : "unica")}
          className={`w-full text-xs font-semibold py-1.5 rounded-xl border transition ${
            reserveType === "unica"
              ? "bg-green-600 border-green-600 text-white"
              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          Única vez
        </button>
      </div>
      <button
        onClick={onConfirm}
        disabled={!canConfirm}
        className={`w-full text-xs font-semibold py-2 rounded-xl transition ${
          canConfirm
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
        }`}
      >
        Confirmar
      </button>
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-700" />
    </div>
  );
}

interface ScheduleGridProps {
  activityDays: string[];
  activityId: string;
}

export default function ScheduleGrid({ activityDays, activityId }: ScheduleGridProps) {
  const [reserveType, setReserveType] = useState<ReserveType>(null);
  const [activeSlot, setActiveSlot] = useState<{ day: string; time: string } | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activityId) return;
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/appointment/activity/${activityId}`);
        const data = await res.json();
        setAppointments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [activityId]);

  function getAppointment(day: string, time: string) {
    const appt = appointments.find((a) => {
      const date = new Date(a.initialDate);
      const apptDay = DAY_INDEX_MAP[date.getDay()];
      const apptTime = date.toTimeString().slice(0, 5);
      return apptDay === day && apptTime === time;
    });
    if (!appt) return null;
    const count = appt.userAppointments?.length ?? 0;
    const waitingList = count >= 10;
    const available = waitingList ? 0 : 10 - count;
    return { time, available, waitingList };
  }

  function handleSlotClick(day: string, time: string) {
    if (activeSlot?.day === day && activeSlot?.time === time) {
      setActiveSlot(null);
      setReserveType(null);
    } else {
      setActiveSlot({ day, time });
      setReserveType(null);
    }
  }

  function handleConfirm() {
    if (!activeSlot || !reserveType) return;
    // TODO: trigger real reservation flow
    alert(`Reservando ${activeSlot.time} el ${activeSlot.day} — tipo: ${reserveType}`);
    setActiveSlot(null);
    setReserveType(null);
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-white mb-8">Turnos disponibles</h2>

      {loading ? (
        <p className="text-zinc-400">Cargando turnos...</p>
      ) : (
        <>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `80px repeat(${ALL_DAYS.length}, 1fr)` }}
          >
            <div />
            {ALL_DAYS.map((day) => (
              <div key={day} className="text-center">
                <p className="text-zinc-400 font-semibold text-sm mb-3">{day}</p>
                <div
                  className="relative mx-auto w-full rounded-2xl bg-zinc-800 overflow-visible"
                  style={{ height: `${TIME_SLOTS.length * 52}px` }}
                >
                  {TIME_SLOTS.map((time, idx) => {
                    const appt = getAppointment(day, time);
                    const isActive = activeSlot?.day === day && activeSlot?.time === time;

                    return (
                      <div
                        key={time}
                        className="absolute left-0 right-0"
                        style={{ top: `${idx * 52}px`, height: "52px" }}
                      >
                        {appt && (
                          <div className="relative flex items-center justify-center h-full">
                            <button
                              onClick={() => handleSlotClick(day, time)}
                              className={`text-xs font-semibold rounded-lg px-2 py-1 transition border ${
                                isActive
                                  ? "bg-green-600 border-green-600 text-white"
                                  : "bg-green-600/20 border-green-600/40 text-green-400 hover:bg-green-600/40"
                              }`}
                            >
                              {time}
                            </button>
                            {isActive && (
                              <ReservePopup
                                time={time}
                                available={appt.available}
                                waitingList={appt.waitingList}
                                reserveType={reserveType}
                                onTypeChange={setReserveType}
                                onConfirm={handleConfirm}
                                onClose={() => {
                                  setActiveSlot(null);
                                  setReserveType(null);
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Time labels on the left */}
          <div
            className="relative pointer-events-none"
            style={{ marginTop: `-${TIME_SLOTS.length * 52 + 36}px` }}
          >
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `80px repeat(${ALL_DAYS.length}, 1fr)` }}
            >
              <div className="mt-[36px]">
                {TIME_SLOTS.map((time) => (
                  <div
                    key={time}
                    className="flex items-center text-zinc-500 text-xs"
                    style={{ height: "52px" }}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
