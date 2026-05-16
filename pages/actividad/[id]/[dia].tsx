import { useRouter } from "next/router";
import Navbar from "@/components/layout/Navbar";

import DiaHeader from "@/components/activity/day-header";
import TurnosList from "@/components/activity/appointment-list";

const turnos = [
  { hora: "08:00", profesor: "Juan Pérez", cupos: 4 },
  { hora: "10:00", profesor: "María López", cupos: 0 },
  { hora: "18:30", profesor: "Carlos Díaz", cupos: 7 },
];

export default function TurnosDia() {
  const router = useRouter();
  const { id, dia } = router.query;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 text-white px-6 py-16">
        <div className="max-w-5xl mx-auto">

          <DiaHeader id={id} dia={dia} />
          <TurnosList turnos={turnos} />

        </div>
      </main>
    </>
  );
}