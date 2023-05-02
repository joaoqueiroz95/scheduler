import Navbar from "@/components/Navbar";
import { createUser, ICreateUserBody } from "@/service/user";
import { Role } from "@prisma/client";
import { NextPageContext } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { createUserSchema } from "@/constants/schemas/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

interface IFormData {
  name: string;
  username: string;
  password: string;
  role: string;
}

interface IProps {
  currSession: Session;
}

const UserDetails: React.FC<IProps> = ({ currSession }) => {
  const router = useRouter();

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>(Role.REGULAR);

  const possibleRoles = useMemo(() => Object.values(Role), []);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
    setValue("name", event.currentTarget.value);
  };
  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.currentTarget.value);
    setValue("username", event.currentTarget.value);
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
    setValue("password", event.currentTarget.value);
  };
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(event.currentTarget.value as Role);
    setValue("role", event.currentTarget.value);
  };

  const handleCreateUser = async () => {
    const data: ICreateUserBody = { name, username, password, role };
    await createUser(data);

    toast.success("User created.");

    router.push("/users");
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
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.name.message}
            </p>
          )}
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
          />
          {errors.username && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.username.message}
            </p>
          )}
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
          {errors.password && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Role
          </label>
          <select
            value={role}
            onChange={handleRoleChange}
            className="border-2 border-gray-300 py-2 px-4 w-full rounded-md mr-2"
          >
            {possibleRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSubmit(handleCreateUser)}
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

  if (!session || session.user.role !== Role.ADMIN) {
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
