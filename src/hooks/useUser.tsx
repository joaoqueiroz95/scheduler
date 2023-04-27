import useSwr from "swr";
import fetcher from "@/libs/fetcher";
import { IUser } from "@/types/user";

const useUser = (userId: string) => {
  let { data, error, isLoading, mutate } = useSwr<IUser>(
    `/api/users/${userId}`,
    fetcher
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

export default useUser;
