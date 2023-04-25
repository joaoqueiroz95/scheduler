export interface IGetAgenda {
  agendas: IAgenda[];
}

export interface IAgenda {
  id: string;
  name: string;
  owner: { name: string };
  tasks: { id: string; name: string }[];
  ownerId: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}
