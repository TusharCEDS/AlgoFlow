'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Editor from '@monaco-editor/react'

export default function Problem() {
  const params = useParams()
  const { id } = params

  const [problem, setProblem] = useState(null)
  const [sampleTestCases, setSampleTestCases] = useState([])
  const [code, setCode] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/problems/${id}`)
        const data = await response.json()

        setProblem(data.problem)
        setSampleTestCases(data.sampleTestCases)
        setCode(data.problem.starter_code)

        if (data.sampleTestCases.length > 0) {
          setInput(data.sampleTestCases[0].input)
        }

      } catch (err) {
        console.error('Failed to fetch problem', err)
      } finally {
        setPageLoading(false)
      }
    }

    fetchProblem()
  }, [id])

  const handleRun = async () => {
    setLoading(true)
    setOutput('')

    try {
      const response = await fetch('http://localhost:6001/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, input })
      })

      const data = await response.json()

      if (data.error) {
        setOutput(data.error)
      } else {
        setOutput(data.output)
      }

    } catch (err) {
      setOutput('Failed to connect to executor service')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading problem...</p>
      </main>
    )
  }

  if (!problem) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Problem not found</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      

      <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-65px)]">

        {/* Left side - Problem description */}
        <div className="border-r border-gray-800 p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
          <span className={`inline-block text-xs px-3 py-1 rounded-full mb-4 ${
            problem.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
            problem.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {problem.difficulty}
          </span>
          <p className="text-gray-400 leading-relaxed">
            {problem.description}
          </p>

          {sampleTestCases.map((tc, index) => (
            <div className="mt-6" key={index}>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Example {index + 1}</h3>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm">
                <p className="text-gray-400">Input: <span className="text-white">{tc.input}</span></p>
                <p className="text-gray-400">Output: <span className="text-white">{tc.expected_output}</span></p>
              </div>
            </div>
          ))}
        </div>

        {/* Right side - Editor + Input/Output */}
        <div className="flex flex-col">

          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                fontSize: 14,
                minimap: { enabled: false }
              }}
            />
          </div>

          <div className="border-t border-gray-800 p-4">
            <label className="text-xs text-gray-400 mb-2 block">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="border-t border-gray-800 p-4">
            <label className="text-xs text-gray-400 mb-2 block">Output</label>
            <pre className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm text-white font-mono min-h-[80px] whitespace-pre-wrap">
              {output || 'Click "Run Code" to see output'}
            </pre>
          </div>

        </div>
      </div>

    </main>
  )
}