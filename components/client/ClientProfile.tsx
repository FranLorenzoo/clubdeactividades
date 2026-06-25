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
    price?: number;
    totalPaid?: number;
    remainingDebt?: number;

    appointment: {
      id: number;
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

  const router = useRouter();

  const [showHistory, setShowHistory] = useState(false);
  const [showDebts, setShowDebts] = useState(false);

  const [selectedPayment, setSelectedPayment] =
    useState<ClientProfileData["userAppointments"][0] | null>(null);

  const [showConfirmPayment, setShowConfirmPayment] = useState(false);

  async function refreshClient() {
    try {
      setLoading(true);

      const res = await fetch(`/api/client/${clientId}`, { cache: "no-store" });
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
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
              onClick={refreshClient}
              className="px-5 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 transition font-semibold w-full"
            >
              Actualizar datos
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="bg-zinc-900 p-6 rounded-3xl lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Historial</h2>

            {client.userAppointments.map((r) => (
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
              </div>
            ))}
          </div>
        )}

        {showDebts && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">💰 Pagos pendientes</h2>

            {client.userAppointments.filter((r) => r.state !== "PAGO_COMPLETO")
              .length === 0 ? (
              <p className="text-zinc-400">No hay pagos pendientes 🎉</p>
            ) : (
              <div className="space-y-4">
                {client.userAppointments
                  .filter((r) => r.state !== "PAGO_COMPLETO")
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-gradient-to-r from-yellow-950 to-zinc-900 border border-yellow-700"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p>⚽ {r.appointment.activity.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300 mt-1 inline-block">
                            {r.type === "ABONADO" ? "Mensualidad" : "Clase Suelta"}
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
            )}
          </div>
        )}
      </div>

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
    </div>
  );
}