"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";

export default function Problem() {
  const params = useParams();
  const { id } = params;

  const [problem, setProblem] = useState(null);
  const [sampleTestCases, setSampleTestCases] = useState([]);
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitResults, setSubmitResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/problems/${id}`,
        );
        const data = await response.json();

        setProblem(data.problem);
        setSampleTestCases(data.sampleTestCases);
        setCode(data.problem.starter_code);

        if (data.sampleTestCases.length > 0) {
          setInput(data.sampleTestCases[0].input);
        }
      } catch (err) {
        console.error("Failed to fetch problem", err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const handleRun = async () => {
    setLoading(true);
    setOutput("");

    try {
      const response = await fetch("http://localhost:6001/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, input }),
      });

      const data = await response.json();

      if (data.error) {
        setOutput(data.error);
      } else {
        setOutput(data.output);
      }
    } catch (err) {
      setOutput("Failed to connect to executor service");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitResults(null);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problem_id: id,
          code,
          language: "cpp",
        }),
      });

      const data = await response.json();
      setSubmitResults(data);
    } catch (err) {
      setSubmitResults({ error: "Failed to submit" });
    } finally {
      setSubmitting(false);
    }
  };
  const handleHint = async () => {
    setHintLoading(true);
    setHint("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/ai/hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemTitle: problem.title,
          problemDescription: problem.description,
          userCode: code,
        }),
      });

      const data = await response.json();
      setHint(data.hint);
    } catch (err) {
      setHint("Failed to get hint. Please try again.");
    } finally {
      setHintLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading problem...</p>
      </main>
    );
  }

  if (!problem) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Problem not found</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Buttons Bar */}
      <div className="flex justify-end gap-3 px-8 py-3 border-b border-gray-800">
        <button
          onClick={handleRun}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition"
        >
          {loading ? "Running..." : "Run Code"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
        <button
          onClick={handleHint}
          disabled={hintLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition"
        >
          {hintLoading ? "Thinking..." : "Get Hint ✨"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-65px)]">
        {/* Left side - Problem description */}
        <div className="border-r border-gray-800 p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
          <span
            className={`inline-block text-xs px-3 py-1 rounded-full mb-4 ${
              problem.difficulty === "easy"
                ? "bg-green-500/10 text-green-400"
                : problem.difficulty === "medium"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400"
            }`}
          >
            {problem.difficulty}
          </span>
          <p className="text-gray-400 leading-relaxed">{problem.description}</p>

          {sampleTestCases.map((tc, index) => (
            <div className="mt-6" key={index}>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Example {index + 1}
              </h3>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm">
                <p className="text-gray-400">
                  Input: <span className="text-white">{tc.input}</span>
                </p>
                <p className="text-gray-400">
                  Output:{" "}
                  <span className="text-white">{tc.expected_output}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right side - Editor + Input/Output */}
        <div className="flex flex-col overflow-y-auto">
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
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

          {hint && (
            <div className="border-t border-gray-800 p-4">
              <label className="text-xs text-purple-400 mb-2 block font-semibold">
                AI Hint ✨
              </label>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {hint}
              </div>
            </div>
          )}

          {submitResults && (
            <div className="border-t border-gray-800 p-4">
              <div
                className={`text-sm font-semibold mb-3 ${
                  submitResults.status === "accepted"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {submitResults.message}
              </div>

              {submitResults.results &&
                submitResults.results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
                      result.passed
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-red-500/10 border border-red-500/20"
                    }`}
                  >
                    <div className="text-sm">
                      <span className="text-gray-400">
                        {result.is_sample
                          ? `Sample Test ${index + 1}`
                          : `Hidden Test ${index + 1}`}
                      </span>
                      {result.is_sample && (
                        <div className="text-xs text-gray-500 mt-1">
                          Input: {result.input} → Expected: {result.expected} |
                          Got: {result.actual}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${result.passed ? "text-green-400" : "text-red-400"}`}
                    >
                      {result.passed ? "✓ Passed" : "✗ Failed"}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
