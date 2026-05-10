import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Activities from "@/components/activities";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <Hero />
      <Activities />
    </main>
  );
}