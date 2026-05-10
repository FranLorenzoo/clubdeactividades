export type CreateAppointmentDto = {
  initialDate: Date;
  endDate: Date;
  currentSlots?: number;
  slotsAvailable?: number;
  professorId?: number;
  activityId?: number;
};

export type UpdateAppointmentDto = Partial<CreateAppointmentDto>;