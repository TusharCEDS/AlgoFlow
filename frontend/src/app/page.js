"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [authState, setAuthState] = useState({
    checked: false,
    isLoggedIn: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthState({ checked: true, isLoggedIn: !!token });
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="flex flex-col items-center justify-center text-center px-4 py-24">
        <h2 className="text-5xl font-bold mb-4">Stop getting stuck on DSA</h2>
        <p className="text-gray-400 text-xl max-w-xl mb-8">
          Practice smarter. Battle friends. Get AI-powered hints. Know exactly
          when you are placement ready.
        </p>
        {authState.checked && (
          <Link
            href={authState.isLoggedIn ? "/dashboard" : "/register"}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg transition"
          >
            {authState.isLoggedIn ? "Go to Dashboard" : "Start Practicing Free"}
          </Link>
        )}
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-24 max-w-5xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">⚔️ Battle Mode</h3>
          <p className="text-gray-400 text-sm">
            Challenge friends in real time. Race to solve the same problem.
            First correct submission wins.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">
            👥 Collaborative Editor
          </h3>
          <p className="text-gray-400 text-sm">
            Code together with friends in real time. Share a room, see each
            other's changes instantly.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">✨ AI Hints</h3>
          <p className="text-gray-400 text-sm">
            Stuck on a problem? Get AI-powered pattern detection and hints
            without revealing the full solution.
          </p>
        </div>
      </section>
    </main>
  );
}
