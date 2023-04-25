export interface IGetAgenda {
  agendas: IAgenda[];
}

export interface IAgenda {
  id: string;
  name: string;
  owner: { name: string };
  ownerId: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}
