import fetcher from "@/libs/fetcher";
import axios from "axios";

interface IEditAgendaBody {
  name: string;
}

export const editAgenda = async (agendaId: string, data: IEditAgendaBody) => {
  return axios.patch(`/api/agendas/${agendaId}`, data);
};

export const deleteAgenda = async (agendaId: string) => {
  return axios.delete(`/api/agendas/${agendaId}`);
};
