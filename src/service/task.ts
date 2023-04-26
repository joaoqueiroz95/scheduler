import axios from "axios";

export const deleteTask = async (agendaId: string, taskId: string) => {
  return axios.delete(`/api/agendas/${agendaId}/tasks/${taskId}`);
};
