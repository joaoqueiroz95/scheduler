import { IAgenda } from "@/types/agenda";
import { useRouter } from "next/router";
import React from "react";

const MAX_DISPLAYED_TASKS = 3;

interface IProps {
  agenda: IAgenda;
}

const AgendaOverviewCard: React.FC<IProps> = ({ agenda }) => {
  const router = useRouter();

  const handleClickAgenda = () => {
    router.push(
      {
        pathname: `/agenda/${agenda.id}`,
        query: {
          agenda: JSON.stringify(agenda),
        },
      },
      `/agenda/${agenda.id}`
    );
  };

  const tasksList = (agenda: IAgenda) => {
    if (agenda.tasks.length <= MAX_DISPLAYED_TASKS) {
      return agenda.tasks.map((task) => <li key={task.id}>{task.name}</li>);
    }

    return [
      ...agenda.tasks
        .slice(0, MAX_DISPLAYED_TASKS - 1)
        .map((task) => <li key={task.id}>{task.name}</li>),
      <li key="more">
        {agenda.tasks.length - MAX_DISPLAYED_TASKS + 1} more tasks
      </li>,
    ];
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer"
      onClick={handleClickAgenda}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold">{agenda.name}</h2>
        <div className="font-light mb-4">owner: {agenda.owner.name}</div>
        <ul className="list-disc ml-6 mb-4">{tasksList(agenda)}</ul>
      </div>
    </div>
  );
};

export default AgendaOverviewCard;
