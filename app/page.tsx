"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Image from "next/image";

let socket;

export default function Home() {
  const [username, setUsername] = useState("");
  const [chosenUsername, setChosenUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    socket = io();

    socket.on("newIncomingMessage", (msg) => {
      setMessages((currentMsg) => [...currentMsg, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (message && chosenUsername) {
      const newMessage = {
        author: chosenUsername,
        message,
        type: "text",
      };
      socket.emit("createdMessage", newMessage);
      setMessages((currentMsg) => [...currentMsg, newMessage]);
      setMessage("");
    }
  };

  const sendImage = (file) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const newMessage = {
        author: chosenUsername,
        message: event.target.result,
        type: "image",
      };
      socket.emit("createdMessage", newMessage);
      setMessages((currentMsg) => [...currentMsg, newMessage]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      sendImage(file);
    }
  };

  const handleKeypress = (e) => {
    if (e.keyCode === 13) {
      if (message) {
        sendMessage();
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-800 text-white">
      <div className="w-full max-w-md space-y-4">
        {!chosenUsername ? (
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl">Welcome to the Chat!</h1>
            <p>Please choose a username to start chatting.</p>
            <input
              type="text"
              placeholder="Username"
              value={username}
              className="p-2 rounded-md bg-gray-700"
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              onClick={() => {
                if (username) {
                  setChosenUsername(username);
                }
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Join Chat
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-[500px] bg-gray-900 rounded-lg p-4">
            <div className="flex-grow overflow-y-auto mb-4">
              {messages.map((msg, index) => (
                <div key={index} className="mb-2">
                  <span
                    className={
                      msg.author === chosenUsername
                        ? "font-bold text-blue-400"
                        : "font-bold text-red-400"
                    }
                  >
                    {msg.author}
                  </span>
                  :{" "}
                  {msg.type === "image" ? (
                    <Image
                      src={msg.message}
                      alt="Image"
                      width={200}
                      height={200}
                      className="rounded-md"
                    />
                  ) : (
                    msg.message
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                className="flex-grow p-2 rounded-md bg-gray-700"
                onChange={(e) => setMessage(e.target.value)}
                onKeyUp={handleKeypress}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                <Image
                  src="/camera.svg"
                  alt="Upload Image"
                  width={20}
                  height={20}
                />
              </button>
              <button
                onClick={sendMessage}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
