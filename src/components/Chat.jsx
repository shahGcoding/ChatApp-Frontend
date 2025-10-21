import React, { use, useEffect, useState } from "react";
import socket from "../socket";
import {
  getConversation,
  sendMessage,
  getUserById,
  deleteMessage as deleteMessageApi,
  deleteConversation,
  blockUser,
  unblockUser,
} from "../config/config.js";
import { Input } from "./ui/input";
import { Button } from "./ui/button.js";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Avatar from "./Avatar.jsx";
import {
  MoreVertical,
  ChevronDown,
  Images,
  PlusIcon,
  FileText,
  Video,
  Info,
  Trash2,
  Ban,
  Copy,
  Reply,
} from "lucide-react";

export function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState("");
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [headerDropdown, setHeaderDropdown] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [mediaDropdown, setMediaDropdown] = useState(null);
  const [blockStatus, setBlockStatus] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");

  const { contactId } = useParams();
  const { userData } = useSelector((state) => state.auth);
  const userId = userData?._id;
  console.log("ContactId from params:", contactId);
  console.log("UserId from Redux:", userId);

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

  //  Delete message function with messageId
  const handleDeleteMessage = async (messageId) => {
    try {
       await deleteMessageApi(messageId, userId); // call API
     // setMessages((prev) => prev.filter((msg) => msg._id !== messageId)); // update UI4
      setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, isDeleted: true, message: "" } : msg
      )
    );
      setOpenDropdown(null);
    } catch (error) {
      console.log("Error deleting message:", error);
    }
  };

  const handleDeleteConversation = async (userId, contactId) => {
    try {
      await deleteConversation(userId, contactId);
      setMessages([]); // clear messages in UI
    } catch (error) {
      console.log("Error deleting conversation:", error);
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
      };
    });
  }, [userId]);

  // ensure join happens first
  useEffect(() => {
    if (userId) socket.emit("join", userId);
  }, [userId]);

  // emit markMessagesRead AFTER messages are fetched and after join
  useEffect(() => {
    if (!userId || !contactId) return;
    // only mark if there are unread messages sent to this user
    const hasUnread = messages.some(
      (m) => m.senderId === contactId && m.receiverId === userId && !m.isRead
    );
    if (hasUnread) {
      // small delay to avoid race with join
      setTimeout(() => {
        socket.emit("markMessagesRead", { userId, contactId });
      }, 50);
    }
  }, [userId, contactId, messages]);

  // for real-time reading status update
  // useEffect: listen for read receipts
  useEffect(() => {
    function handleMessagesRead({ updatedMessageIds }) {
      if (!updatedMessageIds || updatedMessageIds.length === 0) return;

      setMessages((prev) =>
        prev.map((msg) =>
          // mark as read only the specific updated messages
          updatedMessageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
        )
      );
    }

    socket.on("messagesRead", handleMessagesRead);
    return () => {
      socket.off("messagesRead", handleMessagesRead);
    };
  }, []); // register once on mount

  useEffect(() => {
    const checkBlockStatus = async () => {
      try {
        const res = await getUserById(userId);
        if (res) {
          const isBlocked = res?.blockedUsers?.includes(contactId);
          setBlockStatus(isBlocked);
        }
      } catch (error) {
        console.log("Error checking block status :", error);
      }
    };

    checkBlockStatus();
  }, [userId, contactId]);

  const handleToggleBlock = async () => {
    try {
      if (blockStatus) {
        await unblockUser(userId, contactId);
        setBlockStatus(false);
      } else {
        await blockUser(userId, contactId);
        setBlockStatus(true);
      }
      setHeaderDropdown(false);
    } catch (error) {
      console.log("error toggling block", error);
    }
  };

  const SndMessage = async () => {
    if (blockStatus) {
      console.log("You have blocked this user. Unblock to send messages.");
      return;
    }
    if (!message.trim() && !file) return;

    let newMessage = {
      senderId: userId,
      receiverId: contactId,
      message,
      type: "text",
    };

    try {
      if (file) {
        // create FormData to send file
        const formData = new FormData();
        formData.append("senderId", userId);
        formData.append("receiverId", contactId);
        formData.append("file", file);
        formData.append("type", fileType);

        // call backend endpoint to upload
        const uploadedMsg = await sendMessage(formData, true); // second arg true => multipart
        socket.emit("sendMessage", uploadedMsg); // real-time
        setMessages((prev) => [...prev, uploadedMsg]);
        setFile(null);
        setFileType("");
      } else {
        // normal text message
        const savedMsg = await sendMessage(newMessage);
        socket.emit("sendMessage", savedMsg);
        setMessages((prev) => [...prev, savedMsg]);
      }

      setMessage("");
    } catch (error) {
      if (error.response && error.response.status === 403) {
        alert(
          error.response.data.message ||
            error.response.data.error ||
            "You are blocked by this user."
        );
      } else {
        console.log("Error sending message:", error);
      }
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
            <p
              className={`text-sm ${
                onlineUsers.includes(contactId)
                  ? "text-green-500"
                  : "text-gray-500"
              }`}
            >
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
              className="absolute top-10 right-6 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
              onMouseLeave={() => setHeaderDropdown(false)}
            >
              <ul className="text-sm text-gray-700">
                <li
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setHeaderDropdown(false);
                    setShowContactInfo(true);
                  }}
                >
                  <Info size={18} />
                  Contact info
                </li>
                <li
                  className="flex items-center gap-2 px-4 py-2 hover:bg-red-200 cursor-pointer"
                  onClick={handleToggleBlock}
                >
                  <Ban size={18} />
                  {blockStatus ? "Unblock" : "Block"}
                </li>
                <li
                  className="flex items-center gap-2 px-4 py-2 hover:bg-red-200 cursor-pointer"
                  onClick={() => handleDeleteConversation(userId, contactId)}
                >
                  <Trash2 size={18} className="text-red-500 " />
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
                ? "bg-green-400 text-black self-end ml-auto"
                : "bg-gray-50/90 text-gray-800 self-start mr-auto"
            }`}
            onMouseEnter={() => setHoveredMsg(idx)}
            onMouseLeave={() => setHoveredMsg(null)}
          >
            <div className="relative">
              {/* message content */}
              { msg.isDeleted ? (
                <em className="text-gray-500 italic">This message was deleted.</em>
              ) : (
                <>
              {msg.type === "text" && <p>{msg.message}</p>}

              {msg.type === "image" && msg.fileUrl && (
                <img
                  src={msg.fileUrl}
                  alt="sent"
                  className="max-w-[250px] rounded-lg mt-2 pb-6"
                />
              )}

              {msg.type === "video" && msg.fileUrl && (
                <video
                  src={msg.fileUrl}
                  controls
                  className="max-w-[250px] rounded-lg mt-2 pb-6"
                />
              )}

              {msg.type === "file" && msg.fileUrl && (
                <a
                  href={msg.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline mt-2 block"
                >
                  📄 View Document
                </a>
              )}
                </>
              )
              }
              
            

              {/* time + ticks fixed at bottom-right corner */}
              <div className="absolute bottom-0 right-2 flex items-center gap-1 text-[11px] ">
                <span>
                  {new Date(msg?.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.senderId === userId && (
                  <span
                    className={`ml-1 ${
                      msg.isRead ? "text-blue-800" : "text-white"
                    }`}
                  >
                    {msg.isRead ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            </div>

            {/* Dropdown trigger */}
            {msg.isDeleted === false && hoveredMsg === idx && (
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
                <ul className="text-sm p-1">
                  <li className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 cursor-pointer">
                    <Reply size={18} />
                    Reply
                  </li>
                  <li className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 cursor-pointer">
                    <Copy size={18} />
                    Copy
                  </li>
                  <li
                    className="flex items-center gap-2 px-4 py-2 rounded hover:bg-red-100 hover:text-red-600 cursor-pointer"
                    onClick={() => handleDeleteMessage(msg._id)}
                  >
                    <Trash2 size={18} />
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
        <div className="relative flex items-center flex-1 mr-2">
          {blockStatus === false ? (
            <div>
              <PlusIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 hover:bg-gray-200 rounded-4xl cursor-pointer"
                size={22}
                onClick={() => setMediaDropdown((prev) => !prev)}
              />
              {mediaDropdown && (
                <div
                  className="absolute bottom-12 left-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                  onMouseLeave={() => setMediaDropdown(false)}
                >
                  <ul className="text-sm text-gray-700">
                    <li
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        document.getElementById("doc-upload").click()
                      }
                    >
                      <FileText size={18} className="text-purple-600" />
                      Documents
                    </li>
                    <li
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        document.getElementById("image-upload").click()
                      }
                    >
                      <Images size={18} className="text-blue-600" />
                      Picture
                    </li>
                    <li
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        document.getElementById("video-upload").click()
                      }
                    >
                      <Video size={18} className="text-red-500" />
                      Video
                    </li>
                  </ul>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                id="image-upload"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setFileType("image");
                }}
              />
              <input
                type="file"
                accept="video/*"
                id="video-upload"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setFileType("video");
                }}
              />
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                id="doc-upload"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setFileType("file");
                }}
              />
            </div>
          ) : (
            ""
          )}
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              blockStatus ? "You have blocked this user." : "Type a message..."
            }
            className="pl-10 pr-4 w-full text-gray-800 rounded-3xl"
            disabled={blockStatus}
            style={{ cursor: blockStatus ? "not-allowed" : "text" }}
          />
        </div>
        <Button
          onClick={SndMessage}
          disabled={blockStatus}
          className={`px-4 py-2 rounded-lg text-white ${
            blockStatus
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Send
        </Button>
      </div>
      {showContactInfo && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Contact Info</h2>
            <button
              className="text-gray-800 hover:cursor-pointer hover:text-black"
              onClick={() => setShowContactInfo(false)}
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col items-center p-6 text-center">
            <Avatar size={90} src={contact?.avatar} />
            <h3 className="mt-3 text-xl font-semibold">{contact?.username}</h3>
            <p className="text-gray-600 text-sm">
              {onlineUsers.includes(contactId) ? "Online" : "Offline"}
            </p>

            <div className="w-full mt-5 text-left space-y-3">
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium">{contact?.email || "N/A"}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">About</p>
                <p className="font-medium">
                  {contact?.about || "Hey there! I am using ChatApp."}
                </p>
              </div>

              <div className="mt-4">
                <Button
                  className={`w-full ${
                    blockStatus
                      ? "bg-gray-400 hover:bg-gray-500"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white`}
                  onClick={handleToggleBlock}
                >
                  {blockStatus ? "Unblock User" : "Block User"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
