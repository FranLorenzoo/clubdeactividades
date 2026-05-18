import { FormEvent, useState } from "react";
import CreateEmployee from "./Modal/CreateEmployee";
import CreateProfessor from "./Modal/CreateProfessor";

export default function Searchbar() {
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openProfessor, setOpenProfessor] = useState(false);
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const value =
      String(formData.get("searchValue") || "").trim();

    try {

      const response =
        await fetch(`/api/user?dni=${value}`);

      if (response.ok) {

        const user = await response.json();

        window.location.href =
          `/user/${user.id}`;

        return;
      }

      if (response.status === 404) {

        alert("Empleado no encontrado");

        return;
      }

      const errorData = await response.json();

      alert(
        errorData.message ||
        "Error inesperado"
      );

    } catch (error) {

      console.error(error);

      alert("Error de conexión");
    }
  }

  return ( <>
      <div className="flex items-center gap-3 w-full max-w-xl mx-auto mt-[50px] relative z-10">

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
          onClick={() => setOpenEmployee(true)}
          className="gap-3 bg-[#316788] text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition">
          Crear empleado
        </button>

        <button
          onClick={() => setOpenProfessor(true)}
          className="gap-3 bg-[#316788] text-white px-5 py-2 rounded-xl whitespace-nowrap hover:opacity-90 transition">
          Crear profesor
        </button>
      </div>

      {
        openEmployee && (
          <CreateEmployee
            onClose={() => setOpenEmployee(false)}
          />
        )
      }

      {
        openProfessor  && (

          <CreateProfessor
            onClose={() => setOpenProfessor(false)}
          />
        )
      }

    </>
  );
}