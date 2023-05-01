import useSwr from "swr";
import fetcher from "@/libs/fetcher";
import { IGetUsers } from "@/types/user";

const useUsers = (canCall: boolean) => {
  let { data, error, isLoading, mutate } = useSwr<IGetUsers>(
    canCall ? `/api/users` : null,
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
