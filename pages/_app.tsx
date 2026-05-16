import "@/pages/globals.css";
import type { AppProps } from "next/app";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

<<<<<<< HEAD
export default function MyApp({ Component, pageProps }: AppProps) {
  type User = { id: string; email: string; rol: string };
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <Component {...pageProps} />;
  }
  return (
    <div className="flex">
      <Navbar />
      <main className="ml-64 flex-1 p-6 bg-zinc-950 text-white">
        <Component {...pageProps} />
      </main>
    </div>
  );
=======
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
>>>>>>> aa6fa6b (pages y components recuperados (#13))
}