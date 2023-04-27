import { Role } from "@prisma/client";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import ProfileAvatar from "./ProfileAvatar";

interface IProps {
  currSession: Session;
}

const Navbar: React.FC<IProps> = ({ currSession }) => {
  const logout = () => {
    signOut();
  };

  return (
    <nav className="bg-gray-900 py-4">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex-shrink-0 ml-4">
          <a href="/" className="text-white font-bold text-l mr-8">
            Home
          </a>
          {currSession.user.role !== Role.REGULAR && (
            <a href="/users" className="text-white font-bold text-l">
              Users
            </a>
          )}
        </div>
        <div className="flex-shrink-0">
          {/* <button
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            onClick={logout}
          >
            Logout
          </button> */}
          <ProfileAvatar currSession={currSession} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
