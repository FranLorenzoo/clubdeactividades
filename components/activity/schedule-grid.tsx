import { useEffect, useState } from "react";

const ALL_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const CLUB_TIME_ZONE = "America/Argentina/Buenos_Aires";

const WEEKDAY_SHORT_TO_LABEL: Record<string, string> = {
  Mon: "Lunes",
  Tue: "Martes",
  Wed: "Miércoles",
  Thu: "Jueves",
  Fri: "Viernes",
  Sat: "Sábado",
  Sun: "Domingo",
};

const WEEKDAY_SHORT_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

type ReserveType = "mensual" | "unica" | null;

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

function formatWeekLabel(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
  return `Semana del ${fmt(start)} al ${fmt(end)}`;
}

function getWeekOffsetForDate(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - daysSinceMonday);

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const targetDayOfWeek = d.getDay();
  const targetDaysSinceMonday = targetDayOfWeek === 0 ? 6 : targetDayOfWeek - 1;
  const targetMonday = new Date(d);
  targetMonday.setDate(d.getDate() - targetDaysSinceMonday);

  return Math.round((targetMonday.getTime() - currentMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

function remainingClassesThisMonth(dayOfWeek: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  let count = 0;
  const day = new Date(today);
  while (day <= endOfMonth) {
    if (day.getDay() === dayOfWeek) count++;
    day.setDate(day.getDate() + 1);
  }
  return count;
}

function calcAmount(reserveType: ReserveType, price: number, dayOfWeek: number): number {
  if (reserveType === "unica") return price * 0.5;
  const remaining = remainingClassesThisMonth(dayOfWeek);
  return price * remaining * 0.85;
}

function getClubWeekdayShort(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: CLUB_TIME_ZONE,
  }).format(date);
}

function getClubDayLabel(date: Date): string {
  return WEEKDAY_SHORT_TO_LABEL[getClubWeekdayShort(date)] ?? "";
}

function getClubDayIndex(date: Date): number {
  return WEEKDAY_SHORT_TO_INDEX[getClubWeekdayShort(date)] ?? date.getDay();
}

function getClubTimeLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: CLUB_TIME_ZONE,
  }).format(date);
}

interface CreditCard {
  id: number;
  cardNumber: string;
  cardHolder: string;
  expireDate: string;
}

function isInWaitingList(ua: any): boolean {
  const queue = [...(ua.appointment?.userAppointments ?? [])].sort((a: any, b: any) => {
    const timeDiff = new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime();
    if (timeDiff !== 0) return timeDiff;
    return Number(a.id) - Number(b.id);
  });
  const capacity = Number(ua.appointment?.slotsAvailable ?? 0);
  const index = queue.findIndex((item: any) => item.id === ua.id);
  return index !== -1 && index >= capacity;
}

// ─── Detail popup (admin / employee) ─────────────────────────────────────────

interface DetailPopupProps {
  time: string;
  available: number;
  waitingList: boolean;
  price: number;
  professorName: string;
  onClose: () => void;
}

function DetailPopup({ time, available, waitingList, price, professorName, onClose }: DetailPopupProps) {
  return (
    <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto">
      <div className="flex justify-between items-center mb-3">
        <p className="font-bold text-base">{time}hs</p>
        <button onClick={onClose} className="text-zinc-500 hover:text-white text-sm leading-none">✕</button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">Profesor</span>
          <span className="text-zinc-200 font-medium">{professorName || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Cupos</span>
          <span className={waitingList ? "text-orange-400 font-medium" : available === 0 ? "text-red-400 font-medium" : "text-green-400 font-medium"}>
            {waitingList ? "Lista de espera" : available > 0 ? `${available} disponibles` : "Sin cupos"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Precio</span>
          <span className="text-zinc-200 font-medium">${price.toFixed(2)}</span>
        </div>
      </div>

      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-700" />
    </div>
  );
}

// ─── Reserve popup (client) ───────────────────────────────────────────────────

interface ReservePopupProps {
  time: string;
  available: number;
  waitingList: boolean;
  price: number;
  dayOfWeek: number;
  alreadyReserved: boolean;
  reservedInWaitingList: boolean;
  reserveType: ReserveType;
  onTypeChange: (t: ReserveType) => void;
  onClose: () => void;
  onConfirm: (reserveType: ReserveType, paymentMultiplier: number) => void;
  confirming: boolean;
  creditCard: CreditCard | null;
  loadingCard: boolean;
  suspended: boolean;
}

function ReservePopup({
  time, available, waitingList, price, dayOfWeek, alreadyReserved, reservedInWaitingList,
  reserveType, onTypeChange, onClose, onConfirm, confirming,
  creditCard, loadingCard, suspended,
}: ReservePopupProps) {
  const [payment, setPayment] = useState<number | null>(1);
  const hasCard = Boolean(creditCard);
  const selectionBlocked = !hasCard || loadingCard;
  const amount = reserveType ? calcAmount(reserveType, price, dayOfWeek) : 0;
  const canConfirm = reserveType !== null && hasCard;
  const cardBlocked = !hasCard;

  useEffect(() => {
    if (!hasCard && reserveType !== null) {
      onTypeChange(null);
    }
  }, [hasCard, reserveType, onTypeChange]);

  if (suspended) {
    return (
      <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 bg-zinc-900 border border-red-800 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto">
        <div className="flex justify-between items-center mb-3">
          <p className="font-bold text-base text-red-400">Cuenta suspendida</p>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-sm leading-none">✕</button>
        </div>
        <p className="text-zinc-400 text-xs leading-relaxed">
          Tenés 3 o más turnos impagos vencidos. Ir a{" "}
          <a href="/dashboard/client/my-payments" className="text-zinc-200 underline font-semibold">Mis pagos</a>{" "}
          para regularizar tu situación y volver a reservar.
        </p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-red-800" />
      </div>
    );
  }

  return (
    <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto">
      <div className="flex justify-between items-center mb-3">
        <p className="font-bold text-base">{time}hs</p>
        <button onClick={onClose} className="text-zinc-500 hover:text-white text-sm leading-none">✕</button>
      </div>

      <p className="text-xs text-zinc-400 mb-3">
        {available > 0 ? `${available} cupos disponibles` : "Sin cupos disponibles. Podés anotarte en lista de espera."}
      </p>

      {alreadyReserved && (
        <p className="text-xs text-yellow-400 font-medium mb-3">
          {reservedInWaitingList ? "Estás en lista de espera para este turno." : "Ya tenés este turno reservado."}
        </p>
      )}

      {!loadingCard && !hasCard && (
        <p className="text-xs text-red-400 font-medium mb-3">
          Necesitás registrar una tarjeta para poder reservar.
        </p>
      )}

      <p className="text-xs text-zinc-400 mb-2">Tipo de reserva</p>
      <div
        className="flex gap-2 mb-4"
        style={{
          pointerEvents: alreadyReserved || selectionBlocked ? "none" : "auto",
          opacity: alreadyReserved || selectionBlocked ? 0.4 : 1,
        }}
      >
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

          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 text-xs font-semibold py-1.5 rounded-xl border transition ${
                payment === 0.5
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              }`}
              onClick={() => setPayment(0.5)}
            >
              Seña del 50%
            </button>
            <button
              className={`flex-1 text-xs font-semibold py-1.5 rounded-xl border transition ${
                payment === 1
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              }`}
              onClick={() => setPayment(1)}
            >
              Pago total
            </button>
          </div>
          <p className="pb-3 text-white font-bold text-lg">${(amount * (payment ?? 1)).toFixed(2)}</p>
        </>
      )}

      <button
        onClick={() => onConfirm(reserveType, payment ?? 1)}
        disabled={alreadyReserved || !canConfirm || cardBlocked || confirming}
        className={`w-full text-xs font-semibold py-2 rounded-xl transition ${
          !alreadyReserved && canConfirm && !cardBlocked && !confirming
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
        }`}
      >
        {confirming ? "Reservando..." : "Confirmar"}
      </button>
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-700" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AppointmentSlot {
  id: number;
  time: string;
  available: number;
  waitingList: boolean;
  price: number;
  dayOfWeek: number;
  professorName: string;
  alreadyReserved: boolean;
  reservedInWaitingList: boolean;
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
  const [weekOffset, setWeekOffset] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [clientLastName, setClientLastName] = useState<string>("");

  const { start: weekStart, end: weekEnd } = getWeekRange(weekOffset);
  const weekLabel = formatWeekLabel(weekStart, weekEnd);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const fetchCard = async () => {
      try {
        setLoadingCard(true);
        const clientRes = await fetch(`/api/client/user/${userId}`);
        if (!clientRes.ok) return;
        const client = await clientRes.json();
        setClientId(client.id);
        setClientEmail(client.user.email);
        setClientName(client.user.name);
        setClientLastName(client.user.lastName);
        const uaRes = await fetch(`/api/user-appointment/client/${client.id}`);
        if (uaRes.ok) {
          const uas: any[] = await uaRes.json();
          const now = new Date();
          const overdueCount = uas.filter(
              (ua) =>
                ua.state === "IMPAGO" &&
                new Date(ua.appointment.initialDate) < now &&
                !isInWaitingList(ua)
          ).length;
          setSuspended(overdueCount >= 3);
        }
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
        console.log("Appointments:", data);
        if (Array.isArray(data) && data.length > 0) {
          const now = new Date();
          const upcoming = (data as any[])
            .map((appointment) => new Date(appointment.initialDate))
            .filter((date) => date >= now)
            .sort((dateA, dateB) => dateA.getTime() - dateB.getTime());
          if (upcoming.length > 0) {
            setWeekOffset(getWeekOffsetForDate(upcoming[0]));
          }
        }
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
      if (date < weekStart || date > weekEnd) return false;
      const apptDay = getClubDayLabel(date);
      const apptTime = getClubTimeLabel(date);
      return apptDay === day && apptTime === time;
    });
    if (!appt) return null;
    const count = appt.userAppointments?.length ?? 0;
    const capacity = appt.slotsAvailable ?? 10;
    const waitingList = count >= capacity;
    const available = waitingList ? 0 : capacity - count;
    const dayOfWeek = getClubDayIndex(new Date(appt.initialDate));
    const professorName = appt.professor?.user?.name ?? "";
    const alreadyReserved = clientId !== null && (appt.userAppointments?.some((ua: any) => ua.clientId === clientId) ?? false);
    const sortedReservations = [...(appt.userAppointments ?? [])].sort((a: any, b: any) => {
      const timeDiff = new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime();
      if (timeDiff !== 0) return timeDiff;
      return Number(a.id) - Number(b.id);
    });
    const clientReservation =
      clientId !== null ? sortedReservations.find((ua: any) => ua.clientId === clientId) : null;
    const clientIndex = clientReservation
      ? sortedReservations.findIndex((ua: any) => ua.id === clientReservation.id)
      : -1;
    const reservedInWaitingList = clientIndex >= capacity;
    return {
      id: appt.id,
      time,
      available,
      waitingList,
      price: appt.price ?? 0,
      dayOfWeek,
      professorName,
      alreadyReserved,
      reservedInWaitingList,
    };
  }

  async function handleConfirm(selectedReserveType: ReserveType, paymentMultiplier: number) {
    if (!clientId || !activeSlot) return;
    const clickedAppt = getAppointment(activeSlot.day, activeSlot.time);
    if (!clickedAppt) return;

    setConfirming(true);
    try {
      const now = new Date();

      if (selectedReserveType === "unica") {
        const originalAppt = appointments.find((appt) => appt.id === clickedAppt.id);
        if (!originalAppt) return;
        const count = originalAppt.userAppointments?.length ?? 0;
        const capacity = originalAppt.slotsAvailable ?? 10;
        const isWaitlistReservation = count >= capacity;
        const state = isWaitlistReservation
          ? "IMPAGO"
          : paymentMultiplier === 1
            ? "PAGO_COMPLETO"
            : "PAGO_PARCIAL";
        const response = await fetch("/api/user-appointment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId: clickedAppt.id,
            clientId,
            rejected: false,
            state,
            reservationDate: now.toISOString(),
          }),
        });
        if(response.ok) {
          await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: clientEmail,
              subject: "Reserva realizada",
              text: "",
            }),
          });
        }
      } else if (selectedReserveType === "mensual") {
        const originalAppt = appointments.find((appt) => appt.id === clickedAppt.id);
        if (!originalAppt) return;
        const targetDay = getClubDayIndex(new Date(originalAppt.initialDate));

        const relevantAppointments = appointments.filter((appt) => {
          const apptDate = new Date(appt.initialDate);
          const alreadyBooked = appt.userAppointments?.some((ua: any) => ua.clientId === clientId) ?? false;
          return apptDate >= now && getClubDayIndex(apptDate) === targetDay && !alreadyBooked;
        });

        const responses = await Promise.all(
          relevantAppointments.map((appt) => {
            return fetch("/api/user-appointment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appointmentId: appt.id,
                clientId,
                rejected: false,
                state: "IMPAGO",
                reservationDate: now.toISOString(),
              }),
            });
          })
        );
        const successful = responses.every(response => response.ok);
        if(successful) {
          await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: clientEmail,
              subject: "Reserva realizada",
              text: "Tu reserva fue registrada correctamente",
            }),
          });
        }
      }

      const refreshRes = await fetch(`/api/appointment/activity/${activityId}`);
      const refreshedData = await refreshRes.json();
      setAppointments(refreshedData);
      setActiveSlot(null);
      setReserveType(null);
    } catch (error) {
      console.error(error);
    } finally {
      setConfirming(false);
    }
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

  const isStaff = userRole === "ADMIN" || userRole === "EMPLOYEE";

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Turnos disponibles</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setWeekOffset((o) => o - 1); setActiveSlot(null); setReserveType(null); }}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-lg"
            aria-label="Semana anterior"
          >
            ‹
          </button>
          <span className="text-sm text-zinc-400 min-w-[200px] text-center">{weekLabel}</span>
          <button
            onClick={() => { setWeekOffset((o) => o + 1); setActiveSlot(null); setReserveType(null); }}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-lg"
            aria-label="Semana siguiente"
          >
            ›
          </button>
        </div>
      </div>

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
                              isStaff ? (
                                <DetailPopup
                                  time={time}
                                  available={appt.available}
                                  waitingList={appt.waitingList}
                                  price={appt.price}
                                  professorName={appt.professorName}
                                  onClose={() => { setActiveSlot(null); setReserveType(null); }}
                                />
                              ) : (
                                <ReservePopup
                                  time={time}
                                  available={appt.available}
                                  waitingList={appt.waitingList}
                                  price={appt.price}
                                  dayOfWeek={appt.dayOfWeek}
                                  alreadyReserved={appt.alreadyReserved}
                                  reservedInWaitingList={appt.reservedInWaitingList}
                                  reserveType={reserveType}
                                  onTypeChange={setReserveType}
                                  onClose={() => { setActiveSlot(null); setReserveType(null); }}
                                  onConfirm={handleConfirm}
                                  confirming={confirming}
                                  creditCard={creditCard}
                                  loadingCard={loadingCard}
                                  suspended={suspended}
                                />
                              )
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
