import { useEffect, useState } from "react";

type Activity = {
  id: number;
  name: string;
}

type Professor = {
  id: number;
  name: string;
}

export default function CreateAppointmentPage() {

  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityId, setActivityId] = useState("");
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [professorId, setProfessorId] = useState("");
  const [durationHours, setDurationHours] = useState(1);

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

  useEffect(() => {
    if(!activityId) {
      setProfessors([]);
      return
    }
    
    fetch(`/api/professor?activityId=${activityId}`)
      .then(res => {
        if(!res.ok) {
          throw new Error("Error cargando profesores")
        }
        return res.json();
      })
      .then(profData => {
        setProfessors(profData)
      })
      .catch(error => {
        console.error(error)
      });
  }, [activityId]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const initialDateString = formData.get("initialDate") as string;
    const initialDate = new Date(initialDateString);
    const endDate = new Date(initialDateString);
    endDate.setHours(endDate.getHours() + durationHours);

    const body = {
      initialDate: initialDate.toISOString(),
      endDate: endDate.toISOString(),
      currentSlots: Number(formData.get("slotsAvailable")),
      slotsAvailable: Number(formData.get("slotsAvailable")),
      activityId: Number(formData.get("activityId")),
      professorId: Number(formData.get("professorId"))
    };

    const response = await fetch("/api/appointment", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body)
    });

    if(!response.ok) {
      alert("Error creando turno");
      return
    }

    alert("Turno creado");
    e.currentTarget.reset();
    setActivityId("");
    setProfessorId("");
    setProfessors([]);
    setDurationHours(1);
  }

  return (
    <div className="min-h-screen bg-[#09090b] py-10 px-4">

      <form
        className="
          max-w-2xl
          mx-auto
          bg-[#fdfdfd]
          rounded-2xl
          shadow-lg
          p-8
          space-y-8
        "
        onSubmit={handleSubmit}
      >

        <div>
          <h1 className="text-3xl font-bold text-[#09090b]">
            Crear turno
          </h1>

          <p className="text-[#316788] mt-2">
            Complete los datos del turno.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#09090b]">
              Fecha y hora de inicio
            </label>

            <input
              type="datetime-local"
              name="initialDate"
              required
              className="
                w-full
                border
                border-[#316788]
                rounded-xl
                px-4
                py-2
                text-[#09090b]
                focus:outline-none
                focus:ring-2
                focus:ring-[#5A8949]
              "
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#09090b]">
              Duración (horas)
            </label>

            <input
              type="number"
              min={1}
              value={durationHours}
              onChange={(e) =>
                setDurationHours(
                  Number(e.target.value)
                )
              }
              className="
                w-full
                border
                border-[#316788]
                rounded-xl
                px-4
                py-2
                text-[#09090b]
                focus:outline-none
                focus:ring-2
                focus:ring-[#5A8949]
              "
            />
          </div>

        </div>

        <div className="space-y-2">

          <label className="text-sm font-medium text-[#09090b]">
            Cupos disponibles
          </label>

          <input
            type="number"
            name="slotsAvailable"
            min={1}
            required
            className="
              w-full
              border
              border-[#316788]
              rounded-xl
              px-4
              py-2
              text-[#09090b]
              focus:outline-none
              focus:ring-2
              focus:ring-[#5A8949]
            "
          />

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-2">

            <label className="text-sm font-medium text-[#09090b]">
              Actividad
            </label>

            <select
              name="activityId"
              value={activityId}
              className="
                w-full
                border
                border-[#316788]
                rounded-xl
                px-4
                py-2
                bg-[#fdfdfd]
                text-[#09090b]
                focus:outline-none
                focus:ring-2
                focus:ring-[#5A8949]
              "
              onChange={(e) => {
                setActivityId(e.target.value);
                setProfessorId("");
              }}
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

          <div className="space-y-2">

            <label className="text-sm font-medium text-[#09090b]">
              Profesor
            </label>

            <select
              name="professorId"
              value={professorId}
              className="
                w-full
                border
                border-[#316788]
                rounded-xl
                px-4
                py-2
                bg-[#fdfdfd]
                text-[#09090b]
                focus:outline-none
                focus:ring-2
                focus:ring-[#5A8949]
              "
              onChange={(e) => {
                setProfessorId(e.target.value);
              }}
            >

              <option value="" disabled>
                Seleccione un profesor
              </option>

              {professors.map(professor => (
                <option
                  key={professor.id}
                  value={professor.id}
                >
                  {professor.name}
                </option>
              ))}

            </select>

          </div>

        </div>

        <div className="flex justify-end">

          <button
            type="submit"
            className="
              bg-[#F59134]
              text-[#09090b]
              px-6
              py-3
              rounded-xl
              hover:opacity-90
              transition
              font-medium
            "
          >
            Crear turno
          </button>

        </div>

      </form>

    </div>
  );
}