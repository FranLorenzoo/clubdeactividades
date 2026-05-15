export type CreateClientDto = {
  suspended: boolean;
  active: boolean;
  userId: number;
};

export type UpdateClientDto = Partial<CreateClientDto>;
