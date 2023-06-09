import React, { useEffect, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import useAgenda from "@/hooks/useAgenda";
import { addTask, deleteTask, editTask } from "@/service/task";
import { deleteAgenda, editAgenda } from "@/service/agenda";
import DeleteAgendaModal from "@/components/DeleteAgendaModal";
import { Session } from "next-auth";
import { Role, User } from "@prisma/client";
import useUsers from "@/hooks/useUserList";
import { getTimeInfo } from "@/libs/time";
import { TIMEZONES } from "@/constants/timezone";
import toast from "react-hot-toast";
import { IUser } from "@/types/user";
import Loader from "@/components/Spinner";
import { IAgenda } from "@/types/agenda";

interface IProps {
  currSession: Session;
}

const Agenda: React.FC<IProps> = ({ currSession }) => {
  const router = useRouter();
  const agendaId = router.query.id as string;
  const {
    data: agendaData,
    mutate: mutateAgenda,
    isLoading: isAgendaLoading,
  } = useAgenda(agendaId);

  const [task, setTask] = useState("");
  const [taskId, setTaskId] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [agendaTitle, setAgendaTitle] = useState("");
  const [owner, setOwner] = useState("");

  const [openDeleteAgendaModal, setOpenDeleteAgendaModal] = useState(false);

  const [timezone, setTimezone] = useState("UTC");
  const [browserTime, setBrowserTime] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [timeDiff, setTimeDiff] = useState(0);

  const [users, setUsers] = useState<IUser[]>([]);
  const [isUsersSet, setIsUsersSet] = useState(false);

  const [agenda, setAgenda] = useState<IAgenda | undefined>();
  const [isAgendaSet, setIsAgendaSet] = useState(false);

  /* if (router.query.agenda) {
    agenda = JSON.parse(router.query.agenda as string);
  } else {
    agenda = data;
  } */

  useEffect(() => {
    const updateTime = () => {
      const agendaTimezone = agenda ? agenda.timezone : "UTC";
      const { browserTime, targetTime, timeDiff } = getTimeInfo(agendaTimezone);

      setBrowserTime(browserTime);
      setTargetTime(targetTime);
      setTimeDiff(timeDiff);
    };

    if (agenda) {
      updateTime();
    }
    const timer = setInterval(() => {
      updateTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [agenda]);

  const { data: usersData, isLoading: isUsersLoading } = useUsers(
    currSession.user.role !== Role.REGULAR
  );

  useEffect(() => {
    if (!isUsersLoading) {
      setUsers(usersData);
      setIsUsersSet(true);
    }
  }, [usersData, isUsersLoading]);

  useEffect(() => {
    if (!isAgendaLoading) {
      setAgenda(agendaData);
      setIsAgendaSet(true);
    }
  }, [agendaData, isAgendaLoading]);

  useEffect(() => {
    setOwner(agenda?.ownerId ?? "");
  }, [agenda?.ownerId]);

  useEffect(() => {
    setAgendaTitle(agenda?.name ?? "");
  }, [agenda?.name]);

  useEffect(() => {
    setTimezone(agenda?.timezone ?? "");
  }, [agenda?.timezone]);

  useEffect(() => {
    const func = async () => {
      if (agenda?.name !== agendaTitle && agenda?.name) {
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
  }, [agendaTitle, agenda?.name, agendaId]);

  const handleTimezoneChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newTimezone = event.currentTarget.value;
    setTimezone(newTimezone);
    await editAgenda(agendaId, { timezone: newTimezone });
    mutateAgenda();
  };

  const handleOwnerChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newOwner = event.currentTarget.value;
    setOwner(newOwner);
    await editAgenda(agendaId, { ownerId: newOwner });
    mutateAgenda();
  };

  const handleDeleteAgendaModal = async () => {
    await deleteAgenda(agendaId);
    setOpenDeleteAgendaModal(false);
    toast.success("Agenda deleted.");
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
      <Navbar currSession={currSession} />
      <div className="max-w-4xl mx-auto p-8 px-4 sm:px-6 lg:px-8">
        <input
          type="text"
          value={agendaTitle}
          onChange={handleTitleChange}
          className="text-3xl leading-none font-bold outline-none rounded-md border-2 border-gray-300 mb-2"
          placeholder="Agenda Title"
        />
        <div className="font-light mb-6">
          Agenda Time: {targetTime} | Local Time: {browserTime} | Time offset
          (hours): {timeDiff}
        </div>
        <div className="grid gap-6 md:grid-cols-2 mb-4">
          {currSession.user.role !== Role.REGULAR && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Owner
              </label>
              <select
                value={owner}
                onChange={handleOwnerChange}
                className="border-2 border-gray-300 py-2 pl-4 pr-8 w-full rounded-md mr-2"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={handleTimezoneChange}
              className="border-2 border-gray-300 py-2 pl-4 pr-8 w-full rounded-md mr-2"
            >
              {TIMEZONES.map((timezone) => (
                <option key={timezone.id} value={timezone.id}>
                  {timezone.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex mb-4">
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
        {isUsersSet && isAgendaSet && (
          <ul className="divide-y divide-gray-200 mb-4 overflow-y-auto max-h-96">
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
        )}
        {(isUsersLoading || isAgendaLoading) &&
          (!isUsersSet || !isAgendaSet) && (
            <div className="my-4">
              <Loader />
            </div>
          )}
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
    props: {
      currSession: session,
    },
  };
}

export default Agenda;
