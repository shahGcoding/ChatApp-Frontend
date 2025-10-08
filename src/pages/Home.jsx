import React, { useState, useEffect } from "react";
import { getAllUsers, getUserConversations } from "../config/config.js";
import { Search } from "lucide-react";
import { useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import LogoutBtn from "../components/LogoutBtn.jsx";
import { Input } from "../components/ui/input.js";
import Avatar from "../components/Avatar.jsx";
import { MoreVertical } from "lucide-react";

export function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useSelector((state) => state.auth);
  const [allUsers, setAllUsers] = useState([]);
  const [SearchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hovered, setHovered] = useState(null);

  const navigate = useNavigate();

  const userId = userData?._id;
  //const {contactId} = useParams();

  useEffect(() => {
    if (!userId) return;

    const fetchConversation = async () => {
      try {
        const res = await getUserConversations(userId);

        if (res && res.length > 0) {
          const contactIds = res.map((conv) => conv.contact._id);

          const allUsers = await getAllUsers();

          const filteredUser = allUsers.filter((u) =>
            contactIds.includes(u._id)
          );
          setUsers(filteredUser);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.log("Error fetching Conversation", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [userId]);

  
  // Fetch all users
  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await getAllUsers();
        if (res) {
          const filteredUser = res.filter((u) => u._id !== userData._id);
          setAllUsers(filteredUser);
          setLoading(false);
        }
      } catch (error) {
        console.log("Problem in getAllUsers function", error);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, [userData, searchResults, SearchTerm]);

  useEffect(() => {
    if (SearchTerm.trim() === "") {
      setSearchResults([]);
    } else {
      const results = allUsers.filter((u) =>
        u.username.toLowerCase().includes(SearchTerm.toLowerCase())
      );
      setSearchResults(results);
    }
  }, [SearchTerm, allUsers]);

  const navLinkStyle = ({ isActive }) =>
    `flex gap-3 items-center px-4 py-2 rounded-xl font-medium transition-colors ${
      isActive
        ? "bg-gray-100 text-gray-600"
        : "text-gray-700 hover:bg-gray-100 hover:text-green-gray"
    }`;

  return (
    <div className="flex h-screen">
      {/* Left sidebar with all users */}
      <aside className="w-1/4 min-w-[260px] flex flex-col pt-4 px-3 overflow-y-auto bg-white 
                       md:w-1/3 sm:w-full sm:h-[50vh]  sm:overflow-x-hidden">
        <div className="relative flex justify-between items-center px-3 mb-3">
          <h2 className="text-2xl font-bold mb-2 text-green-500">ChatApp</h2>

          <button
            className="p-1 hover:bg-gray-200 rounded-full transition"
            // onMouseEnter={() => setOpenDropdown(true)}
            onClick={() => setOpenDropdown((prev) => !prev)}
          >
            <MoreVertical size={25} className="text-gray-600 mb-1" />
          </button>

          {openDropdown && (
            <div className="absolute top-10 right-2 w-40 bg-white border border-gray-200 rounded-lg shadow-md py-2 z-10"
            onMouseLeave={() => setOpenDropdown(false)}>
              <button
                onClick={() => navigate("/profile")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                View Profile
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                Settings
              </button>
              <div className="ml-1">
              <LogoutBtn />
              </div>
            </div>
          )}
        </div>
        <div className="relative w-full mb-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search...."
            className="pl-10 pr-4 w-full rounded-4xl"
            value={SearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg mt-1">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer "
                  onClick={() => navigate(`/chat/${user._id}`)}
                >
                  {user.username}
                </div>
              ))}
            </div>
          )}
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No Users found.</p>
        ) : (
          <nav className="flex flex-col gap-2">
            {users.map((user) => (
              <div key={user._id} className="rounded-xl hover:bg-gray-100">
                <NavLink to={`/chat/${user._id}`} className={navLinkStyle}>
                  <Avatar size={50} src={user?.avatar} />
                  {user.username}
                </NavLink>
              </div>
            ))}
          </nav>
        )}
      </aside>

      {/* Right side for conversation */}
      <main className="flex-1 bg-gray-300">
        <Outlet />
      </main>
    </div>
  );
}
