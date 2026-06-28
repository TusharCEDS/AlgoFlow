'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Problems() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/problems`)
        const data = await response.json()
        setProblems(data)
      } catch (err) {
        console.error('Failed to fetch problems', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading problems...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-8 py-12">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-2">Problems</h1>
        <p className="text-gray-400 mb-8">Solve problems, track your progress</p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">#</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Title</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Difficulty</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Tags</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem, index) => (
                <tr
                  key={problem.id}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                >
                  <td className="px-6 py-4 text-gray-400 text-sm">{index + 1}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/problem/${problem.id}`}
                      className="text-white hover:text-blue-400 transition font-medium"
                    >
                      {problem.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      problem.difficulty === 'easy'
                        ? 'bg-green-500/10 text-green-400'
                        : problem.difficulty === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {problem.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  )
}