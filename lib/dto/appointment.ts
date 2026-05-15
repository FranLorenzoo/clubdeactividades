export type CreateAppointmentDto = {
  initialDate: Date;
  endDate: Date;
  price: number;
  currentSlots?: number;
  slotsAvailable?: number;
  professorId?: number;
  activityId?: number;
};

export type UpdateAppointmentDto = Partial<CreateAppointmentDto>;