import useSwr from "swr";
import fetcher from "@/libs/fetcher";
import { IGetAgenda } from "@/types/agenda";

const useAgendas = (querySearch: string) => {
  let url = "/api/agendas";
  if (querySearch !== "") {
    url += `?query=${querySearch}`;
  }
  let { data, error, isLoading } = useSwr<IGetAgenda>(url, fetcher);

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
