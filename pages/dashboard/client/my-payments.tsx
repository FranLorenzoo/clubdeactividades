import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface AppointmentInfo {
  id: number;
  initialDate: string;
  endDate: string;
  price: number;
  activity: { id: number; name: string } | null;
}

interface PendingPaymentItem {
  userAppointmentId: number;
  state: "PAGO_PARCIAL" | "IMPAGO" | "PAGO_COMPLETO";
  appointment: AppointmentInfo;
}

export default function MisPagosPage() {
  const [pendingPartial, setPendingPartial] = useState<PendingPaymentItem[]>([]);
  const [pendingMonthly, setPendingMonthly] = useState<PendingPaymentItem[]>([]);
  const [completed, setCompleted] = useState<PendingPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<"monthly" | number | null>(null);

  const fetchPayments = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) { setLoading(false); return; }
    try {
      const clientRes = await fetch(`/api/client/user/${userId}`);
      if (!clientRes.ok) return;
      const client = await clientRes.json();

      const uaRes = await fetch(`/api/user-appointment/client/${client.id}`);
      if (!uaRes.ok) return;
      const userAppointments: any[] = await uaRes.json();

      const now = new Date();
      const currentUTCMonth = now.getUTCMonth();
      const currentUTCYear = now.getUTCFullYear();

      const partial: PendingPaymentItem[] = [];
      const impago: PendingPaymentItem[] = [];
      const done: PendingPaymentItem[] = [];

      for (const ua of userAppointments) {
        const apptInfo: AppointmentInfo = {
          id: ua.appointment.id,
          initialDate: ua.appointment.initialDate,
          endDate: ua.appointment.endDate,
          price: ua.appointment.price,
          activity: ua.appointment.activity ?? null,
        };
        if (ua.state === "PAGO_PARCIAL") {
          partial.push({ userAppointmentId: ua.id, state: "PAGO_PARCIAL", appointment: apptInfo });
        } else if (ua.state === "IMPAGO") {
          const apptDate = new Date(ua.appointment.initialDate);
          if (
            apptDate.getUTCMonth() === currentUTCMonth &&
            apptDate.getUTCFullYear() === currentUTCYear
          ) {
            impago.push({ userAppointmentId: ua.id, state: "IMPAGO", appointment: apptInfo });
          }
        } else if (ua.state === "PAGO_COMPLETO") {
          done.push({ userAppointmentId: ua.id, state: "PAGO_COMPLETO", appointment: apptInfo });
        }
      }

      setPendingPartial(partial);
      setPendingMonthly(impago);
      setCompleted(done);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handlePayPartial = async (userAppointmentId: number, amount: number) => {
    setPaying(userAppointmentId);
    try {
      await fetch(`/api/user-appointment/${userAppointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: "PAGO_COMPLETO" }),
      });
      await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAppointmentId,
          paymentDate: new Date().toISOString(),
          amount,
          paymentMethod: "online",
        }),
      });
      await fetchPayments();
    } finally {
      setPaying(null);
    }
  };

  const handlePayMonthly = async () => {
    setPaying("monthly");
    try {
      await Promise.all(
        pendingMonthly.map((item) =>
          fetch(`/api/user-appointment/${item.userAppointmentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: "PAGO_COMPLETO" }),
          }).then(() =>
            fetch("/api/payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userAppointmentId: item.userAppointmentId,
                paymentDate: new Date().toISOString(),
                amount: item.appointment.price,
                paymentMethod: "online",
              }),
            })
          )
        )
      );
      await fetchPayments();
    } finally {
      setPaying(null);
    }
  };

  const monthlyTotal = pendingMonthly.reduce((sum, item) => sum + item.appointment.price, 0);
  const now = new Date();
  const sortedMonthly = [...pendingMonthly].sort(
    (a, b) => new Date(a.appointment.endDate).getTime() - new Date(b.appointment.endDate).getTime()
  );
  const deadline = sortedMonthly.length > 0 ? new Date(sortedMonthly[0].appointment.endDate) : null;
  const isOverdue = deadline !== null && now > deadline;

  return (
    <DashboardLayout role="CLIENT">
      <h1 className="text-3xl font-bold mb-8">Mis pagos</h1>

      {loading ? (
        <p className="text-zinc-400 text-sm">Cargando...</p>
      ) : (
        <div className="space-y-10">

          {/* ── Reservas únicas con seña pendiente ── */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
              Reservas únicas — seña pendiente
            </h3>
            {pendingPartial.length === 0 ? (
              <p className="text-zinc-500 text-sm">No tenés reservas únicas con pago pendiente.</p>
            ) : (
              <div className="space-y-3">
                {pendingPartial.map((item) => {
                  const date = new Date(item.appointment.initialDate);
                  const dateLabel = date.toLocaleDateString("es-AR", {
                    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
                  });
                  const pendingAmount = item.appointment.price * 0.5;
                  return (
                    <div
                      key={item.userAppointmentId}
                      className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4"
                    >
                      <div>
                        <p className="font-semibold capitalize">
                          {item.appointment.activity?.name ?? "—"}
                        </p>
                        <p className="text-zinc-400 text-sm mt-0.5 capitalize">{dateLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-400 font-bold text-lg">${pendingAmount.toFixed(2)}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">50% restante</p>
                        <button
                          onClick={() => handlePayPartial(item.userAppointmentId, pendingAmount)}
                          disabled={paying === item.userAppointmentId}
                          className="mt-2 text-xs font-semibold px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white transition"
                        >
                          {paying === item.userAppointmentId ? "Pagando..." : `Pagar $${pendingAmount.toFixed(2)}`}
                        </button>
                        {(() => {
                          const end = new Date(item.appointment.endDate);
                          const over = now > end;
                          return (
                            <p className={`text-xs mt-0.5 ${over ? "text-red-400" : "text-zinc-500"}`}>
                              Vence {end.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}{over ? " — vencido" : ""}
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Pago mensual del mes corriente ── */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
              Pago mensual — {now.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
            </h3>
            {pendingMonthly.length === 0 ? (
              <p className="text-zinc-500 text-sm">No tenés clases mensuales pendientes de pago este mes.</p>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold capitalize">
                      {now.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
                    </p>
                    <p className={`text-xs mt-0.5 ${isOverdue ? "text-red-400" : "text-zinc-400"}`}>
                      {deadline
                        ? `Vence el ${deadline.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}${isOverdue ? " — vencido" : ""}`
                        : "Sin vencimiento"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${isOverdue ? "text-red-400" : "text-yellow-400"}`}>
                      ${monthlyTotal.toFixed(2)}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {pendingMonthly.length} clase{pendingMonthly.length !== 1 ? "s" : ""}
                    </p>
                    <button
                      onClick={handlePayMonthly}
                      disabled={paying === "monthly"}
                      className="mt-2 text-xs font-semibold px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white transition"
                    >
                      {paying === "monthly" ? "Pagando..." : `Pagar $${monthlyTotal.toFixed(2)}`}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 border-t border-zinc-800 pt-3">
                  {pendingMonthly.map((item) => {
                    const date = new Date(item.appointment.initialDate);
                    return (
                      <div key={item.userAppointmentId} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-300 capitalize">
                          {item.appointment.activity?.name ?? "—"} —{" "}
                          {date.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                        </span>
                        <span className="text-zinc-400">${item.appointment.price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Pagos realizados ── */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
              Pagos realizados
            </h3>
            {completed.length === 0 ? (
              <p className="text-zinc-500 text-sm">No tenés pagos registrados todavía.</p>
            ) : (
              <div className="space-y-2">
                {completed
                  .sort((a, b) => new Date(b.appointment.initialDate).getTime() - new Date(a.appointment.initialDate).getTime())
                  .map((item) => {
                    const date = new Date(item.appointment.initialDate);
                    const dateLabel = date.toLocaleDateString("es-AR", {
                      weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
                    });
                    return (
                      <div
                        key={item.userAppointmentId}
                        className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3"
                      >
                        <div>
                          <p className="font-semibold capitalize text-sm">
                            {item.appointment.activity?.name ?? "—"}
                          </p>
                          <p className="text-zinc-500 text-xs mt-0.5 capitalize">{dateLabel}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">${item.appointment.price.toFixed(2)}</p>
                          <p className="text-zinc-500 text-xs mt-0.5">Pagado</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
