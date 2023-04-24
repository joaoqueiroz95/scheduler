import { signOut } from "next-auth/react";

export default function Navbar() {
  const logout = () => {
    signOut();
  };

  return (
    <nav className="bg-gray-900 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex-shrink-0">
          <a href="/" className="text-white font-bold text-xl">
            My Website
          </a>
        </div>
        <div className="flex-shrink-0">
          <button
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
