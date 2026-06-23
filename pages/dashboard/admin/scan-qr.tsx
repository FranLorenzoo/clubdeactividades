import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/DashboardLayout";

const QRScanner = dynamic(() => import("@/components/qr/QRScanner"), {
  ssr: false,
  loading: () => <p className="text-zinc-400 text-sm">Cargando escáner...</p>,
});

export default function AdminScanQRPage() {
  return (
    <DashboardLayout role="ADMIN">
      <h1 className="text-3xl font-bold mb-8">Escanear QR</h1>
      <QRScanner />
    </DashboardLayout>
  );
}
