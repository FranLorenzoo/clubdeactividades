import { NextApiRequest, NextApiResponse } from "next";
import { getAppointmentById, suspendAppointment, updateAppointment, softDeleteAppointment, reactivateAppointment } from "@/lib/sql/appointment";
import { parseId } from "@/lib/validators/api";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
  const { id } = req.query;
  const parsedId = parseId(id);
  if (parsedId === null) return res.status(400).json({ message: "Bad request" });

  switch (req.method) {
    case "GET":
      return getAppointmentByIdHandler(parsedId, res);
    
    case "PUT": {
        const { action, professorId } = req.body;
        if (action === "restart") {
          return restartAppointmentByIdHandler(parsedId, res);
        }

        if (professorId !== undefined) {
          return updateAppointmentProfessorHandler(parsedId, req, res);
        }

        return updateAppointmentByIdHandler(parsedId, res);
    }
    case "DELETE": {
  const { num } = req.body;

  if (num === 1) {
    return deleteAppointmentByIdHandler(parsedId, res);
  }

  return suspendAppointmentByIdHandler(parsedId, res);
}
    default:
      res.status(405).json({ message: "Method not allowed" });  
  }
}

async function getAppointmentByIdHandler(id: number, res: NextApiResponse) {
  try {
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    return res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function updateAppointmentProfessorHandler(id: number, req: NextApiRequest, res: NextApiResponse) {
  try {
    const appointment = await getAppointmentById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const { professorId } = req.body;

    const appointmentActualizado = await prisma.appointment.update({
      where: { id },
      data: {
        professorId: Number(professorId),
      },
    });

    return res.status(200).json(appointmentActualizado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function updateAppointmentByIdHandler(id: number, res: NextApiResponse) {
  try {
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const nuevoAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        currentSlots: appointment.currentSlots - 1, 
      },
    });
    return res.status(200).json(nuevoAppointment);

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(500).json({ message: "Internal server error" }); 
  }
}

async function restartAppointmentByIdHandler(id: number, res: NextApiResponse) {
  try {
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const baseDate = new Date(appointment.initialDate);
    const baseDay = baseDate.getDay(); 
    const baseHour = baseDate.getHours();
    const now = new Date();

    const sameActivityAppointments = await prisma.appointment.findMany({
  where: {
    activityId: appointment.activityId,
    isDeleted: true,
    userAppointments: {
      none: {},
    },
  },
});

    const idsToDelete = sameActivityAppointments
      .filter(a => {
        const initial = new Date(a.initialDate);
        return (
          initial.getDay() === baseDay && 
          initial.getHours() === baseHour && 
          now <= initial
        );
      })
      .map(a => a.id);


      if (idsToDelete.length === 0) {
      return res.status(200).json({ message: "No future empty appointments found to delete" });
    }

    for (const id of idsToDelete) {
        await reactivateAppointment(id);
    }

    return res.status(200).json({message: "Appointments reactivated successfully",
});
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(500).json({ message: "Internal server error" }); 
  }
}

async function suspendAppointmentByIdHandler(id: number, res: NextApiResponse) {
  
  try {
    const updatedAppointment = await suspendAppointment(id);
    return res.status(200).json(updatedAppointment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error al suspender' });
    
  }
}

async function deleteAppointmentByIdHandler(id: number, res: NextApiResponse) {
  try {
    const appointment = await getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const baseDate = new Date(appointment.initialDate);
    const baseDay = baseDate.getDay(); 
    const baseHour = baseDate.getHours();
    const now = new Date();

    const sameActivityAppointments = await prisma.appointment.findMany({
  where: {
    activityId: appointment.activityId,
    isDeleted: false,
    userAppointments: {
      none: {},
    },
  },
});

    const idsToDelete = sameActivityAppointments
      .filter(a => {
        const initial = new Date(a.initialDate);
        return (
          initial.getDay() === baseDay && 
          initial.getHours() === baseHour && 
          now <= initial
        );
      })
      .map(a => a.id);

    if (idsToDelete.length === 0) {
      return res.status(200).json({ message: "No future empty appointments found to delete" });
    }

    for (const id of idsToDelete) {
        await softDeleteAppointment(id);
    }

    return res.status(200).json({ message: "Appointments deleted in cascade successfully" });
  } catch (error) {
    console.error("Error en deleteAppointmentByIdHandler:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Appointment not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}