import axios from "axios";

interface IAddTaskBody {
  name: string;
}

export const addTask = async (agendaId: string, data: IAddTaskBody) => {
  return axios.post(`/api/agendas/${agendaId}/tasks`, data);
};

export const deleteTask = async (agendaId: string, taskId: string) => {
  return axios.delete(`/api/agendas/${agendaId}/tasks/${taskId}`);
};
