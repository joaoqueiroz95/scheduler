import useSwr from "swr";
import fetcher from "@/libs/fetcher";
import { IGetUsers } from "@/types/user";

const useUsers = () => {
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
