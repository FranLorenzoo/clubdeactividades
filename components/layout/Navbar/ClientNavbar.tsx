import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function ClientNavbar() {

  const router = useRouter();

  const [abierto, setAbierto] =
  useState(true);

  const cerrarSesion = ()=>{

    localStorage.removeItem(
      "userId"
    );

    localStorage.removeItem(
      "userEmail"
    );

    router.push("/");
  };

 const itemStyle = `

flex
items-center
gap-4
px-4
py-4
rounded-2xl

bg-zinc-800/60
border
border-zinc-700

text-zinc-200

hover:bg-[#00A63E]/25
hover:border-[#00A63E]/50
hover:text-white
hover:shadow-lg
hover:shadow-[#00A63E]/10
hover:translate-x-1

transition-all
duration-300

`;

  return (

    <aside
    className={`

    min-h-screen
    p-6
    flex
    flex-col
    border-r
    border-zinc-800
    bg-gradient-to-b
    from-[#09090B]
    via-[#101012]
    to-[#09090B]
    transition-all
    duration-500

    ${abierto ? "w-72" : "w-24"}

    `}
    >

      {/* Header */}

      <div
      className="
      flex
      items-center
      justify-between
      mb-10
      "
      >

        {abierto && (

          <Link
          href="/dashboard/client"
          className="
          text-4xl
          font-extrabold
          tracking-tight
          "
          >

            <span className="text-white">

              Club

            </span>

            <span
            className="
            text-[#00A63E]
            drop-shadow-[0_0_12px_#00A63E]
            "
            >

              360

            </span>

          </Link>

        )}

        <button
        onClick={()=>
          setAbierto(
            !abierto
          )
        }
          className="

          p-3
          rounded-xl
          bg-zinc-700
          border
          border-zinc-600
          hover:bg-zinc-600
          transition

          "
                  >

          ☰

        </button>

      </div>

      {/* Menú */}

      <nav
      className="
      flex
      flex-col
      gap-2
      "
      >

        <Link
        href="/dashboard/client"
        className={itemStyle}
        >
          🏠
          {abierto && "Inicio"}
        </Link>

        <Link
        href="/dashboard/client/reservations"
        className={itemStyle}
        >
          📅
          {abierto && "Mis reservas"}
        </Link>

        <Link
        href="/dashboard/client/payments"
        className={itemStyle}
        >
          💳
          {abierto && "Mis pagos"}
        </Link>

        <Link
        href="/dashboard/client/qr"
        className={itemStyle}
        >
          📱
          {abierto && "Mi QR"}
        </Link>

        <Link
        href="/dashboard/client/profile"
        className={itemStyle}
        >
          👤
          {abierto && "Mi perfil"}
        </Link>

      </nav>

      {/* Footer */}

      <div className="mt-auto">

        <button
        onClick={cerrarSesion}
        className="

        w-full
        py-4
        rounded-2xl
        bg-gradient-to-r
        from-[#F59134]
        to-[#d97706]
        font-semibold
        hover:scale-[1.03]
        transition

        "
        >

          {abierto
          ? "Cerrar sesión"
          : "🚪"}

        </button>

      </div>

    </aside>

  );

}