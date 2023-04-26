import axios from "axios";

export const deleteUser = async (userId: string) => {
  return axios.delete(`/api/users/${userId}`);
};
