"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [authState, setAuthState] = useState({
    checked: false,
    isLoggedIn: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthState({ checked: true, isLoggedIn: !!token });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthState({ checked: true, isLoggedIn: false });
    router.push("/login");
  };

  if (!authState.checked) {
    return (
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800 bg-gray-950">
        <Link href="/" className="text-xl font-bold text-white">
          AlgoFlow
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800 bg-gray-950">
      <Link href="/" className="text-xl font-bold text-white">
        AlgoFlow
      </Link>

      <div className="flex gap-4 items-center">
        {authState.isLoggedIn ? (
          <>
            <Link
              href="/battle"
              className="text-gray-400 hover:text-white transition py-2"
            >
              ⚔️ Battle
            </Link>
            <Link
              href="/problems"
              className="text-gray-400 hover:text-white transition py-2"
            >
              Problems
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition py-2"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/problems"
              className="text-gray-400 hover:text-white transition py-2"
            >
              Problems
            </Link>
            <Link
              href="/login"
              className="text-gray-400 hover:text-white transition py-2"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
