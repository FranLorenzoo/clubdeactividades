export type CreateProfessorDto = {
  userId: number;
  activityId: number;
};

export type UpdateProfessorDto = Partial<CreateProfessorDto>;
