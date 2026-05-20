import Hero from "@/components/layout/Hero";
import Activities from "@/components/activities";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/nav-bar";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <Hero />
      <Activities />
      <Footer />
    </main>
  );
}