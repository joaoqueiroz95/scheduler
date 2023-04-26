import useSwr from "swr";
import fetcher from "@/libs/fetcher";
import { IGetUsers } from "@/types/user";

const useUsers = () => {
  let { data, error, isLoading } = useSwr<IGetUsers>(`/api/users`, fetcher);

  return {
    data,
    error,
    isLoading,
  };
};

export default useUsers;
