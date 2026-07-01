import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Activity {
  id: number;
  name: string;
}

interface Professor {
  id: number;
  user: {
    name: string;
    lastName: string;
  };
}

interface Appointment {
  slotsAvailable: number;
  currentSlots: number;
  price: number;
  id: number;
  activityId: number;
  initialDate: string; 
  endDate: string;
  professor?: {
    id: number;
    user: {
      name: string;
      lastName: string;
    };
  };
}

export default function ActivityAppointments() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]); 
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [appointmentToSuspend, setAppointmentToSuspend] = useState<Appointment | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch('/api/activity');
        if (!res.ok) throw new Error('Error al cargar actividades');
        const data = await res.json();
        setActivities(data); 
      } catch (error) {
        console.error("Error en fetchActivities:", error);
      } finally {
        setLoadingActivities(false);
      }
    }
    fetchActivities();
  }, []);

  useEffect(() => {
    if (!selectedActivity) return;

    async function fetchData() {
      setLoadingAppointments(true);
      setEditingAppointmentId(null);
      try {
        const resApp = await fetch(`/api/appointment/activity/${selectedActivity}`);
        if (!resApp.ok) throw new Error('Error al cargar turnos');
        const dataApp = await resApp.json();
        
        const sortedAppointments = dataApp.sort((a: Appointment, b: Appointment) => {
          return new Date(a.initialDate).getTime() - new Date(b.initialDate).getTime();
        });

        setAppointments(sortedAppointments);

        const resProf = await fetch(`/api/professor/activity/${selectedActivity}`);
        if (resProf.ok) {
          const dataProf = await resProf.json();
          setProfessors(dataProf);
        }
      } catch (error) {
        console.error("Error en fetchData:", error);
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    }

    fetchData();
  }, [selectedActivity]);

  const handleAssignProfessor = async (appointmentId: number, professorId: number) => {
    const currentAppointment = appointments.find(app => app.id === appointmentId);
    
    const selectedProf = professors.find(p => p.id === professorId);
    
    if (!currentAppointment || !selectedProf) return;

    try {
      const res = await fetch(`/api/appointment/${appointmentId}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialDate: currentAppointment.initialDate,
          endDate: currentAppointment.endDate,
          price: currentAppointment.price, 
          currentSlots: currentAppointment.currentSlots,
          slotsAvailable: currentAppointment.slotsAvailable,
          professorId: professorId,
          activityId: currentAppointment.activityId
        })
      });

      if (!res.ok) {
        toast.error('No se pudo cambiar el profesor');
        return;
      } 
      
      toast.success('Profesor cambiado correctamente');
      
      const updatedAppointment = await res.json();

      const appointmentWithProfessorRelation: Appointment = {
        ...updatedAppointment,
        professor: {
          id: selectedProf.id,
          user: {
            name: selectedProf.user.name,
            lastName: selectedProf.user.lastName
          }
        }
      };

      setAppointments(prev => {
        const updated = prev.map(app => app.id === appointmentId ? appointmentWithProfessorRelation : app);
        return [...updated].sort((a, b) => new Date(a.initialDate).getTime() - new Date(b.initialDate).getTime());
      });
      setEditingAppointmentId(null); 
    } catch (error) {
      alert("Error al cambiar el profesor");
      console.error(error);
    }
  };

  if (loadingActivities) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Cargando actividades...</p>
      </div>
    );
  }

  const openSuspendModal = (appointment: Appointment) => {
    setEditingAppointmentId(null);
    setAppointmentToSuspend(appointment);
  };

  const closeSuspendModal = () => {
    setAppointmentToSuspend(null);
  };

  const confirmSuspendAppointment = async () => {
    if (!appointmentToSuspend) return;

    try {
      const res = await fetch(`/api/appointment/${appointmentToSuspend.id}`, {
        method: 'DELETE',
        body: JSON.stringify({

        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        toast.error('No se pudo suspender el turno');
        return;
      }
      toast.success('Turno suspendido correctamente');
      
      setAppointments(prev => prev.filter(app => app.id !== appointmentToSuspend.id));
      setAppointmentToSuspend(null);
    } catch (error) {
      toast.error("Error al suspender el turno");
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ACTIVIDADES */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl shadow-black/20">
            <h2 className="mb-6 text-2xl font-bold text-white">Actividades</h2>

            {activities === null ? (
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-6 text-center text-zinc-500">
                No se encontraron actividades disponibles.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity.id)}
                    className={`w-full rounded-2xl border px-5 py-4 text-left font-medium transition-all duration-200 ${
                      selectedActivity === activity.id
                        ? 'border-green-500 bg-green-600 text-white shadow-lg shadow-green-600/20'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-green-500 hover:bg-zinc-700'
                    }`}
                  >
                    {activity.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="lg:col-span-2">
          <div className="min-h-[550px] rounded-3xl border border-zinc-700 bg-zinc-800/90 p-6 shadow-xl shadow-black/20">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Turnos disponibles</h2>

              <p className="mt-1 text-sm text-zinc-400">
                Seleccioná una actividad para administrar sus turnos.
              </p>
            </div>

            {!selectedActivity && (
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/70 px-8 py-20 text-center">
                <p className="font-medium text-zinc-400">Seleccioná una actividad.</p>

                <p className="mt-2 text-sm text-zinc-600">
                  Los turnos aparecerán aquí automáticamente.
                </p>
              </div>
            )}

            {loadingAppointments && (
              <div className="flex justify-center py-16">
                <div className="flex items-center gap-3 font-medium text-green-400">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                  Buscando turnos actualizados...
                </div>
              </div>
            )}

            {!loadingAppointments && selectedActivity && appointments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/70 py-16 text-center">
                <p className="font-medium text-zinc-300">
                  No hay turnos programados para esta actividad.
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Cuando existan nuevos turnos aparecerán aquí.
                </p>
              </div>
            )}

            {!loadingAppointments && appointments.length > 0 && (
              <ul className="flex flex-col gap-4">
                {appointments.map((appointment) => {
                  const startDate = new Date(appointment.initialDate);
                  const endDate = new Date(appointment.endDate);
                  const profName = appointment.professor?.user?.name;
                  const profLastName = appointment.professor?.user?.lastName;
                  const isEditing = editingAppointmentId === appointment.id;

                  const dateString = isMounted
                    ? startDate.toLocaleDateString('es-AR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })
                    : 'Cargando fecha...';

                  const timeString = isMounted
                    ? `${startDate.toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })} a ${endDate.toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })} hs`
                    : '--:-- a --:-- hs';

                  return (
                    <li
                      key={appointment.id}
                      className="rounded-2xl border border-zinc-700 bg-zinc-800/90 shadow-lg transition-all duration-200 hover:border-green-500/80"
                    >
                      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold capitalize text-white">
                            {dateString}
                          </h3>

                          <p className="text-sm text-zinc-400">
                            <span className="text-zinc-500">⏱ Horario:</span>{' '}
                            {timeString}
                          </p>

                          <p className="text-sm text-zinc-400">
                            <span className="text-zinc-500">👨‍🏫 Profesor:</span>{' '}
                            {profName ? `${profName} ${profLastName}` : 'Por asignar'}
                          </p>

                        </div>

                        <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[18rem]">
                          {isEditing ? (
                            <>
                              <select
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignProfessor(
                                      appointment.id,
                                      Number(e.target.value)
                                    );
                                  }
                                }}
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white outline-none transition focus:border-green-500"
                              >
                                <option value="" disabled>
                                  Seleccionar profesor...
                                </option>

                                {professors.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.user.name} {p.user.lastName}
                                  </option>
                                ))}
                              </select>

                              <button
                                onClick={() => setEditingAppointmentId(null)}
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col gap-3 sm:flex-row">
                              <button
                                onClick={() => setEditingAppointmentId(appointment.id)}
                                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                              >
                                Cambiar profesor
                              </button>

                              <button
                                onClick={() => openSuspendModal(appointment)}
                                className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-300 transition hover:bg-yellow-500/20"
                              >
                                Suspender
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {appointmentToSuspend && (
        (() => {
          const suspendActivityName = activities?.find(
            (activity) => activity.id === appointmentToSuspend.activityId
          )?.name;

          return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={closeSuspendModal}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-800/95 p-6 shadow-2xl shadow-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-400/90">
                  Suspender turno
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  ¿Confirmás la suspensión?
                </h3>
              </div>

              <button
                onClick={closeSuspendModal}
                className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-300 transition hover:bg-zinc-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-4">
              <p className="text-sm text-zinc-300 capitalize">
                <span className="text-zinc-500">Actividad:</span>{' '}
                {suspendActivityName ?? 'Turno seleccionado'}
              </p>

              <p className="text-sm text-zinc-300">
                <span className="text-zinc-500">Horario:</span>{' '}
                {new Date(appointmentToSuspend.initialDate).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}{' '}
                a{' '}
                {new Date(appointmentToSuspend.endDate).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}{' '}
                hs
              </p>

              <p className="text-sm leading-6 text-zinc-400">
                Esta acción va a eliminar el turno de la grilla. No se puede deshacer.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={closeSuspendModal}
                className="rounded-2xl border border-zinc-700 bg-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
              >
                Cancelar
              </button>

              <button
                onClick={confirmSuspendAppointment}
                className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20"
              >
                Suspender turno
              </button>
            </div>
          </div>
        </div>
          );
        })()
      )}
    </div>
  );
}