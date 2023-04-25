import useSwr from "swr";
import fetcher from "@/libs/fetcher";
import { IAgenda } from "@/types/agenda";

const useAgenda = (id: string) => {
  let { data, error, isLoading } = useSwr<IAgenda>(
    `/api/agendas/${id}`,
    fetcher
  );

  return {
    data,
    error,
    isLoading,
  };
};

export default useAgenda;
