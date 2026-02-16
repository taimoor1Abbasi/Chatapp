"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Image from "next/image";

let socket;

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState("signUp"); // signUp, logIn, chat
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

  const handleSignUp = async () => {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      setView("logIn");
    } else {
      alert("Sign up failed");
    }
  };

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      setChosenUsername(username);
      setView("chat");
    } else {
      alert("Login failed");
    }
  };
  
  const handleLogout = () => {
    setChosenUsername("");
    setView("logIn");
  }

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
        {view === "signUp" && (
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl">Sign Up</h1>
            <input
              type="text"
              placeholder="Username"
              value={username}
              className="p-2 rounded-md bg-gray-700"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              className="p-2 rounded-md bg-gray-700"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleSignUp}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Up
            </button>
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setView("logIn")}
                className="text-blue-400"
              >
                Log In
              </button>
            </p>
          </div>
        )}
        {view === "logIn" && (
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl">Log In</h1>
            <input
              type="text"
              placeholder="Username"
              value={username}
              className="p-2 rounded-md bg-gray-700"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              className="p-2 rounded-md bg-gray-700"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleLogin}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Log In
            </button>
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => setView("signUp")}
                className="text-blue-400"
              >
                Sign Up
              </button>
            </p>
          </div>
        )}
        {view === "chat" && (
          <div className="flex flex-col h-[500px] bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl">Chatting as {chosenUsername}</h2>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Log Out
              </button>
            </div>
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
