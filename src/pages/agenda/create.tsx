import React, { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/router";
import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";
import { createAgenda } from "@/service/agenda";
import { addTask } from "@/service/task";
import { Role, User } from "@prisma/client";
import useUsers from "@/hooks/useUserList";
import { TIMEZONES } from "@/constants/timezone";

interface IProps {
  currSession: Session;
}

const Agenda: React.FC<IProps> = ({ currSession }) => {
  const router = useRouter();

  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<{ id: number; name: string }[]>([]);
  const [taskId, setTaskId] = useState(0);
  const [isEdit, setIsEdit] = useState(false);
  const [agendaTitle, setAgendaTitle] = useState("");
  const [owner, setOwner] = useState(currSession.user.id);

  const [timezone, setTimezone] = useState("UTC");

  const [nextId, setNextId] = useState(0);

  let users: User[] = [];
  if (currSession.user.role !== Role.REGULAR) {
    const { data } = useUsers();
    if (data) {
      users = data?.users;
    }
  }

  const handleTimezoneChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newTimezone = event.currentTarget.value;
    setTimezone(newTimezone);
  };

  const handleOwnerChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newOwner = event.currentTarget.value;
    setOwner(newOwner);
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
    setTasks((tasks) => [...tasks, { id: nextId, name: task }]);
    setNextId((id) => id + 1);
    setTask("");
  };

  const handleEditTask = async () => {
    setTasks((tasks) =>
      tasks.map((currTask) => {
        if (currTask.id === taskId) {
          return { ...currTask, name: task };
        }

        return currTask;
      })
    );

    setIsEdit(false);
    setTask("");
  };

  const handleDeleteTask = (taskId: number) => async () => {
    setTasks((tasks) => tasks.filter((task) => task.id !== taskId));
  };

  const handleClickEditTask = (taskId: number) => async () => {
    const task = tasks.find((task) => task.id === taskId);

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

  const handleCreateAgenda = async () => {
    const agenda = await createAgenda({
      name: agendaTitle,
      ownerId: owner,
      timezone,
    });

    if (!agenda?.data) {
      router.push("/");
    }

    for (const task of tasks) {
      await addTask(agenda.data.id, { name: task.name });
    }

    router.push(`/agenda/${agenda.data.id}`);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <input
          type="text"
          value={agendaTitle}
          onChange={handleTitleChange}
          className="text-3xl leading-none font-bold outline-none mb-8"
        />
        {currSession.user.role !== Role.REGULAR && (
          <div className="mb-4 w-52">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Owner
            </label>
            <select
              value={owner}
              onChange={handleOwnerChange}
              className="border-2 border-gray-300 py-2 px-4 w-full rounded-md mr-2"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-4 w-52">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={handleTimezoneChange}
            className="border-2 border-gray-300 py-2 px-4 w-full rounded-md mr-2"
          >
            {TIMEZONES.map((timezone) => (
              <option key={timezone.id} value={timezone.id}>
                {timezone.label}
              </option>
            ))}
          </select>
        </div>
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
        <ul className="divide-y divide-gray-200 mb-4">
          {tasks.map((task) => (
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
          onClick={handleCreateAgenda}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          Create
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

export default Agenda;
