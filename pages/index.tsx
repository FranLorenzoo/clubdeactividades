import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Actividades from "@/components/Actividades";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <Hero />
      <Actividades />
    </main>
  );
}