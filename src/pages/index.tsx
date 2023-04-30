import AgendaOverviewCard from "@/components/AgendaOverviewCard";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Loader from "@/components/Spinner";
import useAgendas from "@/hooks/useAgendaList";
import { IAgenda, IGetAgenda } from "@/types/agenda";
import { NextPageContext } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface IProps {
  currSession: Session;
}

const Home: React.FC<IProps> = ({ currSession }) => {
  const [searchValue, setSearchValue] = useState("");
  const [agendas, setAgendas] = useState<IAgenda[]>([]);
  const [isAgendaSet, setIsAgendaSet] = useState(false);
  const router = useRouter();
  const { data, isLoading } = useAgendas(searchValue);

  useEffect(() => {
    if (!isLoading) {
      setAgendas(data);
      setIsAgendaSet(true);
    }
  }, [data, isLoading]);

  const handleSeachBarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setSearchValue(event.currentTarget.value);
  };

  const handleCreateAgenda = () => {
    router.push("/agenda/create");
  };

  return (
    <>
      <Navbar currSession={currSession} />
      <div className="m-8">
        <SearchBar value={searchValue} onChange={handleSeachBarChange} />
        {isAgendaSet && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-1 mb-4 max-h-128 overflow-y-auto pb-5 pl-3">
            {agendas.map((agenda) => (
              <AgendaOverviewCard key={agenda.id} agenda={agenda} />
            ))}
          </div>
        )}
        {isLoading && !isAgendaSet && (
          <div className="my-4">
            <Loader />
          </div>
        )}
        <button
          onClick={handleCreateAgenda}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Create Agenda
        </button>
      </div>
    </>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      currSession: session,
    },
  };
}

export default Home;
