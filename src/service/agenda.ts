import axios from "axios";

interface ICreateAgendaBody {
  name: string;
  timezone?: string;
  ownerId?: string;
}

export const createAgenda = async (data: ICreateAgendaBody) => {
  return axios.post(`/api/agendas`, data);
};

interface IEditAgendaBody {
  name?: string;
  ownerId?: string;
}

export const editAgenda = async (agendaId: string, data: IEditAgendaBody) => {
  return axios.patch(`/api/agendas/${agendaId}`, data);
};

export const deleteAgenda = async (agendaId: string) => {
  return axios.delete(`/api/agendas/${agendaId}`);
};
