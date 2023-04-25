import AgendaOverviewCard from "@/components/AgendaOverviewCard";
import Navbar from "@/components/Navbar";
import useAgendas from "@/hooks/useAgendaList";
import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";

export default function Home() {
  const { data: agendas } = useAgendas();

  return (
    <>
      <Head>
        <title>Scheduler</title>
        <meta name="description" content="2 weeks app challenge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 m-8">
        {agendas.agendas.map((agenda) => (
          <AgendaOverviewCard agenda={agenda} />
        ))}
      </div>
    </>
  );
}

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
    props: {},
  };
}
