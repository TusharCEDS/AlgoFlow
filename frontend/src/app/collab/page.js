"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic'
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })
import { io } from "socket.io-client";

export default function Collab() {
  const router = useRouter();
  const socketRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("lobby");
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [code, setCode] = useState("");
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    socketRef.current = io("http://localhost:5000");
    const socket = socketRef.current;

    socket.on("collab-created", ({ roomId, code }) => {
      setRoomId(roomId);
      setCode(code);
      setUsers([storedUser.username]);
      setConnected(true);
      setScreen("editor");
    });

    socket.on("collab-joined", ({ roomId, code }) => {
      setRoomId(roomId);
      setCode(code);
      setConnected(true);
      setScreen("editor");
    });

    socket.on("collab-user-joined", ({ users }) => {
      setUsers(users);
    });

    socket.on("collab-code-update", ({ code }) => {
      isRemoteUpdate.current = true;
      setCode(code);
    });

    socket.on("collab-user-left", ({ username }) => {
      setUsers((prev) => prev.filter((u) => u !== username));
    });

    socket.on("collab-error", ({ message }) => {
      setError(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const handleCreate = () => {
    if (!user) return;
    setError("");
    socketRef.current.emit("collab-create", { username: user.username });
  };

  const handleJoin = () => {
    if (!joinRoomId.trim() || !user) return;
    setError("");
    socketRef.current.emit("collab-join", {
      roomId: joinRoomId.toUpperCase(),
      username: user.username,
    });
  };

  const handleCodeChange = (value) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      setCode(value);
      return;
    }
    setCode(value);
    socketRef.current?.emit("collab-code-change", { roomId, code: value });
  };

  if (screen === "lobby") {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold mb-2 text-center">
            👥 Collaborative Editor
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Code together with your friends in real time
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
            <h2 className="font-semibold mb-3">Create a Room</h2>
            <p className="text-gray-400 text-sm mb-4">
              Start a new collab session and invite friends
            </p>
            <button
              onClick={handleCreate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
            >
              Create Collab Room
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-3">Join a Room</h2>
            <p className="text-gray-400 text-sm mb-4">
              Enter a room code shared by your friend
            </p>
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              placeholder="Enter room code (e.g. ABC123)"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm mb-3 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleJoin}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition"
            >
              Join Room
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="flex items-center justify-between px-8 py-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Room:{" "}
            <span className="text-white font-mono font-bold">{roomId}</span>
          </span>
          <div className="flex items-center gap-2">
            {users.map((u, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-full ${
                  u === user?.username
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {u === user?.username ? `${u} (you)` : u}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-yellow-400"}`}
          />
          <span className="text-xs text-gray-400">
            {connected ? "Connected" : "Connecting..."}
          </span>
          <button
            onClick={() => {
              socketRef.current?.emit("collab-leave", {
                roomId,
                username: user?.username,
              });
              setScreen("lobby");
              setRoomId("");
              setCode("");
              setUsers([]);
              setConnected(false);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Leave Room
          </button>
        </div>
      </div>

      <div style={{ height: "calc(100vh - 57px)", width: "100%" }}>
        <Editor
          height="calc(100vh - 57px)"
          width="100%"
          defaultLanguage="cpp"
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
          }}
        />
      </div>
    </main>
  );
}
