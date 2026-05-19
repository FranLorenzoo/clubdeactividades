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

function remainingClassesThisMonth(dayOfWeek: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  let count = 0;
  const d = new Date(today);
  while (d <= endOfMonth) {
    if (d.getDay() === dayOfWeek) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function calcAmount(reserveType: ReserveType, price: number, dayOfWeek: number): number {
  if (reserveType === "unica") return price * 0.5;
  const remaining = remainingClassesThisMonth(dayOfWeek);
  return price * remaining * 0.85;
}

interface CreditCard {
  id: number;
  cardNumber: string;
  cardHolder: string;
  expireDate: string;
}

interface ReservePopupProps {
  time: string;
  available: number;
  waitingList: boolean;
  price: number;
  dayOfWeek: number;
  reserveType: ReserveType;
  onTypeChange: (t: ReserveType) => void;
  onClose: () => void;
  creditCard: CreditCard | null;
  loadingCard: boolean;
}

function ReservePopup({
  time, available, waitingList, price, dayOfWeek,
  reserveType, onTypeChange, onClose,
  creditCard, loadingCard,
}: ReservePopupProps) {
  const [payment, setPayment] = useState<number | null>(1);
  const amount = reserveType ? calcAmount(reserveType, price, dayOfWeek) : 0;
  const canConfirm = reserveType !== null;
  const cardBlocked = !creditCard;

  return (
    <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto">
      <div className="flex justify-between items-center mb-3">
        <p className="font-bold text-base">{time}hs</p>
        <button onClick={onClose} className="text-zinc-500 hover:text-white text-sm leading-none">✕</button>
      </div>

      <p className="text-xs text-zinc-400 mb-3">
        {waitingList ? "Lista de espera" : available > 0 ? `${available} cupos disponibles` : "Sin cupos"}
      </p>

      <p className="text-xs text-zinc-400 mb-2">Tipo de reserva</p>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { onTypeChange(reserveType === "mensual" ? null : "mensual"); }}
          className={`flex-1 text-xs font-semibold py-1.5 rounded-xl border transition ${
            reserveType === "mensual"
              ? "bg-green-600 border-green-600 text-white"
              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => { onTypeChange(reserveType === "unica" ? null : "unica"); }}
          className={`flex-1 text-xs font-semibold py-1.5 rounded-xl border transition ${
            reserveType === "unica"
              ? "bg-green-600 border-green-600 text-white"
              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          Única vez
        </button>
      </div>

      {reserveType === "unica" && (
        <>
          <p className="text-xs text-zinc-400 mb-2">Método de pago</p>

            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 mb-3 text-xs">
              {loadingCard ? (
                <p className="text-zinc-400">Cargando tarjeta...</p>
              ) : creditCard ? (
                <>
                  <p className="text-zinc-200 font-semibold">{creditCard.cardHolder}</p>
                  <p className="text-zinc-400 mt-0.5">•••• •••• •••• {creditCard.cardNumber.slice(-4)}</p>
                  <p className="text-zinc-500 mt-0.5">
                    Vence{" "}
                    {new Date(creditCard.expireDate).toLocaleDateString("es-AR", {
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </p>
                </>
              ) : (
                <p className="text-red-400">No tenés tarjeta registrada</p>
              )}
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 mb-4 text-xs">
              <button className="text-zinc-400 mb-1" onClick={() => setPayment(0.5)}>
                Seña del 50%
              </button>
              <button className="text-zinc-400 mb-1" onClick={() => setPayment(1)}>
                Pago total
              </button>
              <p className="text-white font-bold text-lg">${(amount * (payment ?? 1)).toFixed(2)}</p>
            </div>
        </>
      )}

      <button
        onClick={() => void 0}
        disabled={!canConfirm || cardBlocked}
        className={`w-full text-xs font-semibold py-2 rounded-xl transition ${
          canConfirm && !cardBlocked
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

interface AppointmentSlot {
  time: string;
  available: number;
  waitingList: boolean;
  price: number;
  dayOfWeek: number;
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
  const [creditCard, setCreditCard] = useState<CreditCard | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const fetchCard = async () => {
      try {
        setLoadingCard(true);
        const clientRes = await fetch(`/api/client/user/${userId}`);
        if (!clientRes.ok) return;
        const client = await clientRes.json();
        const cardRes = await fetch(`/api/credit-card/client/${client.id}`);
        if (!cardRes.ok) return;
        setCreditCard(await cardRes.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCard(false);
      }
    };
    fetchCard();
  }, []);

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

  function getAppointment(day: string, time: string): AppointmentSlot | null {
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
    const dayOfWeek = new Date(appt.initialDate).getDay();
    return { time, available, waitingList, price: appt.price ?? 0, dayOfWeek };
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
    // TODO: trigger real reservation + payment flow
    alert(`Reservando ${activeSlot.time} el ${activeSlot.day}\nTipo: ${reserveType}\}`);
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
                                price={appt.price}
                                dayOfWeek={appt.dayOfWeek}
                                reserveType={reserveType}
                                onTypeChange={setReserveType}
                                onClose={() => {
                                  setActiveSlot(null);
                                  setReserveType(null);
                                }}
                                creditCard={creditCard}
                                loadingCard={loadingCard}
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
