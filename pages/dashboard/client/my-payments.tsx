import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import toast from "react-hot-toast";

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
  const [overdueDebts, setOverdueDebts] = useState<PendingPaymentItem[]>([]);
  const [completed, setCompleted] = useState<PendingPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | number | null>(null);

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
      const overdue: PendingPaymentItem[] = [];
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
          if (apptDate < now) {
            overdue.push({ userAppointmentId: ua.id, state: "IMPAGO", appointment: apptInfo });
          } else if (
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
      setOverdueDebts(overdue);
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
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAppointmentId,
          paymentDate: new Date().toISOString(),
          amount,
          paymentMethod: "online",
        }),
      });
      if (res.ok) {
        toast.success("Pago registrado correctamente");
      } else {
        toast.error("Error al procesar el pago");
      }
      await fetchPayments();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setPaying(null);
    }
  };

  const handlePayAllDebts = async () => {
    setPaying("debts");
    try {
      const results = await Promise.all(
        overdueDebts.map((item) =>
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
      );
      if (results.every((r) => r.ok)) {
        toast.success("Deudas saldadas. Ya podés reservar turnos.");
      } else {
        toast.error("Algunos pagos fallaron");
      }
      await fetchPayments();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setPaying(null);
    }
  };

  const handlePayActivity = async (activityName: string, items: PendingPaymentItem[]) => {
    const key = `activity:${activityName}`;
    setPaying(key);
    try {
      const results = await Promise.all(
        items.map((item) =>
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
      );
      if (results.every((r) => r.ok)) {
        toast.success(`Pago de ${activityName} registrado`);
      } else {
        toast.error("Algunos pagos fallaron");
      }
      await fetchPayments();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setPaying(null);
    }
  };

  const now = new Date();
  const isSuspended = overdueDebts.length >= 3;
  const totalDebt = overdueDebts.reduce((s, i) => s + i.appointment.price, 0);
  const monthlyByActivity = pendingMonthly.reduce<Record<string, PendingPaymentItem[]>>(
    (acc, item) => {
      const key = item.appointment.activity?.name ?? "Sin actividad";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {}
  );

  return (
    <DashboardLayout role="CLIENT">
      <h1 className="text-3xl font-bold mb-8">Mis pagos</h1>

      {loading ? (
        <p className="text-zinc-400 text-sm">Cargando...</p>
      ) : (
        <div className="space-y-10">

          {/* ── Deudas vencidas / Suspensión ── */}
          {overdueDebts.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                Deudas vencidas
              </h3>
              <div className={`rounded-2xl px-5 py-4 border ${
                isSuspended ? "bg-red-950/40 border-red-800" : "bg-zinc-900 border-zinc-800"
              }`}>
                {isSuspended && (
                  <p className="text-red-400 font-semibold text-sm mb-3">
                    ⚠️ Cuenta suspendida — tenés {overdueDebts.length} turnos impagos vencidos. No podés reservar nuevos turnos hasta regularizar.
                  </p>
                )}
                <div className="space-y-1.5 mb-4">
                  {overdueDebts.map((item) => {
                    const date = new Date(item.appointment.initialDate);
                    return (
                      <div key={item.userAppointmentId} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-300 capitalize">
                          {item.appointment.activity?.name ?? "—"} —{" "}
                          {date.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                        <span className="text-red-400">${item.appointment.price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                  <p className="text-red-400 font-bold text-lg">${totalDebt.toFixed(2)}</p>
                  <button
                    onClick={handlePayAllDebts}
                    disabled={paying === "debts"}
                    className="text-sm font-semibold px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white transition"
                  >
                    {paying === "debts" ? "Pagando..." : "Pagar todas las deudas"}
                  </button>
                </div>
              </div>
            </div>
          )}

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
              <div className="space-y-4">
                {Object.entries(monthlyByActivity).map(([activityName, items]) => {
                  const activityTotal = items.reduce((s, i) => s + i.appointment.price, 0);
                  const payingKey = `activity:${activityName}`;
                  const sorted = [...items].sort(
                    (a, b) => new Date(a.appointment.endDate).getTime() - new Date(b.appointment.endDate).getTime()
                  );
                  const actDeadline = sorted.length > 0 ? new Date(sorted[0].appointment.endDate) : null;
                  const actOverdue = actDeadline !== null && now > actDeadline;
                  return (
                    <div key={activityName} className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold capitalize">{activityName}</p>
                          <p className={`text-xs mt-0.5 ${actOverdue ? "text-red-400" : "text-zinc-400"}`}>
                            {actDeadline
                              ? `Vence el ${actDeadline.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}${actOverdue ? " — vencido" : ""}`
                              : "Sin vencimiento"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${actOverdue ? "text-red-400" : "text-yellow-400"}`}>
                            ${activityTotal.toFixed(2)}
                          </p>
                          <p className="text-zinc-500 text-xs mt-0.5">
                            {items.length} clase{items.length !== 1 ? "s" : ""}
                          </p>
                          <button
                            onClick={() => handlePayActivity(activityName, items)}
                            disabled={paying === payingKey}
                            className="mt-2 text-xs font-semibold px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white transition"
                          >
                            {paying === payingKey ? "Pagando..." : `Pagar $${activityTotal.toFixed(2)}`}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5 border-t border-zinc-800 pt-3">
                        {items.map((item) => {
                          const date = new Date(item.appointment.initialDate);
                          return (
                            <div key={item.userAppointmentId} className="flex items-center justify-between text-sm">
                              <span className="text-zinc-300">
                                {date.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                              </span>
                              <span className="text-zinc-400">${item.appointment.price.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
