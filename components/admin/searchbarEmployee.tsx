import { FormEvent, useState } from "react";
import crypto from "crypto";
import { useEffect } from "react";

type Activity = {
  id: number;
  name: string;
}
const generateRandomPassword = () => {
  return crypto.randomBytes(5).toString("hex");
};
const today = new Date();
today.setFullYear(today.getFullYear() - 18);

const maxDate = today.toISOString().split("T")[0];

function calculateAge(fechaNacimiento: string) {
  const today = new Date();
  const birth = new Date(fechaNacimiento);
  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference =
    today.getMonth() -
    birth.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() < birth.getDate()
    )
  ) {
    age--;
  }
  return age;
}

export default function Searchbar() {
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openProfessor, setOpenProfessor] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [activityId, setActivityId] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);

  function resetForm() {
    setName("");
    setLastName("");
    setEmail("");
    setDni("");
    setFechaNacimiento("");
    setActivityId("");
  }

  useEffect(() => {
        fetch('/api/activity')
          .then(res => res.json())
          .then(actData => {
            setActivities(actData)
          })
          .catch(error => {
            console.error(error)
          });
      }, [])

  async function handleCreateProfessor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

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
            age: calculateAge(fechaNacimiento),
            roleId: 4,
            password: generateRandomPassword(),
            activityId: Number(activityId),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {

        alert("Profesor creado");

        setOpenProfessor(false);
        resetForm();
        return;
      }

      alert(
        data.message ||
        "Error al crear profesor"
      );

    } catch (error) {

      console.error(error);

      alert("Error de conexión");
    }
  }
  
  async function handleCreateEmployee(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

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
            age: calculateAge(fechaNacimiento),
            roleId: 3,
            password: generateRandomPassword(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {

        alert("Empleado creado");

        setOpenEmployee(false);
        resetForm();
        return;
      }

      alert(
        data.message ||
        "Error al crear empleado"
      );

    } catch (error) {

      console.error(error);

      alert("Error de conexión");
    }
  }

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
        openEmployee  && (

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
                  Crear empleado
                </h2>

                <button
                  onClick={() => {
                    resetForm();
                    setOpenEmployee(false);
                  }}
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
              onSubmit={handleCreateEmployee}
              className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="
                      border
                      rounded-xl
                      p-4
                      w-1/2
                    "
                  />

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="
                      border
                      rounded-xl
                      p-4
                      w-1/2
                    "
                  />
              </div>

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  value={dni}
                  onChange={(event) => setDni(event.target.value)}
                  className="
                    w-full
                    border
                    rounded-xl
                    p-4
                  "
                />

                <input
                  type="date"
                  name="fechaNacimiento"
                  max={maxDate}
                  placeholder="Fecha de nacimiento (YYYY-MM-DD)"
                  value={fechaNacimiento}
                  onChange={(event) => setFechaNacimiento(event.target.value)}
                  className="
                    w-full
                    border
                    rounded-xl
                    p-4
                  "
                />

                <button
                  type="submit"
                  disabled={!name || !lastName || !email || !dni || !fechaNacimiento}
                  className="
                    w-full
                    bg-[#316788]
                    text-white
                    py-4
                    rounded-xl
                    font-semibold
                    hover:opacity-90
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Crear empleado
                </button>
              </form>
            </div>
          </div>
        )

      }
      {
        openProfessor  && (

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
                  Crear profesor
                </h2>

                <button
                  onClick={() => {
                    setOpenProfessor(false);
                    resetForm();
                  }}
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
              onSubmit={handleCreateProfessor}
              className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="
                      border
                      rounded-xl
                      p-4
                      w-1/2
                    "
                  />

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="
                      border
                      rounded-xl
                      p-4
                      w-1/2
                    "
                  />
              </div>

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  value={dni}
                  onChange={(event) => setDni(event.target.value)}
                  className="
                    w-full
                    border
                    rounded-xl
                    p-4
                  "
                />

                <select
                name="activityId"
                value={activityId}
                className="w-full border rounded-xl p-4"
                onChange={(e) =>
                  setActivityId(e.target.value)
                }
              >
                <option value="" disabled>
                  Seleccione una actividad
                </option>

                {activities.map((activity) => (
                  <option
                    key={activity.id}
                    value={activity.id}
                  >
                    {activity.name}
                  </option>
                ))}
              </select>

                <input
                  type="date"
                  name="fechaNacimiento"
                  max={maxDate}
                  placeholder="Fecha de nacimiento (YYYY-MM-DD)"
                  value={fechaNacimiento}
                  onChange={(event) => setFechaNacimiento(event.target.value)}
                  className="
                    w-full
                    border
                    rounded-xl
                    p-4
                  "
                />

                <button
                  type="submit"
                  disabled={!name || !lastName || !email || !dni || !fechaNacimiento || !activityId}
                  className="
                    w-full
                    bg-[#316788]
                    text-white
                    py-4
                    rounded-xl
                    font-semibold
                    hover:opacity-90
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Crear profesor 
                </button>

              </form>

            </div>

          </div>
        )
      }

    </>
  );
}