import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type ScanState = "idle" | "scanning" | "loading" | "success" | "error";

interface ScanResult {
  message: string;
  userAppointmentId?: number;
  userAppointment?: {
    appointment?: {
      activity?: { name: string };
      initialDate: string;
    };
    client?: {
      user?: { name: string; lastName: string };
    };
  };
}

export default function QRScanner() {
  const [state, setState] = useState<ScanState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  const stopScanner = async () => {
    if (scannerRef.current && isScanningRef.current) {
      await scannerRef.current.stop().catch(() => {});
      isScanningRef.current = false;
    }
  };

  useEffect(() => {
    if (state !== "scanning") return;

    const qrScanner = new Html5Qrcode("qr-reader");
    scannerRef.current = qrScanner;
    isScanningRef.current = true;

    qrScanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (!isScanningRef.current) return;
          await stopScanner();
          setState("loading");

          const userAppointmentId = parseInt(decodedText.trim(), 10);
          if (isNaN(userAppointmentId)) {
            setErrorMsg("El QR no contiene un ID válido");
            setState("error");
            return;
          }

          try {
            const res = await fetch("/api/qr/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userAppointmentId }),
            });
            const data = await res.json();

            if (res.status === 409) {
              setErrorMsg("Este QR ya fue usado anteriormente");
              setState("error");
            } else if (!res.ok) {
              setErrorMsg(data.message ?? "Error al validar el QR");
              setState("error");
            } else {
              setResult(data);
              setState("success");
            }
          } catch {
            setErrorMsg("Error de red al validar el QR");
            setState("error");
          }
        },
        () => {}
      )
      .catch((err) => {
        console.error(err);
        setErrorMsg("No se pudo acceder a la cámara");
        setState("error");
      });

    return () => {
      stopScanner();
    };
  }, [state]);

  const handleReset = async () => {
    await stopScanner();
    setResult(null);
    setErrorMsg("");
    setState("idle");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <div
        id="qr-reader"
        className={`w-full rounded-2xl overflow-hidden ${state === "scanning" ? "block" : "hidden"}`}
        style={{ minHeight: "300px" }}
      />

      {state === "idle" && (
        <button
          onClick={() => setState("scanning")}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition"
        >
          Iniciar escáner
        </button>
      )}

      {state === "scanning" && (
        <button
          onClick={handleReset}
          className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-2xl font-semibold transition text-sm"
        >
          Cancelar
        </button>
      )}

      {state === "loading" && (
        <p className="text-zinc-400 text-sm">Validando...</p>
      )}

      {state === "success" && result && (
        <div className="w-full bg-zinc-900 border border-green-600 rounded-2xl p-6 flex flex-col gap-3">
          <p className="text-green-400 text-xl font-bold">Acceso permitido</p>
          {result.userAppointment?.appointment?.activity?.name && (
            <p className="text-white font-semibold capitalize">
              {result.userAppointment.appointment.activity.name}
            </p>
          )}
          {result.userAppointment?.client?.user && (
            <p className="text-zinc-300 text-sm">
              {result.userAppointment.client.user.name}{" "}
              {result.userAppointment.client.user.lastName}
            </p>
          )}
          {result.userAppointment?.appointment?.initialDate && (
            <p className="text-zinc-400 text-xs capitalize">
              {formatDate(result.userAppointment.appointment.initialDate)}
            </p>
          )}
          <button
            onClick={handleReset}
            className="mt-2 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-3 rounded-2xl font-semibold transition text-sm"
          >
            Escanear otro QR
          </button>
        </div>
      )}

      {state === "error" && (
        <div className="w-full bg-zinc-900 border border-red-600 rounded-2xl p-6 flex flex-col gap-3">
          <p className="text-red-400 font-semibold">Acceso denegado</p>
          <p className="text-zinc-300 text-sm">{errorMsg}</p>
          <button
            onClick={handleReset}
            className="mt-2 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-3 rounded-2xl font-semibold transition text-sm"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
