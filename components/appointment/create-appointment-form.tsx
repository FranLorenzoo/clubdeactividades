import { generateAppointments } from "@/lib/utils/helpers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Activity = {
  id: number;
  name: string;
}

type Professor = {
  id: number;
  user: {
    id: number,
    name: string
  };
}

export default function CreateAppointmentForm() {

  const [activities, setActivities] = useState<Activity[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);

  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [maxSlots, setMaxSlots] = useState("");
  const [activityId, setActivityId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [price, setPrice] = useState("");

  const isFormValid = day && startTime && maxSlots && activityId && professorId && price;

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const appointmentForm = {
      startTime: Number(formData.get("startTime")),
      day: String(formData.get("day")),
      slotsAvailable: Number(formData.get("maxSlots")),
      currentSlots: Number(formData.get("maxSlots")),
      activityId: Number(formData.get("activityId")),
      professorId: Number(formData.get("professorId")),
      price: Number(formData.get("price")),
    };

    const body = generateAppointments(appointmentForm);

    const firstAppointment = body[0];

    const status = await dateAlreadyExist(
      firstAppointment.initialDate,
      firstAppointment.activityId
    );

    if(status === 404) {
      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        toast.error("Error creando turno");
        return;
      }
    } else {
      toast.error("El turno ya existe para esa actividad, fecha y horario");
      return;
    }
    

    toast.success("Turno creado");
    form.reset();
    setActivityId("");
    setProfessorId("");
    setProfessors([]);
  }

  async function dateAlreadyExist(initialDate: Date, activityId: number) {
    const params = new URLSearchParams({
      initialDate: initialDate.toISOString(),
      activityId: String(activityId),
    });

    const response = await fetch(`/api/appointment/exists?${params}`);
    return response.status;
  }

  const inputCls ="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 placeholder:text-zinc-500";

  return (
    <div className="min-h-screen py-10 px-4">

      <form
        className="
          max-w-4xl
          mx-auto
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          shadow-2xl
          shadow-black/20
          p-10
          space-y-10
        "
        onSubmit={handleSubmit}
      >

        <div>

          <h1 className="text-4xl font-bold text-[#fdfdfd]">
            Crear clase
          </h1>

          <p className="text-white mt-3 text-lg">
            Complete los datos de la clase.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="space-y-2">

            <label className="text-sm font-medium text-[#fdfdfd]">
              Día
            </label>

            <select
              name="day"
              required
              onChange={e => setDay(e.target.value)}
              className={inputCls}
            >

              <option value="" disabled selected>
                Seleccione un día
              </option>

              <option value="MONDAY">Lunes</option>
              <option value="TUESDAY">Martes</option>
              <option value="WEDNESDAY">Miércoles</option>
              <option value="THURSDAY">Jueves</option>
              <option value="FRIDAY">Viernes</option>
              <option value="SATURDAY">Sábado</option>

            </select>

          </div>

          <div className="space-y-2">

            <label className="text-sm font-medium text-[#fdfdfd]">
              Hora inicio
            </label>

            <select
              name="startTime"
              required
              onChange={e => setStartTime(e.target.value)}
              className={inputCls}
            >

              <option value="" disabled selected>
                Seleccione un horario
              </option>

              {Array.from({ length: 14 }, (_, i) => {
                const hour = i + 8;

                return (
                  <option
                    key={hour}
                    value={hour}
                  >
                    {hour}:00 hs
                  </option>
                );
              })}

            </select>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="space-y-2">

            <label className="text-sm font-medium text-[#fdfdfd]">
              Cupo máximo
            </label>

            <input
              type="number"
              name="maxSlots"
              min={1}
              max={99}
              required
              onChange={e => setMaxSlots(e.target.value)}
              className={inputCls}
            />

          </div>

          <div className="space-y-2">

            <label className="text-sm font-medium text-[#fdfdfd]">
              Precio
            </label>

            <input
              type="number"
              name="price"
              min={0}
              step="0.01"
              required
              onChange={e => setPrice(e.target.value)}
              className={inputCls}
              placeholder="$0.00"
            />

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="space-y-2">

            <label className="text-sm font-medium text-[#fdfdfd]">
              Actividad
            </label>

            <select
              name="activityId"
              value={activityId}
              required
              className={inputCls}
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

            <label className="text-sm font-medium text-[#fdfdfd]">
              Profesor
            </label>

            <select
              name="professorId"
              value={professorId}
              required
              className={inputCls}
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
                  {professor.user.name}
                </option>
              ))}

            </select>

          </div>

        </div>

        <div className="flex justify-end pt-4">

          <button
            type="submit"
            disabled={!isFormValid}
            className={`
              px-8
              py-4
              rounded-2xl
              font-semibold
              text-lg
              transition-all
              duration-300

              ${
                isFormValid
                  ? "bg-green-600 text-[#09090b] hover:opacity-90 hover:scale-[1.02] cursor-pointer"
                  : "bg-[#6b7280] text-[#d1d5db] cursor-not-allowed opacity-60"
              }
            `}
          >
            Crear clase
          </button>

        </div>

      </form>

    </div>
  );
}