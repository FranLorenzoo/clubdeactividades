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
  const [professors, setProfessors] = useState<Professor[]>([]); // Para el cambio
  
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  
  // Estado para controlar qué turno se está editando mutuamente
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);

  // 1. Traer las actividades al cargar el componente
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

  // 2. Traer los turnos Y los profesores de la actividad seleccionada
  useEffect(() => {
    if (!selectedActivity) return;

    async function fetchData() {
      setLoadingAppointments(true);
      setEditingAppointmentId(null);
      try {
        const resApp = await fetch(`/api/appointment/activity/${selectedActivity}`);
        if (!resApp.ok) throw new Error('Error al cargar turnos');
        const dataApp = await resApp.json();
        setAppointments(dataApp);

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

      setAppointments(prev => prev.map(app => app.id === appointmentId ? appointmentWithProfessorRelation : app));
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
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#333' }}>
          Actividades
        </h2>
        
        {activities === null ? (
          <p style={{ color: '#666', fontSize: '0.9rem' }}>No se encontraron actividades disponibles.</p>
        ) : (
          activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => setSelectedActivity(activity.id)}
              style={{
                padding: '14px 20px',
                backgroundColor: selectedActivity === activity.id ? '#0070f3' : '#ffffff',
                color: selectedActivity === activity.id ? '#ffffff' : '#333333',
                border: selectedActivity === activity.id ? '1px solid #0070f3' : '1px solid #ccc',
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
        borderLeft: '1px solid #eaeaea', 
        paddingLeft: '2.5rem',
        minHeight: '400px'
      }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#333' }}>
          Turnos Disponibles
        </h2>
        
        {!selectedActivity && (
          <div style={{ padding: '2rem 0', color: '#666', textAlign: 'center', border: '2px dashed #eee', borderRadius: '8px' }}>
            <p>Por favor, seleccione una actividad de la izquierda para ver los turnos vigentes.</p>
          </div>
        )}

        {loadingAppointments && (
          <p style={{ color: '#0070f3', fontWeight: '500' }}>Buscando turnos actualizados...</p>
        )}

        {!loadingAppointments && selectedActivity && appointments.length === 0 && (
          <div style={{ padding: '2rem 0', color: '#666', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <p>No hay turnos programados para esta actividad desde la fecha actual en adelante.</p>
          </div>
        )}

        {!loadingAppointments && appointments.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {appointments.map((appointment) => {
              const startDate = new Date(appointment.initialDate);
              const endDate = new Date(appointment.endDate);
              const profName = appointment.professor?.user?.name;
              const profLastName = appointment.professor?.user?.lastName;
              const isEditing = editingAppointmentId === appointment.id;

              return (
                <li 
                  key={appointment.id} 
                  style={{ 
                    padding: '16px', 
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#222', marginBottom: '4px' }}>
                      {startDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    
                    <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '4px' }}>
                      ⏱️ <strong>Horario:</strong> {startDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} a {endDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} hs
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#555' }}>
                      👤 <strong>Profesor:</strong> {profName ? `${profName} ${profLastName}` : 'Por asignar'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <select 
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) handleAssignProfessor(appointment.id, Number(e.target.value));
                          }}
                          style={{ 
                            padding: '8px', 
                            borderRadius: '6px', 
                            border: '1px solid #ccc', 
                            fontSize: '0.85rem',
                            backgroundColor: '#ffffff',
                            color: '#333333',
                            width: '160px'
                          }}
                        >
                          <option value="" disabled style={{ color: '#999' }}>Seleccionar Profesor...</option>
                          {professors.map(p => (
                            <option 
                              key={p.id} 
                              value={p.id}
                              style={{ backgroundColor: '#ffffff', color: '#333333' }} // Aseguramos las opciones
                            >
                              {p.user.name} {p.user.lastName}
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={() => setEditingAppointmentId(null)}
                          style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setEditingAppointmentId(appointment.id)}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#e6e6e6',
                          color: '#0070f3',
                          border: '1px solid #0070f3',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        Cambiar Profesor
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}