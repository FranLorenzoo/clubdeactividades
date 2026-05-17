import { useState } from "react";
import crypto from "crypto";

const generateRandomPassword = () => {
  return crypto.randomBytes(5).toString("hex");
};

export default function Searchbar() {
  const [open, setOpen] = useState(false);

  async function handleCreateClient(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);

  const name =
    formData.get("name");

  const lastName =
    formData.get("lastName");

  const email =
    formData.get("email");

  const dni =
    formData.get("dni");

  try {

    const response = await fetch(
      "/api/user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          lastName,
          email,
          dni,
          password: generateRandomPassword(),
        }),
      }
    );

    const data = await response.json();

    if(response.ok) {

      alert("Cliente creado");

      setOpen(false);

      return;
    }

    alert(
      data.message ||
      "Error al crear cliente"
    );

  } catch(error) {

    console.error(error);

    alert("Error de conexión");
  }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const value =
      (formData.get("searchValue") as string).trim();

    try {

      const response =
        await fetch(`/api/user?dni=${value}`);

      if(response.ok) {

        const user = await response.json();

        window.location.href =
          `/user/${user.id}`;

        return;
      }

      if(response.status === 404) {

        alert("Cliente no encontrado");

        return;
      }

      const errorData = await response.json();

      alert(
        errorData.message ||
        "Error inesperado"
      );

    } catch(error) {

      console.error(error);

      alert("Error de conexión");
    }
  }

  return (

    <>
      <div className="flex items-center gap-3 w-full max-w-xl mx-auto mt-[50px]">

        <form
          onSubmit={handleSubmit}
          className="flex gap-3"
        >

          <input
            type="text"
            placeholder="Buscar por DNI"
            name="searchValue"
            className="
              flex-1
              border
              border-gray-300
              rounded-xl
              px-4
              py-2
              outline-none
              focus:ring-2
              focus:ring-[#316788]
            "
          />

          <button
            type="submit"
            className="
              bg-[#316788]
              text-white
              px-5
              py-2
              rounded-xl
              hover:opacity-90
              transition
            "
          >
            Buscar
          </button>

        </form>

        <button
          onClick={() => setOpen(true)}
          className="gap-3 bg-[#F59134] text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition"
        >
          Crear cliente
        </button>

      </div>

      {
        open && (

          <div
            className="
              fixed
              inset-0
              bg-black/50
              flex
              items-center
              justify-center
              z-50
              p-4
            "
          >

            <div
              className="
                bg-white
                w-full
                max-w-lg
                rounded-2xl
                p-8
                shadow-xl
              "
            >

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold text-black">
                  Crear cliente
                </h2>

                <button
                  onClick={() => setOpen(false)}
                  className="
                    text-zinc-500
                    hover:text-black
                    text-xl
                  "
                >
                  ✕
                </button>

              </div>

              <form
              onSubmit={handleCreateClient}
              className="space-y-4">

                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  className="
                    w-full
                    border
                    rounded-xl
                    p-4
                  "
                />

                <input
                  type="text"
                  name="lastName"
                  placeholder="Apellido"
                  className="
                    w-full
                    border
                    rounded-xl
                    p-4
                  "
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="
                    w-full
                    border
                    rounded-xl
                    p-4
                  "
                />

                <input
                  type="text"
                  name="dni"
                  placeholder="DNI"
                  className="
                    w-full
                    border
                    rounded-xl
                    p-4
                  "
                />

                <button
                  type="submit"
                  className="
                    w-full
                    bg-[#316788]
                    text-white
                    py-4
                    rounded-xl
                    font-semibold
                    hover:opacity-90
                    transition
                  "
                >
                  Crear cliente
                </button>

              </form>

            </div>

          </div>
        )
      }

    </>
  );
}