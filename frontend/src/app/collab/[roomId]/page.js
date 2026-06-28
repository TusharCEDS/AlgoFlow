"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";

export default function CollabRoom() {
  const params = useParams();
  const router = useRouter();
  const { roomId } = params;
  const socketRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  const [user, setUser] = useState(null);
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

    socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL);
    const socket = socketRef.current;

    const action = localStorage.getItem("collabAction");
    const savedRoomId = localStorage.getItem("collabRoomId");

    socket.on("connect", () => {
      if (action === "create" && savedRoomId === roomId) {
        // we just created this room, join it as creator
        localStorage.removeItem("collabAction");
        localStorage.removeItem("collabRoomId");
        socket.emit("collab-join", {
          roomId,
          username: storedUser.username,
        });
      } else {
        // joining someone else's room
        socket.emit("collab-join", {
          roomId,
          username: storedUser.username,
        });
      }
    });

    socket.on("collab-joined", ({ code }) => {
      setCode(code);
      setConnected(true);
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
      socket.emit("collab-leave", { roomId, username: storedUser.username });
      socket.disconnect();
    };
  }, [roomId, router]);

  const handleCodeChange = (value) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      setCode(value);
      return;
    }

    setCode(value);
    socketRef.current?.emit("collab-code-change", { roomId, code: value });
  };

  if (error) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push("/collab")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
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
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
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
