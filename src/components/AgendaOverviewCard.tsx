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
      return agenda.tasks.map((task) => <li id={task.id}>{task.name}</li>);
    }

    return [
      ...agenda.tasks
        .slice(0, MAX_DISPLAYED_TASKS - 1)
        .map((task) => <li id={task.id}>{task.name}</li>),
      <li>{agenda.tasks.length - MAX_DISPLAYED_TASKS + 1} more tasks</li>,
    ];
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg overflow-hidden"
      onClick={handleClickAgenda}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{agenda.name}</h2>
        <ul className="list-disc ml-6 mb-4">{tasksList(agenda)}</ul>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Show More
        </button>
      </div>
    </div>
  );
};

export default AgendaOverviewCard;
