import React, { useState, useEffect } from "react";
import { getAllUsers } from "../config/config.js";
import { useSelector } from "react-redux";
import { NavLink, Outlet } from "react-router-dom";
import LogoutBtn from "../components/LogoutBtn.jsx";
import { Input } from "../components/ui/input.js";

export function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const {userData} = useSelector((state) => state.auth);
  console.log("userdata", userData);

  // Fetch all users
  useEffect(() => {

    const getUsers = async () => {
        try {
            const res = await getAllUsers();
            console.log("res", res);
            if(res){
                const filteredUser = res.filter((u) => u._id !== userData._id);
                setUsers(filteredUser);
                setLoading(false);
            }
        } catch (error) {
            console.log("Problem in getAllUsers function", error);
        } finally{
            setLoading(false);
        }
    }
    getUsers();

  }, [userData]);

  const navLinkStyle = ({ isActive }) =>
    `flex items-center px-4 py-2 rounded font-medium transition-colors ${
      isActive
        ? "bg-gray-100 text-gray-600"
        : "text-gray-700 hover:bg-gray-100 hover:text-green-gray"
    }`;

  return (
    <div className="flex h-screen">
      {/* Left sidebar with all users */}
      <aside className="w-1/4 border-r border-gray-300 pt-4 pl-0 pr-3 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-green-500">ChatApp</h2>
        <Input />
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No Users found.</p>
        ) : (
          <nav className="flex flex-col gap-2">
            {users.map((user) => (
              <div key={user._id} className="rounded hover:bg-gray-100">
                <NavLink to={`/chat/${user._id}`} className={navLinkStyle}>
                  {user.username}
                </NavLink>
              </div>
            ))}
          </nav>
        )}
        <div className="mt-96">
          <LogoutBtn />
        </div>
      </aside>

      {/* Right side for conversation */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
