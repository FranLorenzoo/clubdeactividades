import { useRouter } from "next/router";
import ClientProfile from "@/components/client/ClientProfile";

export default function ClientProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return null;

  return <ClientProfile clientId={Number(id)} />;
}