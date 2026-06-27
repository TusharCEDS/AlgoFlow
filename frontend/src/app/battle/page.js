"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";

export default function Battle() {
  const router = useRouter();
  const socketRef = useRef(null);

  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("lobby"); // lobby, waiting, battle, result
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [problem, setProblem] = useState(null);
  const [players, setPlayers] = useState([]);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    const savedRoomId = localStorage.getItem("battleRoomId");
    if (savedRoomId) {
      localStorage.removeItem("battleRoomId");
    }
    // connect to socket
    socketRef.current = io("http://localhost:5000");

    const socket = socketRef.current;

    socket.on("room-created", ({ roomId, problem }) => {
      setRoomId(roomId);
      setProblem(problem);
      setCode(problem.starter_code);
      setScreen("waiting");
      localStorage.setItem("battleRoomId", roomId);
    });

    socket.on("room-joined", ({ problem }) => {
      setProblem(problem);
      setCode(problem.starter_code);
      localStorage.setItem("battleRoomId", joinRoomId);
    });

    socket.on("battle-start", ({ problem, players }) => {
      setProblem(problem);
      setCode(problem.starter_code);
      setPlayers(players);
      setScreen("battle");
    });

    socket.on("battle-won", ({ winner }) => {
      setResult({ winner });
      setScreen("result");
      localStorage.removeItem("battleRoomId");
    });

    socket.on("battle-submission-result", ({ message }) => {
      setError(message);
      setSubmitting(false);
    });

    socket.on("error", ({ message }) => {
      setError(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const handleCreateRoom = () => {
    if (!user) return;
    setError("");
    socketRef.current.emit("create-room", { username: user.username });
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim() || !user) return;
    setError("");
    socketRef.current.emit("join-room", {
      roomId: joinRoomId.toUpperCase(),
      username: user.username,
    });
  };

  const handleSubmit = () => {
    if (!code || submitting) return;
    setSubmitting(true);
    setError("");
    socketRef.current.emit("battle-submit", {
      roomId,
      code,
      username: user.username,
    });
  };

  // LOBBY SCREEN
  if (screen === "lobby") {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold mb-2 text-center">
            ⚔️ Battle Mode
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Challenge a friend to a real-time coding battle
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
            <h2 className="font-semibold mb-3">Create a Room</h2>
            <p className="text-gray-400 text-sm mb-4">
              Start a new battle and share the room code with your friend
            </p>
            <button
              onClick={handleCreateRoom}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
            >
              Create Battle Room
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
              onClick={handleJoinRoom}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition"
            >
              Join Room
            </button>
          </div>
        </div>
      </main>
    );
  }

  // WAITING SCREEN
  if (screen === "waiting") {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            ⚔️ Waiting for opponent...
          </h1>
          <p className="text-gray-400 mb-6">
            Share this room code with your friend:
          </p>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-12 py-6 inline-block mb-6">
            <span className="text-4xl font-mono font-bold text-blue-400 tracking-widest">
              {roomId}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Battle will start automatically when they join
          </p>
          <button
            onClick={() => {
              setScreen("lobby");
              setRoomId("");
            }}
            className="mt-6 text-gray-500 hover:text-gray-300 text-sm transition block mx-auto"
          >
            Cancel
          </button>
        </div>
      </main>
    );
  }

  // RESULT SCREEN
  if (screen === "result") {
    const isWinner = result?.winner === user?.username;
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">{isWinner ? "🏆" : "😔"}</div>
          <h1 className="text-3xl font-bold mb-2">
            {isWinner ? "You Won!" : `${result?.winner} Won!`}
          </h1>
          <p className="text-gray-400 mb-8">
            {isWinner
              ? "Congratulations! You solved it first."
              : "Better luck next time!"}
          </p>
          <button
            onClick={() => {
              setScreen("lobby");
              setRoomId("");
              setProblem(null);
              setResult(null);
              setPlayers([]);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition"
          >
            Play Again
          </button>
        </div>
      </main>
    );
  }

  // BATTLE SCREEN
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Battle Header */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Room:{" "}
            <span className="text-white font-mono font-bold">{roomId}</span>
          </span>
          <span className="text-sm text-gray-400">
            {players.map((p, i) => (
              <span key={i}>
                <span
                  className={
                    p === user?.username ? "text-blue-400" : "text-red-400"
                  }
                >
                  {p}
                </span>
                {i < players.length - 1 && (
                  <span className="text-gray-600 mx-2">vs</span>
                )}
              </span>
            ))}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setScreen("lobby");
              setRoomId("");
              setProblem(null);
              setPlayers([]);
              setCode("");
              setError("");
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Leave
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
          >
            {submitting ? "Submitting..." : "⚔️ Submit"}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-8 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 h-[calc(100vh-57px)]">
        {/* Problem */}
        <div className="border-r border-gray-800 p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2">{problem?.title}</h2>
          <span
            className={`inline-block text-xs px-3 py-1 rounded-full mb-4 ${
              problem?.difficulty === "easy"
                ? "bg-green-500/10 text-green-400"
                : problem?.difficulty === "medium"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400"
            }`}
          >
            {problem?.difficulty}
          </span>
          <p className="text-gray-400 leading-relaxed">
            {problem?.description}
          </p>
        </div>

        {/* Editor */}
        <div className="flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
