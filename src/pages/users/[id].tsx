import Navbar from "@/components/Navbar";
import useUser from "@/hooks/useUser";
import { editUser, IEditUserBody } from "@/service/user";
import { Role } from "@prisma/client";
import { NextPageContext } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const MY_PROFILE = "my-profile";

interface IProps {
  currSession: Session;
}

const UserDetails: React.FC<IProps> = ({ currSession }) => {
  const router = useRouter();
  const id = router.query.id as string;
  const userId = useMemo(
    () => (id === MY_PROFILE ? currSession.user.id : id),
    [id, currSession.user.id]
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>(Role.REGULAR);

  const { data: user } = useUser(userId);

  useEffect(() => {
    setName(user?.name ?? "");
    setUsername(user?.username ?? "");
    setRole(user?.role ?? Role.REGULAR);
  }, [user]);

  const possibleRoles = useMemo(() => {
    if (currSession.user.role === Role.ADMIN) {
      return Object.values(Role);
    }

    return [Role.REGULAR, Role.MANAGER];
  }, [currSession.user.role]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setName(event.currentTarget.value);
  };
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setUsername(event.currentTarget.value);
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setPassword(event.currentTarget.value);
  };
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.preventDefault();
    setRole(event.currentTarget.value as Role);
  };

  const handleEditUser = async () => {
    const data: IEditUserBody = { name, username, role };
    if (password !== "") {
      data.password = password;
    }
    await editUser(userId, data);

    toast.success("User edited.");

    if (id !== MY_PROFILE) {
      router.push("/users");
    }
  };

  return (
    <>
      <Navbar currSession={currSession} />
      <div className="m-8">
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Full Name
          </label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Full Name"
            value={name}
            onChange={handleNameChange}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Username
          </label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            required
            disabled={currSession.user.id === userId}
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Password
          </label>
          <input
            type="password"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Role
          </label>
          <select
            value={role}
            onChange={handleRoleChange}
            className="border-2 border-gray-300 py-2 px-4 w-full rounded-md mr-2"
            disabled={currSession.user.id === userId}
          >
            {possibleRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleEditUser}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Save
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
    props: { currSession: session },
  };
}

export default UserDetails;
