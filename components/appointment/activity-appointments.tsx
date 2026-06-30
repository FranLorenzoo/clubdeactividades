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

  const handleSuspendAppointment = async (appointmentId: number) => {
    const confirmar = confirm("¿Estás seguro de que deseas suspender este turno? Esta acción no se puede deshacer.");
    if (!confirmar) return;

    try {
      const res = await fetch(`/api/appointment/${appointmentId}`, {
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
      
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    } catch (error) {
      toast.error("Error al suspender el turno");
      console.error(error);
    }
  };

  return (
  <div style={{ 
    display: 'flex', 
    gap: '2.5rem', 
    padding: '2rem', 
    fontFamily: 'sans-serif',
    maxWidth: '1200px',
    margin: '0 auto'
  }}>
    
    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fff' }}>
        Actividades
      </h2>
      
      {activities === null ? (
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>No se encontraron actividades disponibles.</p>
      ) : (
        activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => setSelectedActivity(activity.id)}
            style={{
              padding: '14px 20px',
              backgroundColor: selectedActivity === activity.id ? '#0070f3' : '#1f1f1f',
              color: '#ffffff',
              border: selectedActivity === activity.id ? '1px solid #0070f3' : '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '1rem',
              fontWeight: selectedActivity === activity.id ? '600' : '400',
              transition: 'all 0.2s ease',
              boxShadow: selectedActivity === activity.id ? '0 4px 6px rgba(0,112,243,0.2)' : 'none'
            }}
          >
            {activity.name}
          </button>
        ))
      )}
    </div>

    <div style={{ 
      flex: '2', 
      backgroundColor: '#b9b9b9',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '2rem',
      minHeight: '400px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', color: '#1a1a1a', fontWeight: '700' }}>
        Turnos Disponibles
      </h2>
      
      {!selectedActivity && (
        <div style={{ padding: '3rem 0', color: '#666', textAlign: 'center', border: '2px dashed #ccc', borderRadius: '8px', backgroundColor: '#ffffff' }}>
          <p>Por favor, seleccione una actividad de la izquierda para ver los turnos vigentes.</p>
        </div>
      )}

      {loadingAppointments && (
        <p style={{ color: '#0070f3', fontWeight: '600', textAlign: 'center' }}>Buscando turnos actualizados...</p>
      )}

      {!loadingAppointments && selectedActivity && appointments.length === 0 && (
        <div style={{ padding: '3rem 0', color: '#666', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <p>No hay turnos programados para esta actividad desde la fecha actual en adelante.</p>
        </div>
      )}

      {!loadingAppointments && appointments.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {appointments.map((appointment) => {
            const startDate = new Date(appointment.initialDate);
            const endDate = new Date(appointment.endDate);
            const profName = appointment.professor?.user?.name;
            const profLastName = appointment.professor?.user?.lastName;
            const isEditing = editingAppointmentId === appointment.id;

            const dateString = isMounted 
              ? startDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
              : 'Cargando fecha...';

            const timeString = isMounted
              ? `${startDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} a ${endDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} hs`
              : '--:-- a --:-- hs';

            return (
              <li 
                key={appointment.id} 
                style={{ 
                  padding: '18px', 
                  border: '1px solid #eef0f2',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.33)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s, boxShadow 0.2s'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111', marginBottom: '6px', textTransform: 'capitalize' }}>
                    {dateString}
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: '#444', marginBottom: '4px' }}>
                    ⏱️ <strong style={{ color: '#222' }}>Horario:</strong> {timeString}
                  </div>

                  <div style={{ fontSize: '0.9rem', color: '#444' }}>
                    👤 <strong style={{ color: '#222' }}>Profesor:</strong> {profName ? `${profName} ${profLastName}` : 'Por asignar'}
                  </div>
                </div>

                <div style={{ textTransform: 'none' }}>
      {isEditing ? (
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <button
            onClick={() => setEditingAppointmentId(null)}
            style={{
              padding: '6px 8px', 
              borderRadius: '4px',
              fontSize: '0.85rem',
              backgroundColor: '#e91515',
              color: '#ebe8e8',
              width: '160px',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c81212'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e91515'}
          >
            Cancelar
          </button>

          <select 
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handleAssignProfessor(appointment.id, Number(e.target.value));
            }}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '6px', 
              border: '1px solid #ccc', 
              fontSize: '0.85rem',
              backgroundColor: '#ffffff',
              color: '#333333',
              width: '160px',
              cursor: 'pointer'
            }}
          >
            <option value="" disabled>Seleccionar Profesor...</option>
            {professors.map(p => (
              <option key={p.id} value={p.id}>
                {p.user.name} {p.user.lastName}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => setEditingAppointmentId(appointment.id)}
            style={{
              padding: '9px 16px',
              backgroundColor: '#0070f3', 
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,112,243,0.15)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#005bc5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
          >
            Cambiar Profesor
          </button>

          <button 
            onClick={() => handleSuspendAppointment(appointment.id)}
            style={{
              padding: '9px 16px',
              backgroundColor: '#dfe53e', 
              color: '#2a2a2a',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(229,62,62,0.15)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bdc234'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dfe53e'}
          >
            Suspender
          </button>
        </div>
      )}
    </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  </div>
)};