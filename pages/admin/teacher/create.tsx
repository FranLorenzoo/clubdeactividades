import { useState } from "react";
import crypto from "crypto";

type Activity = {
  id: number;
  name: string;
}
const generateRandomPassword = () => {
  return crypto.randomBytes(5).toString("hex");
};

export default function CreateProfessorPage() {

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [age, setAge] = useState("");
  const [activityId, setActivityId] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const createProfessor = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if (Number(age) < 18) {

      setError(
        "El profesor debe ser mayor de edad"
      );

      return;
    }

    setLoading(true);

    const professorData = {
      name,
      lastName,
      email,
      dni,
      password: generateRandomPassword(),
      age: Number(age),
      activityId: Number(activityId),

      // ID del rol profesor
      roleId: 7,
    };

    try {

      const response = await fetch(
        "/api/employee",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(professorData),
        }
      );

      const data = await response.json();

      if (response.ok) {

        setSuccess(
          "Profesor creado correctamente"
        );

        setName("");
        setLastName("");
        setEmail("");
        setDni("");
        setAge("");

      } else {

        setError(
          data.message || "Error al crear profesor"
        );
      }

    } catch (error) {

      console.error(error);

      setError("Error de red");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center">

          <p className="text-2xl font-bold tracking-wide">
            Club<span className="text-[#5A8949]">360</span>
          </p>

          <h1 className="flex-1 text-center text-2xl font-semibold">
            Crear profesor
          </h1>

        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="bg-zinc-900 rounded-2xl p-8 shadow-md border border-zinc-800">
          <h2 className="text-2xl font-bold mb-8">
            Datos del profesor
          </h2>

          <form
            onSubmit={createProfessor}
            className="space-y-6"
          >

            <div className="flex gap-4">

              <div className="w-1/2">

                <label className="block text-sm text-zinc-400 mb-2">
                  Nombre
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 outline-none focus:border-[#5A8949]"
                />

              </div>

              <div className="w-1/2">

                <label className="block text-sm text-zinc-400 mb-2">
                  Apellido
                </label>

                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 outline-none focus:border-[#5A8949]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 outline-none focus:border-[#5A8949]"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm text-zinc-400 mb-2">
                  DNI
                </label>
                <input
                  type="number"
                  required
                  value={dni}
                  onChange={(e) =>
                    setDni(e.target.value)
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 outline-none focus:border-[#5A8949]"
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm text-zinc-400 mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  min={18}
                  required
                  value={age}
                  onChange={(e) =>
                    setAge(e.target.value)
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 outline-none focus:border-[#5A8949]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Actividad asignada
              </label>
              <select
                name="activityId"
                value={activityId}
                onChange={(e) =>
                  setActivityId(e.target.value)
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 outline-none focus:border-[#5A8949]"
              >
                <option value="" disabled>
                  Seleccione una actividad
                </option>

                {activities.map(activity => (
                  <option
                    key={activity.id}
                    value={activity.id}
                  >
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>
            {
              error && (
                <p className="
                  text-red-400
                  bg-red-500/10
                  border
                  border-red-500/20
                  rounded-xl
                  p-3
                ">
                  {error}
                </p>
              )
            }
            {
              success && (
                <p className="text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                  {success}
                </p>
              )
            }

            {
              error && (
                <p className=" text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  {error}
                </p>
              )
            }
            {
              success && (
                <p className="
                  text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                  {success}
                </p>
              )
            }
            <button
              type="submit"
              disabled={loading}
              className=" w-full mt-4 bg-[#5A8949] py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {
                loading
                  ? "Creando..."
                  : "Crear profesor"
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}