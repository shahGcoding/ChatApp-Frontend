import React, { useEffect, useState } from "react";
import socket from "../socket";
import { getConversation, sendMessage, getUserById } from "../config/config.js";
import { Input } from "./ui/input";
import { Button } from "./ui/button.js";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Avatar from "./Avatar.jsx";

export function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState("");

  const { contactId } = useParams();
  const { userData } = useSelector((state) => state.auth);
  const userId = userData?._id;
  console.log("userId", userId);

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
      console.log("joined room with userId", userId);
    }

    // Listen for incoming messages
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId]);

  const SndMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        senderId: userId,
        receiverId: contactId,
        message,
      };
      console.log("newMessage", newMessage);
      socket.emit("sendMessage", newMessage);

      try {
        await sendMessage(newMessage);
      } catch (error) {
        console.log("Error saving messages:", error);
      }

      setMessages((prev) => [...prev, { senderId: userId, message }]);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center Fixed h-16 mr-0 bg-gray-50">
        <Avatar width="70px" className="mr-2" />
        <div className="flex flex-col ml-2">
        <h1 className="text-black font-semibold">
          {contact ? contact.username : "Loading..."}
        </h1>
        <p className="text-sm">{contact.status}</p>
        </div>
      </header>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-xs ${
              msg.senderId === userId
                ? "bg-green-500 text-white self-end ml-auto"
                : "bg-gray-200 text-gray-800 self-start mr-auto"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      {/* Input area fixed at bottom */}
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

//export default Chat;
