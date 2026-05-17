import { useState } from "react";

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

// Mock appointments data — replace with real API data
const MOCK_APPOINTMENTS: Record<string, { time: string; slots: number }[]> = {
  Lunes: [
    { time: "09:00", slots: 5 },
    { time: "18:00", slots: 0 },
  ],
  Martes: [
    { time: "10:00", slots: 3 },
    { time: "19:00", slots: 8 },
  ],
  Miércoles: [
    { time: "08:00", slots: 2 },
    { time: "16:00", slots: 6 },
  ],
  Jueves: [
    { time: "09:00", slots: 4 },
    { time: "17:00", slots: 1 },
  ],
  Viernes: [
    { time: "10:00", slots: 7 },
    { time: "20:00", slots: 0 },
  ],
  Sábado: [
    { time: "08:00", slots: 5 },
    { time: "11:00", slots: 3 },
  ],
};

type ReserveType = "mensual" | "unica" | null;

interface SlotTooltipProps {
  time: string;
  slots: number;
  onReserve: () => void;
}

function SlotTooltip({ time, slots, onReserve }: SlotTooltipProps) {
  const available = slots > 0;
  return (
    <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 bg-[#7c5cbf] rounded-xl p-3 shadow-xl text-white text-center pointer-events-auto">
      <p className="font-bold text-lg leading-tight">{time}hs</p>
      <p className="text-xs text-purple-200 mb-2">
        {available ? `${slots} cupos` : "Sin cupos"}
      </p>
      <button
        onClick={onReserve}
        className={`w-full text-xs font-semibold py-1.5 rounded-lg transition ${
          available
            ? "bg-white text-purple-700 hover:bg-purple-100"
            : "bg-purple-900 text-purple-400 cursor-not-allowed"
        }`}
        disabled={!available}
      >
        {available ? "Reservar" : "Sin cupos"}
      </button>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#7c5cbf]" />
    </div>
  );
}

interface ScheduleGridProps {
  activityDays: string[]; // e.g. ["lunes", "miercoles", "viernes"]
  activityName: string;
}

export default function ScheduleGrid({ activityDays, activityName }: ScheduleGridProps) {
  const [reserveType, setReserveType] = useState<ReserveType>(null);
  const [activeSlot, setActiveSlot] = useState<{ day: string; time: string } | null>(null);

  // Normalize to match display names
  const normalizedDays = activityDays.map((d) => {
    const map: Record<string, string> = {
      lunes: "Lunes",
      martes: "Martes",
      miercoles: "Miércoles",
      jueves: "Jueves",
      viernes: "Viernes",
      sabado: "Sábado",
    };
    return map[d.toLowerCase()] ?? d;
  });

  const activeDays = ALL_DAYS.filter((d) => normalizedDays.includes(d));

  function getAppointment(day: string, time: string) {
    return MOCK_APPOINTMENTS[day]?.find((a) => a.time === time) ?? null;
  }

  function handleSlotClick(day: string, time: string) {
    if (activeSlot?.day === day && activeSlot?.time === time) {
      setActiveSlot(null);
    } else {
      setActiveSlot({ day, time });
    }
  }

  function handleReserve() {
    if (!activeSlot) return;
    // TODO: trigger real reservation flow
    alert(`Reservando ${activeSlot.time} el ${activeSlot.day} — tipo: ${reserveType ?? "no seleccionado"}`);
    setActiveSlot(null);
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* Header row */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <h2 className="text-4xl font-bold text-white">
          <span className="text-[#4db89e]">{activityName}</span>
        </h2>

        {/* Reservation type buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setReserveType(reserveType === "mensual" ? null : "mensual")}
            className={`px-5 py-2.5 rounded-xl font-semibold border-2 transition ${
              reserveType === "mensual"
                ? "bg-[#4db89e] border-[#4db89e] text-zinc-900"
                : "bg-[#4db89e]/20 border-[#4db89e] text-[#f5c842] hover:bg-[#4db89e]/30"
            }`}
          >
            reserva mensual
          </button>
          <button
            onClick={() => setReserveType(reserveType === "unica" ? null : "unica")}
            className={`px-5 py-2.5 rounded-xl font-semibold border-2 transition ${
              reserveType === "unica"
                ? "bg-[#4db89e] border-[#4db89e] text-zinc-900"
                : "bg-[#4db89e]/20 border-[#4db89e] text-[#f5c842] hover:bg-[#4db89e]/30"
            }`}
          >
            reserva única
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `100px repeat(${activeDays.length}, 1fr)` }}
      >
        {/* Empty corner */}
        <div>
          <p className="text-red-400 font-semibold text-sm mt-8">Horarios</p>
        </div>

        {activeDays.map((day) => (
          <div key={day} className="text-center">
            <p className="text-red-400 font-bold text-base mb-3">{day}</p>
            {/* Column bar */}
            <div className="relative mx-auto w-full rounded-2xl bg-[#4db89e] overflow-visible"
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
                          className="text-xs font-semibold text-white bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1 transition"
                        >
                          {time}
                        </button>

                        {isActive && (
                          <SlotTooltip
                            time={time}
                            slots={appt.slots}
                            onReserve={handleReserve}
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
      <div className="relative" style={{ marginTop: `-${TIME_SLOTS.length * 52 + 48}px`, pointerEvents: "none" }}>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `100px repeat(${activeDays.length}, 1fr)` }}
        >
          <div className="mt-[48px]">
            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                className="flex items-center text-zinc-400 text-xs"
                style={{ height: "52px" }}
              >
                {time}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
