import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Image from "next/image";
import toast from "react-hot-toast";

interface QRInfo {
  id: number;
  qrImage: string;
  url: string;
  accepted: boolean;
}

type TurnoState = "PAGO_COMPLETO" | "PAGO_PARCIAL" | "IMPAGO";
type TurnoType = "ABONADO" | "NO_ABONADO";

interface TurnoItem {
  userAppointmentId: number;
  activityName: string;
  initialDate: string;
  endDate: string;
  qr: QRInfo | null;
  cancellable: boolean;
  fueraDeTermino: boolean;
  state: TurnoState;
  type: TurnoType;
}

export default function MisTurnosPage() {
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<{ turno: TurnoItem; qrImage: string } | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [cancelLoadingId, setCancelLoadingId] = useState<number | null>(null);
  const [turnoAConfirmar, setTurnoAConfirmar] = useState<TurnoItem | null>(null);

  useEffect(() => {
    const fetchTurnos = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const clientRes = await fetch(`/api/client/user/${userId}`);
        if (!clientRes.ok) return;

        const client = await clientRes.json();

        const uaRes = await fetch(`/api/user-appointment/client/${client.id}`);
        if (!uaRes.ok) return;

        const userAppointments: any[] = await uaRes.json();

        const now = new Date();

        const pagados: TurnoItem[] = userAppointments
          .filter((ua) => {
            if (ua.cancellationDate || ua.rejected) {
              return false;
            }
            const allowedState =
              ua.state === "PAGO_COMPLETO" ||
              ua.state === "PAGO_PARCIAL" ||
              (ua.type === "ABONADO" && ua.state === "IMPAGO");
            if (!allowedState) return false;
            const start = new Date(ua.appointment?.initialDate);
            return start.getTime() >= now.getTime();
          })
          .map((ua) => {
            const start = new Date(ua.appointment?.initialDate);

            const diffHours =
              (start.getTime() - now.getTime()) / (1000 * 60 * 60);

            // ⏱️ CALCULAMOS SI ESTÁ FUERA DE TÉRMINO SEGÚN LAS REGLAS DEL REPOSITORIO
            let isFueraDeTermino = false;
            if (ua.type === "ABONADO") {
              isFueraDeTermino = diffHours < 48; // Es abonado y falta menos de 48hs
            } else {
              isFueraDeTermino = diffHours < 24; // No es abonado y falta menos de 24hs
            }

            return {
              userAppointmentId: ua.id,
              activityName: ua.appointment?.activity?.name ?? "—",
              initialDate: ua.appointment?.initialDate ?? "",
              endDate: ua.appointment?.endDate ?? "",
              qr: ua.qr ?? null,
              cancellable: diffHours >= 0, // Sigue siendo cancelable si está en el futuro
              fueraDeTermino: isFueraDeTermino, // 👈 Inyectamos el valor calculado
              state: ua.state,
              type: ua.type,
            };
          })
          .sort(
            (a, b) =>
              new Date(a.initialDate).getTime() -
              new Date(b.initialDate).getTime()
          );

        setTurnos(pagados);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar turnos");
      } finally {
        setLoading(false);
      }
    };

    fetchTurnos();
  }, []);

  /* =========================
      CANCELAR TURNO
  ========================= */
  const handleCancel = (id: number) => {
  const turno = turnos.find((t) => t.userAppointmentId === id);
  if (!turno) return;

  setTurnoAConfirmar(turno);
};


const handleConfirmCancel = async () => {
  if (!turnoAConfirmar) return;

  const id = turnoAConfirmar.userAppointmentId;

  setCancelLoadingId(id);
  const loadingToast = toast.loading("Cancelando turno...");

  try {
    const res = await fetch(`/api/user-appointment/cancel/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok || !data?.success) {
      toast.error(data?.message || "No se pudo cancelar el turno", {
        id: loadingToast,
      });
      return;
    }

    toast.success(
      data.creditCreated
        ? "Turno cancelado y crédito devuelto 🎁"
        : "Turno cancelado. ¡Gracias por liberar el cupo!🎁",
      {
        id: loadingToast,
      }
    );

    setTurnos((prev) =>
      prev.filter((t) => t.userAppointmentId !== id)
    );

    setTurnoAConfirmar(null);

  } catch (err) {
    console.error(err);

    toast.error("Error inesperado al cancelar", {
      id: loadingToast,
    });

  } finally {
    setCancelLoadingId(null);
  }
};
/* =========================
      QR
  ========================= */
  const handleOpenQR = async (turno: TurnoItem) => {
    if (turno.qr?.qrImage) {
      setSelectedQR({ turno, qrImage: turno.qr.qrImage });
      return;
    }

    setLoadingQR(true);

    try {
      const res = await fetch(
        `/api/qr/user-appointment/${turno.userAppointmentId}`
      );

      const data = await res.json();

      if (res.ok && data.qrImage) {
        setSelectedQR({ turno, qrImage: data.qrImage });
      } else {
        setSelectedQR({ turno, qrImage: "" });
      }
    } catch {
      setSelectedQR({ turno, qrImage: "" });
    } finally {
      setLoadingQR(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <DashboardLayout role="CLIENT">
      <h1 className="text-3xl font-bold mb-8">Mis turnos</h1>

      {loading ? (
        <p className="text-zinc-400 text-sm">Cargando...</p>
      ) : turnos.length === 0 ? (
        <p className="text-zinc-500 text-sm">
          No tenés turnos activos.
        </p>
      ) : (
        <div className="space-y-3">
          {turnos.map((turno) => (
            <div
              key={turno.userAppointmentId}
              className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 hover:border-green-600 transition"
            >
              <button
                onClick={() => handleOpenQR(turno)}
                className="text-left flex-1"
              >
                <p className="font-semibold capitalize">
                  {turno.activityName}
                </p>

                <p className="text-zinc-400 text-sm mt-0.5 capitalize">
                  {formatDate(turno.initialDate)}
                </p>

                <p className="text-zinc-500 text-xs mt-0.5">
                  {formatTime(turno.initialDate)} —{" "}
                  {formatTime(turno.endDate)}
                </p>

                <p className="text-xs mt-2 text-green-400 hover:underline">
                  Ver QR
                </p>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCancel(turno.userAppointmentId)}
                  disabled={cancelLoadingId === turno.userAppointmentId}
                  className="text-xs px-3 py-1 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition disabled:opacity-40"
                >
                  {cancelLoadingId === turno.userAppointmentId
                    ? "Cancelando..."
                    : "Cancelar"}
                </button>

                {turno.state === "PAGO_COMPLETO" ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-600/20 text-green-400">
                    Pago
                  </span>
                ) : turno.state === "PAGO_PARCIAL" ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                    Seña
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                    Pendiente de pago
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR MODAL */}
      {selectedQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedQR(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 flex flex-col items-center gap-5 w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <p className="font-bold text-lg capitalize">
                {selectedQR.turno.activityName}
              </p>
              <p className="text-zinc-400 text-sm mt-1 capitalize">
                {formatDate(selectedQR.turno.initialDate)}
              </p>
            </div>

            {selectedQR.qrImage ? (
              <div className="bg-white rounded-2xl p-3">
                <Image
                  src={selectedQR.qrImage}
                  alt="QR"
                  width={200}
                  height={200}
                  unoptimized
                />
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">
                QR no disponible.
              </p>
            )}

            <button
              onClick={() => setSelectedQR(null)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-2xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {turnoAConfirmar && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    onClick={() => setTurnoAConfirmar(null)}
  >
    <div
      className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold mb-4">
        Confirmar cancelación
      </h2>

            {turnoAConfirmar.fueraDeTermino ? (
              <p className="text-sm text-yellow-400 leading-6">
                ⚠️ Estás cancelando fuera del plazo permitido.
                <br />
                <br />
                Podrás liberar el cupo para otro socio, pero <b>no recibirás reembolso ni devolución del crédito.</b>
                <br />
                <br />
                ¿Deseás continuar?
              </p>
            ) : (
              <p className="text-sm text-zinc-300 leading-6">
                ¿Estás seguro de que querés cancelar este turno?
              </p>
            )}

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setTurnoAConfirmar(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
              >
                Volver
              </button>

              <button
                onClick={handleConfirmCancel}
                disabled={cancelLoadingId === turnoAConfirmar.userAppointmentId}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelLoadingId === turnoAConfirmar.userAppointmentId
                  ? "Cancelando..."
                  : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}