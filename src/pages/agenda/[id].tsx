import React, { useEffect, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import { IAgenda } from "@/types/agenda";
import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import useAgenda from "@/hooks/useAgenda";
import { addTask, deleteTask, editTask } from "@/service/task";
import { deleteAgenda, editAgenda } from "@/service/agenda";
import DeleteAgendaModal from "@/components/DeleteAgendaModal";

const Agenda = () => {
  const router = useRouter();
  const agendaId = router.query.id as string;
  const { data, mutate: mutateAgenda } = useAgenda(agendaId);

  const [task, setTask] = useState("");
  const [taskId, setTaskId] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [agendaTitle, setAgendaTitle] = useState("");

  const [openDeleteAgendaModal, setOpenDeleteAgendaModal] = useState(false);

  let agenda: IAgenda | undefined;

  if (router.query.agenda) {
    agenda = JSON.parse(router.query.agenda as string);
  } else {
    agenda = data;
  }

  useEffect(() => {
    setAgendaTitle(agenda?.name ?? "");
  }, [agenda?.name]);

  useEffect(() => {
    const func = async () => {
      if (agenda?.name !== agendaTitle) {
        await editAgenda(agendaId, { name: agendaTitle });
        mutateAgenda();
      }
    };

    const timeoutId = setTimeout(() => {
      func();
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [agendaTitle]);

  const handleDeleteAgendaModal = async () => {
    await deleteAgenda(agendaId);
    setOpenDeleteAgendaModal(false);
    router.push("/");
  };
  const handleCloseAgendaModal = () => {
    setOpenDeleteAgendaModal(false);
  };

  const handleDeleteAgenda = () => {
    setOpenDeleteAgendaModal(true);
  };

  const handleTitleChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAgendaTitle(event.currentTarget.value);
  };

  const handleTaskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTask(event.currentTarget.value);
  };

  const handleAddTask = async () => {
    await addTask(agendaId, { name: task });
    setTask("");
    mutateAgenda();
  };

  const handleEditTask = async () => {
    await editTask(agendaId, taskId, { name: task });
    setIsEdit(false);
    setTask("");
    mutateAgenda();
  };

  const handleDeleteTask = (taskId: string) => async () => {
    await deleteTask(agendaId, taskId);
    mutateAgenda();
  };

  const handleClickEditTask = (taskId: string) => async () => {
    const task = agenda?.tasks.find((task) => task.id === taskId);
    if (task) {
      if (!isEdit) {
        setTask(task.name);
        setTaskId(task.id);
      } else {
        setTask("");
      }
      setIsEdit((val) => !val);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <input
            type="text"
            value={agendaTitle}
            onChange={handleTitleChange}
            className="text-3xl leading-none font-bold outline-none mb-8"
          />
          <div className="flex">
            <input
              type="text"
              className="border-2 border-gray-300 py-2 px-4 w-full rounded-md mr-2"
              placeholder="Enter a task"
              onChange={handleTaskChange}
              value={task}
            />
            <button
              onClick={isEdit ? handleEditTask : handleAddTask}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              {isEdit ? "Edit" : "Add"}
            </button>
          </div>
        </div>
        <ul className="divide-y divide-gray-200 mb-4">
          {agenda &&
            agenda.tasks.map((task) => (
              <li
                key={task.id}
                className="py-4 flex items-center justify-between gap-6"
              >
                <span className="font-medium flex-1">{task.name}</span>
                <button onClick={handleClickEditTask(task.id)}>
                  <PencilSquareIcon className="h-6 w-6 text-blue-500 hover:text-blue-600" />
                </button>
                <button>
                  <TrashIcon
                    className="h-6 w-6 text-red-500 hover:text-red-600"
                    onClick={handleDeleteTask(task.id)}
                  />
                </button>
              </li>
            ))}
        </ul>
        <button
          onClick={handleDeleteAgenda}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
        >
          Delete
        </button>
      </div>
      <DeleteAgendaModal
        open={openDeleteAgendaModal}
        onCancel={handleCloseAgendaModal}
        onDelete={handleDeleteAgendaModal}
      />
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
    props: {},
  };
}

export default Agenda;
