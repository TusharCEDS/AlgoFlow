"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function Problem() {
  const [code, setCode] = useState(
    "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}",
  );
  const [input, setInput] = useState("5 10");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">AlgoFlow</h1>
        <button
          onClick={handleRun}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition"
        >
          {loading ? "Running..." : "Run Code"}
        </button>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-65px)]">
        {/* Left side - Problem description */}
        <div className="border-r border-gray-800 p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-2">Two Sum (Simple Addition)</h2>
          <span className="inline-block bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full mb-4">
            Easy
          </span>
          <p className="text-gray-400 leading-relaxed">
            Given two integers <code className="text-blue-400">a</code> and{" "}
            <code className="text-blue-400">b</code>, read them from input and
            print their sum.
          </p>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Example
            </h3>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm">
              <p className="text-gray-400">
                Input: <span className="text-white">5 10</span>
              </p>
              <p className="text-gray-400">
                Output: <span className="text-white">15</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Editor + Input/Output */}
        <div className="flex flex-col">
          {/* Code Editor */}
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

          {/* Input box */}
          <div className="border-t border-gray-800 p-4">
            <label className="text-xs text-gray-400 mb-2 block">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Output box */}
          <div className="border-t border-gray-800 p-4">
            <label className="text-xs text-gray-400 mb-2 block">Output</label>
            <pre className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm text-white font-mono min-h-[80px] whitespace-pre-wrap">
              {output || 'Click "Run Code" to see output'}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
