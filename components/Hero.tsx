import Link from "next/link";
import { useEffect, useState } from "react";

type HeroProps = {
  dashboard?: boolean;
};

export default function Hero({
  dashboard = false
}: HeroProps) {

  const [userId, setUserId] =
  useState<string | null>(null);

  useEffect(() => {

    setUserId(
      localStorage.getItem(
        "userId"
      )
    );

  }, []);

  return (

    <section
    className="
    max-w-7xl
    mx-auto
    px-6
    py-20
    text-center
    "
    >

      <h1
      className="
      text-6xl
      font-bold
      leading-tight
      mb-6
      "
      >

        Reservá tus actividades
        <br />

        <span className="text-green-500">

          en segundos

        </span>

      </h1>

      <p
      className="
      text-zinc-400
      text-xl
      max-w-2xl
      mx-auto
      mb-10
      "
      >

        Fútbol, vóley, pádel y básquet.
        Elegí horario, reservá y disfrutá.

      </p>

      {!dashboard && !userId && (

        <div className="flex justify-center gap-4">

          <Link
            href="/register"
            className="
            bg-green-600
            px-8
            py-4
            rounded-2xl
            font-semibold
            hover:bg-green-700
            transition
            "
          >
            Empezar ahora
          </Link>

        </div>

      )}

    </section>

  );

}