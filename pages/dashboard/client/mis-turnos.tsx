import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Image from "next/image";

interface QRInfo {
  id: number;
  qrImage: string;
  url: string;
  accepted: boolean;
}

interface TurnoItem {
  userAppointmentId: number;
  activityName: string;
  initialDate: string;
  endDate: string;
  qr: QRInfo | null;
  cancellable: boolean;
}

export default function MisTurnosPage() {
  const [turnos, setTurnos] = useState<TurnoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<{ turno: TurnoItem; qrImage: string } | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [cancelLoadingId, setCancelLoadingId] = useState<number | null>(null);

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
          .filter((ua) =>
            ua.state === "PAGO_COMPLETO" ||
            ua.state === "PAGO_PARCIAL"
          )
          .map((ua) => {
            const start = new Date(ua.appointment?.initialDate);

            const diffHours =
              (start.getTime() - now.getTime()) / (1000 * 60 * 60);

            return {
              userAppointmentId: ua.id,
              activityName: ua.appointment?.activity?.name ?? "—",
              initialDate: ua.appointment?.initialDate ?? "",
              endDate: ua.appointment?.endDate ?? "",
              qr: ua.qr ?? null,
              cancellable: diffHours >= 0, // futuro hook para regla 24/48hs
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
      } finally {
        setLoading(false);
      }
    };

    fetchTurnos();
  }, []);

  const handleCancel = async (id: number) => {
    setCancelLoadingId(id);

    try {
      const res = await fetch(`/api/cancel/${id}`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Error cancelando turno");
      }

      // lo sacamos del frontend
      setTurnos((prev) =>
        prev.filter((t) => t.userAppointmentId !== id)
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo cancelar el turno");
    } finally {
      setCancelLoadingId(null);
    }
  };

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

      if (res.ok) {
        const data = await res.json();
        setSelectedQR({ turno, qrImage: data.qrImage ?? "" });
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
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCancel(turno.userAppointmentId)}
                  disabled={cancelLoadingId === turno.userAppointmentId}
                  className="text-xs px-3 py-1 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                >
                  {cancelLoadingId === turno.userAppointmentId
                    ? "Cancelando..."
                    : "Cancelar"}
                </button>

                <span className="text-xs px-2 py-1 rounded-full bg-green-600/20 text-green-400">
                  Pago
                </span>
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
    </DashboardLayout>
  );
}