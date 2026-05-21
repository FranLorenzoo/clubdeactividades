import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ClientHomePage() {

  return (

    <DashboardLayout role="CLIENT">

      <div
      className="
      min-h-screen
      bg-zinc-950
      text-white
      flex
      items-center
      justify-center
      "
      >

        <div
        className="
        text-center
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        px-12
        py-10
        shadow-xl
        "
        >

          <h1
          className="
          text-5xl
          font-bold
          mb-4
          "
          >

            Bienvenido a
            <span className="text-[#00A63E]">
              {" "}Club360
            </span>

          </h1>

          <p
          className="
          text-zinc-400
          text-lg
          "
          >

            Seleccioná una opción del menú para comenzar.

          </p>

        </div>

      </div>

    </DashboardLayout>

  );

}