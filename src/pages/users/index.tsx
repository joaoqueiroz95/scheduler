import DeleteUserModal from "@/components/DeleteUserModal";
import Navbar from "@/components/Navbar";
import useUsers from "@/hooks/useUserList";
import { deleteUser } from "@/service/user";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Role } from "@prisma/client";
import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

const Users = () => {
  const router = useRouter();

  const [openDeleteUserModal, setOpenDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState("");

  const { data, mutate: mutateUsers } = useUsers();
  const users = data?.users;

  const handleDeleteUserModal = async () => {
    await deleteUser(userToDelete);
    setOpenDeleteUserModal(false);
    mutateUsers();
  };
  const handleCloseUserModal = () => {
    setOpenDeleteUserModal(false);
  };

  const handleDeleteUser = (userId: string) => () => {
    setUserToDelete(userId);
    setOpenDeleteUserModal(true);
  };

  const handleEditUser = (userId: string) => () => {
    router.push(`/users/${userId}`);
  };

  return (
    <>
      <Navbar />
      <div className="relative overflow-x-auto m-8">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Username
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {users &&
              users.map((user) => (
                <tr
                  key={user.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {user.username}
                  </th>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="">
                    <button onClick={handleEditUser(user.id)}>
                      <PencilSquareIcon className="h-6 w-6 text-blue-500 hover:text-blue-600" />
                    </button>
                  </td>
                  <td className="">
                    <button onClick={handleDeleteUser(user.id)}>
                      <TrashIcon className="h-6 w-6 text-red-500 hover:text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <DeleteUserModal
        open={openDeleteUserModal}
        onCancel={handleCloseUserModal}
        onDelete={handleDeleteUserModal}
      />
    </>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  if (!session || session.user.role === Role.REGULAR) {
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

export default Users;
