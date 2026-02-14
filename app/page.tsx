"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";

let socket;

export default function Home() {
  const [username, setUsername] = useState("");
  const [chosenUsername, setChosenUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket = io();

    socket.on("newIncomingMessage", (msg) => {
      setMessages((currentMsg) => [
        ...currentMsg,
        { author: msg.author, message: msg.message },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (message && chosenUsername) {
      socket.emit("createdMessage", { author: chosenUsername, message });
      setMessages((currentMsg) => [
        ...currentMsg,
        { author: chosenUsername, message },
      ]);
      setMessage("");
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
                  : {msg.message}
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
