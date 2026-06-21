"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      

      <section className="px-8 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user?.username}
        </h2>
        <p className="text-gray-400 mb-8">{user?.email}</p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm">
            This is your dashboard. Problems, progress tracking, and battle mode
            will appear here soon.
          </p>
        </div>
      </section>
    </main>
  );
}
