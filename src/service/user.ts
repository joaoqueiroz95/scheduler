import { Role } from "@prisma/client";
import axios from "axios";

export interface ICreateUserBody {
  name: string;
  username: string;
  password: string;
  role: Role;
}

export const createUser = async (data: ICreateUserBody) => {
  return axios.post(`/api/users`, data);
};

export interface IEditUserBody {
  name?: string;
  username?: string;
  password?: string;
  role?: Role;
}

export const editUser = async (userId: string, data: IEditUserBody) => {
  return axios.patch(`/api/users/${userId}`, data);
};

export const deleteUser = async (userId: string) => {
  return axios.delete(`/api/users/${userId}`);
};
