import useSwr from "swr";
import fetcher from "@/libs/fetcher";
import { IGetUsers } from "@/types/user";
import { Role } from "@prisma/client";

const useUsers = (role: Role) => {
  if (role === Role.REGULAR) {
    return { data: undefined };
  }

  let { data, error, isLoading, mutate } = useSwr<IGetUsers>(
    `/api/users`,
    fetcher
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

export default useUsers;
