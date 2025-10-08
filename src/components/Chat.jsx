import React, { useEffect, useState } from "react";
import socket from "../socket";
import {
  getConversation,
  sendMessage,
  getUserById,
  deleteMessage as deleteMessageApi,
} from "../config/config.js";
import { Input } from "./ui/input";
import { Button } from "./ui/button.js";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Avatar from "./Avatar.jsx";
import { MoreVertical, ChevronDown, Users } from "lucide-react";

export function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState("");
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [headerDropdown, setHeaderDropdown] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const { contactId } = useParams();
  const { userData } = useSelector((state) => state.auth);
  const userId = userData?._id;

  // for fetching contact userId
  useEffect(() => {
    const fetchUserById = async () => {
      try {
        const res = await getUserById(contactId);
        if (res) {
          setContact(res);
        }
      } catch (error) {
        console.log("Error in fecthing user by Id:", error);
      }
    };

    if (contactId) fetchUserById();
  }, [contactId]);

  // 🗑️ Delete message function with messageId
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessageApi(messageId); // call API
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId)); // update UI
      setOpenDropdown(null);
    } catch (error) {
      console.log("Error deleting message:", error);
    }
  };

  // for fetching conversation or messaging
  useEffect(() => {
    if (userId && contactId) {
      const fetchMessages = async () => {
        try {
          const res = await getConversation(userId, contactId);
          if (res) setMessages(res);
        } catch (error) {
          console.log("Error fetching messages", error);
        }
      };
      fetchMessages();
    }
  }, [userId, contactId]);

  // Join user room on mount
  useEffect(() => {
    if (userId) {
      socket.emit("join", userId);
    }

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId]);

  // for fetching online users
  useEffect(() => {
    if (userId) {
      socket.emit("userOnline", userId);
    }

    socket.on("onlineUsers", (users) => {
      console.log("Currently online users:", users);
      setOnlineUsers(users); // store in state

      return () => {
        socket.off("onlineUsers");
      }

    });
  }, [userId]);

  const SndMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        senderId: userId,
        receiverId: contactId,
        message,
      };

      socket.emit("sendMessage", newMessage);

      try {
        const savedMsg = await sendMessage(newMessage); // must return saved message with _id
        setMessages((prev) => [...prev, savedMsg]);
      } catch (error) {
        console.log("Error saving messages:", error);
      }

      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center h-16 px-4 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <Avatar size={50} src={contact?.avatar} />
          <div className="flex flex-col">
            <h1 className="text-black font-semibold text-base sm:text-lg">
              {contact ? contact.username : "Loading..."}
            </h1>
            <p className="text-sm text-gray-500">
              {/* {contact.status || "offline"} */}
              {onlineUsers.includes(contactId) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="relative text-gray-600">
          <button
            className="p-2 hover:bg-gray-200 rounded-full transition"
            onClick={() => setHeaderDropdown((prev) => !prev)}
          >
            <MoreVertical size={24} />
          </button>

          {/* Dropdown positioned to the LEFT of the button */}
          {headerDropdown && (
            <div
              className="absolute top-10 right-full w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
              onMouseLeave={() => setHeaderDropdown(false)}
            >
              <ul className="text-sm">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  View Contact
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Block User
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500">
                  Delete Chat
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={msg._id || idx}
            className={`relative p-2 rounded-lg max-w-xs group ${
              msg.senderId === userId
                ? "bg-green-500 text-white self-end ml-auto"
                : "bg-gray-50 text-gray-800 self-start mr-auto"
            }`}
            onMouseEnter={() => setHoveredMsg(idx)}
            onMouseLeave={() => setHoveredMsg(null)}
          >
            <div className="flex justify-between">
              <p>{msg.message}</p>
              <p className="h-2 text-sm mt-3">
                {new Date(msg?.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {/* Dropdown trigger */}
            {hoveredMsg === idx && (
              <button
                className="absolute top-1 right-1 p-1 hover:bg-gray-300 rounded"
                onClick={() =>
                  setOpenDropdown(openDropdown === idx ? null : idx)
                }
              >
                <ChevronDown size={18} />
              </button>
            )}

            {/* Dropdown menu */}
            {openDropdown === idx && (
              <div
                className="absolute right-0 top-6 w-28 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
                onMouseLeave={() => setOpenDropdown(false)}
              >
                <ul className="text-sm">
                  <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    Reply
                  </li>
                  <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    Edit
                  </li>
                  <li
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                    onClick={() => handleDeleteMessage(msg._id)}
                  >
                    Delete
                  </li>
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-center p-3 border-t-gray-800 bg-white sticky bottom-0">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2 mr-2 focus:outline-none"
        />
        <Button
          onClick={SndMessage}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
