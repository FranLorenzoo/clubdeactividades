import { RRule } from 'rrule';
import crypto from "crypto";

type AppointmentForm = {
  day: string;
  startTime: number;
  slotsAvailable: number;
  currentSlots: number;
  activityId: number;
  professorId: number;
  price: number;
}

export function generateAppointments(form: AppointmentForm) {

  const initDate = new Date();
  initDate.setHours(form.startTime, 0, 0, 0);

  const rule = new RRule({
    freq: RRule.WEEKLY,
    byweekday: generateRruleDay(form.day),
    dtstart: initDate,
    count: 20
  });

  const generatedDates = rule.all();

  // Mapear las fechas al formato de datos que requiere tu modelo de Prisma
  const appointments = generatedDates.map((ruleDate) => ({ // Prisma convierte automáticamente el objeto Date a timestamp UTC
    initialDate: ruleDate,
    endDate: addOneHour(ruleDate),
    slotsAvailable: form.slotsAvailable,
    currentSlots: form.currentSlots,
    activityId: form.activityId,
    professorId: form.professorId,
    price: form.price
  }));

  return appointments;
}

function generateRruleDay(day: string) {
  switch(day) {
    case "MONDAY":
      return RRule.MO;
    case "TUESDAY":
      return RRule.TU;
    case "WEDNESDAY":
      return RRule.WE;
    case "THURSDAY":
      return RRule.TH;
    case "FRIDAY":
      return RRule.FR;
    case "SATURDAY":
      return RRule.SA;
    default:
      throw new Error("Invalid day");
  }
}

function addOneHour(startDate: Date) {
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 1);
  return endDate;
}

export const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

export function getMaxDate() {
  const today = new Date();
  today.setFullYear(
    today.getFullYear() - 18
  );
  return today.toISOString().split("T")[0];
}


export function calculateAge(fechaNacimiento: string) {
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

export function isValidEmailQuery(value: string): boolean {
  return (
    value.includes("@") &&
    (value.endsWith(".com.ar") || value.endsWith(".com"))
  );
}

export function isValidDniQuery(value: string): boolean {
  return /^\d{8,}$/.test(value);
}