import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

type ClientProfileData = {
  id: number;
  suspended: boolean;
  active: boolean;

  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    dni: string;
    age: number;
  };

  userAppointments: {
    id: number;
    reservationDate: string;
    state: string;
    type: "ABONADO" | "NO_ABONADO";
    rejected: boolean;
    attended: boolean;
    price?: number;
    totalPaid?: number;
    remainingDebt?: number;

    payments?: {
      id: number;
      amount: number;
      paymentMethod: string;
      paymentDate: string;
    }[];

    appointment: {
      id: number;
      initialDate: string;
      activity: {
        id: number;
        name: string;
      };
    };
  }[];
};

type Props = {
  clientId: number;
};

export default function ClientProfile({ clientId }: Props) {
  const [client, setClient] = useState<ClientProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showRefunds, setShowRefunds] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<any | null>(null);
  const [showConfirmRefund, setShowConfirmRefund] = useState(false);

  const router = useRouter();
const from =
  (router.query.from as string) ||
  (typeof window !== "undefined"
    ? sessionStorage.getItem("fromRole")
    : null);
console.log("from:", from);

  const [showHistory, setShowHistory] = useState(false);
  const [showDebts, setShowDebts] = useState(false);

  const [selectedPayment, setSelectedPayment] =
    useState<ClientProfileData["userAppointments"][0] | null>(null);

  const [showConfirmPayment, setShowConfirmPayment] = useState(false);

  async function refreshClient() {
    try {
      setLoading(true);

      const res = await fetch(`/api/client/${clientId}`, { 
        cache: "no-store",
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();

      setClient(data);
    } catch {
      toast.error("Error al cargar cliente");
    } finally {
      setLoading(false);
    }
  }

  async function registerPayment(userAppointmentId: number) {
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAppointmentId,
          paymentMethod: "CASH",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error al registrar pago");
        return;
      }

      toast.success("Pago registrado correctamente");
      await refreshClient();
    } catch {
      toast.error("Error al registrar pago");
    }
  }

  async function markAttendance(userAppointmentId: number) {
    try {
      const res = await fetch(`/api/user-appointment/attend/${userAppointmentId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Error al registrar asistencia");
        return;
      }
      toast.success("Asistencia registrada");
      await refreshClient();
    } catch {
      toast.error("Error al registrar asistencia");
    }
  }


    useEffect(() => {
  if (router.query.from) {
    sessionStorage.setItem("fromRole", router.query.from as string);
  }
}, [router.query.from]);
  useEffect(() => {
    refreshClient();
  }, [clientId]);

  const pendingPaymentsCount =
    client?.userAppointments.filter((r) => r.state !== "PAGO_COMPLETO")
      .length ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Cargando perfil...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Cliente no encontrado
      </div>
    );
  }

  const pendingRefunds = client?.userAppointments.flatMap((r) => {
    // 1. Si el backend determinó que la reserva ya está saldada o en PAGO_COMPLETO,
    // significa que el reembolso en efectivo ya fue entregado y balanceado a cero.
    if (r.state === "PAGO_COMPLETO") {
      return [];
    }

    // 2. Filtramos todos los movimientos CASH de esta reserva
    const cashPayments = r.payments?.filter(p => p.paymentMethod === "CASH") || [];
    
    // 3. Sumamos los montos CASH para comprobar si hay saldo negativo pendiente
    const netCashAmount = cashPayments.reduce((sum, p) => sum + p.amount, 0);

    if (netCashAmount < 0) {
      const originalNegative = cashPayments.find(p => p.amount < 0);
      if (originalNegative) {
        return [{
          id: originalNegative.id, // ID del pago para la API de confirmación
          amount: originalNegative.amount,
          userAppointmentId: r.id,
          activityName: r.appointment.activity.name,
          initialDate: r.appointment.initialDate,
        }];
      }
    }
    return [];
  }) ?? [];

  const pendingRefundsCount = pendingRefunds.length;


  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="mb-6">
        <button
          onClick={() => {
            router.push(`/dashboard/${from ?? "admin"}/search-client`);
            }}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
        >
          ← Volver a clientes
        </button>
      </div>

      <div className="rounded-3xl p-8 mb-8 bg-gradient-to-r from-[#00A63E] to-[#02436B] shadow-xl">
        <h1 className="text-4xl font-bold">Perfil del Cliente</h1>
        <p className="text-zinc-100 mt-2 text-lg">
          {client.user.name} {client.user.lastName}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-6">👤 Datos Personales</h2>
          <div className="space-y-4">
            <p>Nombre: {client.user.name}</p>
            <p>Apellido: {client.user.lastName}</p>
            <p>Email: {client.user.email}</p>
            <p>DNI: {client.user.dni}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h2 className="text-2xl font-bold mb-6">📅 Actividad</h2>

          <p className="text-zinc-400">Reservas realizadas</p>

          <p className="text-5xl font-bold text-[#00A63E] mt-2">
            {client.userAppointments.length}
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-5 py-3 rounded-xl bg-[#00A63E] hover:bg-green-700 transition font-semibold w-full"
            >
              {showHistory ? "Ocultar historial" : "Ver historial"}
            </button>

            <button
              onClick={() => setShowDebts(!showDebts)}
              className="px-5 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-700 transition font-semibold w-full"
            >
              {showDebts
                ? "Ocultar pagos pendientes"
                : `Ver pagos pendientes (${pendingPaymentsCount})`}
            </button>

            <button
              onClick={() => setShowRefunds(!showRefunds)}
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-semibold w-full"
            >
              {showRefunds
                ? "Ocultar dinero a devolver"
                : `Ver dinero a devolver (${pendingRefundsCount})`}
            </button>

          <button
            onClick={() => setShowReservationModal(true)}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold w-full"
          >
            Reservar turno
          </button>
          </div>
        </div>

        {showHistory && (
          <div className="bg-zinc-900 p-6 rounded-3xl lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Historial</h2>

            {client.userAppointments.map((r) => {
              const apptStart = new Date(r.appointment.initialDate);
              const isUpcoming = apptStart.getTime() >= Date.now();
              return (
                <div key={r.id} className="p-4 border border-zinc-700 rounded mb-3">
                  <p>⚽ {r.appointment.activity.name}</p>
                  <p>📅 {new Date(r.reservationDate).toLocaleDateString()}</p>

                  <p
                    className={`font-bold mt-2 ${
                      r.state === "PAGO_COMPLETO"
                        ? "text-green-400"
                        : r.state === "PAGO_PARCIAL"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    Estado: {r.state}
                  </p>

                  <p>💰 Total: ${r.price ?? 0}</p>
                  <p>💳 Pagado: ${r.totalPaid ?? 0}</p>
                  <p>🧾 Debe: ${r.remainingDebt ?? 0}</p>

                  {r.attended ? (
                    <p className="mt-3 text-green-400 text-sm font-semibold">Asistió ✅</p>
                  ) : isUpcoming ? (
                    <button
                      onClick={() => markAttendance(r.id)}
                      className="mt-3 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition text-sm font-semibold"
                    >
                      Tomar asistencia
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {showDebts && (() => {
          const pending = client.userAppointments.filter((r) => r.state !== "PAGO_COMPLETO");
          const monthly = pending.filter((r) => r.type === "ABONADO");
          const singles = pending.filter((r) => r.type !== "ABONADO");

          const monthlyByActivity = monthly.reduce<Record<string, typeof monthly>>(
            (acc, item) => {
              const key = item.appointment.activity?.name ?? "Sin actividad";
              (acc[key] ??= []).push(item);
              return acc;
            },
            {}
          );

          return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">💰 Pagos pendientes</h2>

              {pending.length === 0 ? (
                <p className="text-zinc-400">No hay pagos pendientes 🎉</p>
              ) : (
                <div className="space-y-6">
                  {Object.keys(monthlyByActivity).length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                        Mensualidades
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(monthlyByActivity).map(([activityName, items]) => {
                          const activityTotal = items.reduce((s, i) => s + (i.price ?? 0), 0);
                          const activityDebt = items.reduce((s, i) => s + (i.remainingDebt ?? 0), 0);
                          return (
                            <div
                              key={activityName}
                              className="p-5 rounded-2xl bg-gradient-to-r from-yellow-950 to-zinc-900 border border-yellow-700"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-semibold capitalize">⚽ {activityName}</p>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300 mt-1 inline-block">
                                    Mensualidad
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-yellow-300 font-bold text-lg">${activityTotal}</p>
                                  <p className="text-zinc-500 text-xs mt-0.5">
                                    {items.length} clase{items.length !== 1 ? "s" : ""}
                                  </p>
                                  <p className="text-zinc-400 text-xs mt-0.5">Debe: ${activityDebt}</p>
                                </div>
                              </div>
                              <div className="space-y-2 border-t border-zinc-800 pt-3">
                                {items.map((r) => {
                                  const date = new Date(r.appointment.initialDate);
                                  return (
                                    <div
                                      key={r.id}
                                      className="flex items-center justify-between text-sm gap-3"
                                    >
                                      <div className="flex flex-col">
                                        <span className="text-zinc-300">
                                          {date.toLocaleDateString("es-AR", {
                                            weekday: "short",
                                            day: "2-digit",
                                            month: "2-digit",
                                          })}
                                        </span>
                                        <span className="text-zinc-500 text-xs">
                                          Pagado ${r.totalPaid ?? 0} / Debe ${r.remainingDebt ?? 0}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-zinc-400">${r.price ?? 0}</span>
                                        <button
                                          onClick={() => {
                                            setSelectedPayment(r);
                                            setShowConfirmPayment(true);
                                          }}
                                          className="text-xs font-semibold px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 transition"
                                        >
                                          Cobrar clase
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {singles.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                        Clases sueltas
                      </h3>
                      <div className="space-y-4">
                        {singles.map((r) => (
                          <div
                            key={r.id}
                            className="p-5 rounded-2xl bg-gradient-to-r from-yellow-950 to-zinc-900 border border-yellow-700"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p>⚽ {r.appointment.activity.name}</p>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300 mt-1 inline-block">
                                  Clase Suelta
                                </span>
                              </div>
                              <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                                {r.state}
                              </span>
                            </div>

                            <div className="mt-3 text-sm space-y-1">
                              <p>💰 Total: ${r.price ?? 0}</p>
                              <p>💳 Pagado: ${r.totalPaid ?? 0}</p>
                              <p>🧾 Debe: ${r.remainingDebt ?? 0}</p>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedPayment(r);
                                setShowConfirmPayment(true);
                              }}
                              className="mt-4 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition text-sm font-semibold w-full"
                            >
                              Cobrar clase
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {showRefunds && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">💵 Dinero a devolver (Reembolsos CASH)</h2>

            {pendingRefunds.length === 0 ? (
              <p className="text-zinc-400">No hay dinero pendiente de devolución 🎉</p>
            ) : (
              <div className="space-y-4">
                {pendingRefunds.map((refund) => {
                  const date = new Date(refund.initialDate);
                  return (
                    <div
                      key={refund.id}
                      className="p-5 rounded-2xl bg-gradient-to-r from-red-950 to-zinc-900 border border-red-700 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">⚽ Clase Suspendida: {refund.activityName}</p>
                        <span className="text-zinc-400 text-sm">
                          Fecha clase: {date.toLocaleDateString("es-AR")}
                        </span>
                        <p className="text-zinc-500 text-xs mt-1">
                          ID Pago original afectado: #{refund.id}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {/* Se muestra en positivo el monto absoluto a entregar en mano */}
                        <p className="text-red-400 font-bold text-2xl">${Math.abs(refund.amount)}</p>
                        <button
                          onClick={() => {
                            setSelectedRefund(refund);
                            setShowConfirmRefund(true);
                          }}
                          className="mt-2 text-xs font-semibold px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition block text-center"
                        >
                          Entregar Efectivo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
      {showReservationModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 w-full max-w-md">

            <h2 className="text-2xl font-bold mb-6">
              Seleccionar actividad
            </h2>

            <div className="space-y-3">

              <button
                className="w-full py-3 rounded-xl bg-green-700 hover:bg-green-600"
                onClick={() => {

                  sessionStorage.setItem("employeeBooking", "true");

                  sessionStorage.setItem(
                    "employeeBookingClient",
                    JSON.stringify({
                      id: client.id,
                      name: client.user.name,
                      lastName: client.user.lastName,
                      email: client.user.email,
                    })
                  );

                  router.push(`/actividad/1?from=${from}`);
                }}
              >
                ⚽ Fútbol
              </button>

              <button
                className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-600"
                onClick={() => {

                  sessionStorage.setItem("employeeBooking", "true");

                  sessionStorage.setItem(
                    "employeeBookingClient",
                    JSON.stringify({
                      id: client.id,
                      name: client.user.name,
                      lastName: client.user.lastName,
                      email: client.user.email,
                    })
                  );

                  router.push(`/actividad/2?from=${from}`);
                }}
              >
                🏐 Vóley
              </button>

              <button
                className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-600"
                onClick={() => {

                  sessionStorage.setItem("employeeBooking", "true");

                  sessionStorage.setItem(
                    "employeeBookingClient",
                    JSON.stringify({
                      id: client.id,
                      name: client.user.name,
                      lastName: client.user.lastName,
                      email: client.user.email,
                    })
                  );

                  router.push(`/actividad/3?from=${from}`);
                }}
              >
                🏀 Básquet
              </button>

              <button
                className="w-full py-3 rounded-xl bg-orange-700 hover:bg-orange-600"
                onClick={() => {

                  sessionStorage.setItem("employeeBooking", "true");

                  sessionStorage.setItem(
                    "employeeBookingClient",
                    JSON.stringify({
                      id: client.id,
                      name: client.user.name,
                      lastName: client.user.lastName,
                      email: client.user.email,
                    })
                  );

                  router.push(`/actividad/4?from=${from}`);
                }}
              >
                🎾 Pádel
              </button>

            </div>

            <button
              className="mt-6 w-full py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600"
              onClick={() => setShowReservationModal(false)}
            >
              Cancelar
            </button>

          </div>

        </div>
      )}


      {showConfirmPayment && selectedPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirmar cobro</h2>

            <p className="mb-2">¿Estás seguro de cobrar esta clase?</p>

            <div className="mt-4 p-4 rounded-xl bg-zinc-800 space-y-2">
              <p><strong>Actividad:</strong> {selectedPayment.appointment.activity.name}</p>
              <p><strong>Total:</strong> ${selectedPayment.price ?? 0}</p>
              <p><strong>Pagado:</strong> ${selectedPayment.totalPaid ?? 0}</p>
              <p><strong>Debe:</strong> ${selectedPayment.remainingDebt ?? 0}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmPayment(false);
                  setSelectedPayment(null);
                }}
                className="flex-1 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600"
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
                  await registerPayment(selectedPayment.id);
                  setShowConfirmPayment(false);
                  setSelectedPayment(null);
                }}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 font-semibold"
              >
                Confirmar cobro
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmRefund && selectedRefund && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Confirmar Devolución</h2>

            <p className="mb-2">¿Confirmas que le has entregado el dinero físico en mano al cliente?</p>

            <div className="mt-4 p-4 rounded-xl bg-zinc-800 space-y-2">
              <p><strong>Actividad:</strong> {selectedRefund.activityName}</p>
              <p><strong>Monto a Devolver:</strong> ${Math.abs(selectedRefund.amount)}</p>
              <p><strong>Método:</strong> CASH (Efectivo)</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmRefund(false);
                  setSelectedRefund(null);
                }}
                className="flex-1 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600"
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/payment/refund/${selectedRefund.id}`, {
                      method: "POST"
                    });
                    if (res.ok) {
                      toast.success("Reembolso entregado correctamente");
                      await refreshClient();
                    }
                  } catch {
                    toast.error("Error al procesar devolución");
                  }
                  setShowConfirmRefund(false);
                  setSelectedRefund(null);
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-semibold"
              >
                Confirmar Entrega
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}