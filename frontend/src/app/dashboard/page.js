'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        router.push('/login')
        return
      }

      const storedUser = JSON.parse(localStorage.getItem('user'))
      setUser(storedUser)

      try {
        const response = await fetch('http://localhost:5000/api/submissions/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch stats', err)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-8 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Welcome */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-1">Welcome back, {user?.username} 👋</h2>
          <p className="text-gray-400">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400">{stats?.solved || 0}</div>
            <div className="text-gray-400 text-sm mt-1">Solved</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats?.attempted || 0}</div>
            <div className="text-gray-400 text-sm mt-1">Attempted</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
            <div className="text-gray-400 text-sm mt-1">Submissions</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats?.acceptanceRate || 0}%</div>
            <div className="text-gray-400 text-sm mt-1">Acceptance</div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="font-semibold">Recent Submissions</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Problem</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Difficulty</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentSubmissions?.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4">
                    <span className="text-white text-sm font-medium">{sub.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      sub.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                      sub.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {sub.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${
                      sub.status === 'accepted' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {sub.status === 'accepted' ? '✓ Accepted' : '✗ Wrong Answer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <Link
          href="/problems"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium"
        >
          Continue Practicing →
        </Link>

      </div>
    </main>
  )
}