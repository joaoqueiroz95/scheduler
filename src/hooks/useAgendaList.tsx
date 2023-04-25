import useSwr from "swr";
import fetcher from "@/libs/fetcher";
import { IGetAgenda } from "@/types/agenda";

const useAgendas = () => {
  let { data, error, isLoading } = useSwr<IGetAgenda>("/api/agendas", fetcher);

  if (!data) {
    data = {
      agendas: [],
    };
  }

  return {
    data,
    error,
    isLoading,
  };
};

export default useAgendas;
