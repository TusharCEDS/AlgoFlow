"use client";

import { useState, useRef } from "react";
import { ReactFlow, Background, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

export default function Visualizer() {
  const [activeTab, setActiveTab] = useState("sorting");
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(20);
  const [speed, setSpeed] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [algorithm, setAlgorithm] = useState("bubble");
  const stopRef = useRef(false);

  const generateArray = () => {
    stopRef.current = true;
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    const newArray = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 300) + 20,
    );
    setArray(newArray);
    setIsRunning(false);
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // BUBBLE SORT
  const bubbleSort = async (arr) => {
    const a = [...arr];
    const n = a.length;
    const sortedIndices = [];

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (stopRef.current) return;

        setComparing([j, j + 1]);
        await sleep(speed);

        if (a[j] > a[j + 1]) {
          setSwapping([j, j + 1]);
          await sleep(speed);
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          setArray([...a]);
          await sleep(speed);
          setSwapping([]);
        }
        setComparing([]);
      }
      sortedIndices.push(n - 1 - i);
      setSorted([...sortedIndices]);
    }
    sortedIndices.push(0);
    setSorted([...sortedIndices]);
  };

  // SELECTION SORT
  const selectionSort = async (arr) => {
    const a = [...arr];
    const n = a.length;
    const sortedIndices = [];

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      for (let j = i + 1; j < n; j++) {
        if (stopRef.current) return;
        setComparing([minIdx, j]);
        await sleep(speed);

        if (a[j] < a[minIdx]) {
          minIdx = j;
        }
        setComparing([]);
      }

      if (minIdx !== i) {
        setSwapping([i, minIdx]);
        await sleep(speed);
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        setArray([...a]);
        await sleep(speed);
        setSwapping([]);
      }

      sortedIndices.push(i);
      setSorted([...sortedIndices]);
    }
    sortedIndices.push(n - 1);
    setSorted([...sortedIndices]);
  };

  // INSERTION SORT
  const insertionSort = async (arr) => {
    const a = [...arr];
    const n = a.length;
    const sortedIndices = [0];
    setSorted([0]);

    for (let i = 1; i < n; i++) {
      let j = i;
      while (j > 0) {
        if (stopRef.current) return;
        setComparing([j, j - 1]);
        await sleep(speed);

        if (a[j] < a[j - 1]) {
          setSwapping([j, j - 1]);
          await sleep(speed);
          [a[j], a[j - 1]] = [a[j - 1], a[j]];
          setArray([...a]);
          await sleep(speed);
          setSwapping([]);
          j--;
        } else {
          setComparing([]);
          break;
        }
      }
      sortedIndices.push(i);
      setSorted([...sortedIndices]);
    }
  };

  const handleVisualize = async () => {
    if (array.length === 0) {
      generateArray();
      return;
    }
    stopRef.current = false;
    setIsRunning(true);
    setSorted([]);
    setComparing([]);
    setSwapping([]);

    if (algorithm === "bubble") await bubbleSort(array);
    else if (algorithm === "selection") await selectionSort(array);
    else if (algorithm === "insertion") await insertionSort(array);

    setIsRunning(false);
    setComparing([]);
    setSwapping([]);
  };

  const handleStop = () => {
    stopRef.current = true;
    setIsRunning(false);
    setComparing([]);
    setSwapping([]);
  };

  const getBarColor = (index) => {
    if (sorted.includes(index)) return "#22c55e";
    if (swapping.includes(index)) return "#ef4444";
    if (comparing.includes(index)) return "#eab308";
    return "#3b82f6";
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold mb-1">Algorithm Visualizer</h1>
        <p className="text-gray-400 text-sm">
          Watch algorithms come to life, step by step
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-8 py-4 border-b border-gray-800">
        {["sorting", "array", "tree"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {tab === "sorting"
              ? "📊 Sorting"
              : tab === "array"
                ? "🔍 Array Search"
                : "🌳 Tree"}
          </button>
        ))}
      </div>

      {/* Sorting Tab */}
      {activeTab === "sorting" && (
        <div className="px-8 py-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-8 items-end">
            <div>
              <label className="text-xs text-gray-400 block mb-2">
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                disabled={isRunning}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none"
              >
                <option value="bubble">Bubble Sort</option>
                <option value="selection">Selection Sort</option>
                <option value="insertion">Insertion Sort</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">
                Array Size: {arraySize}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                disabled={isRunning}
                className="w-32"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-2">
                Speed: {speed}ms
              </label>
              <input
                type="range"
                min="10"
                max="500"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-32"
              />
            </div>

            <button
              onClick={generateArray}
              disabled={isRunning}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Generate Array
            </button>

            {!isRunning ? (
              <button
                onClick={handleVisualize}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
              >
                ▶ Visualize
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
              >
                ⏹ Stop
              </button>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-6 mb-6">
            {[
              { color: "#3b82f6", label: "Default" },
              { color: "#eab308", label: "Comparing" },
              { color: "#ef4444", label: "Swapping" },
              { color: "#22c55e", label: "Sorted" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          {/* Bars */}
          {array.length === 0 ? (
            <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl border border-gray-800">
              <p className="text-gray-500">Click "Generate Array" to start</p>
            </div>
          ) : (
            <div className="flex items-end gap-1 h-80 bg-gray-900 rounded-xl border border-gray-800 p-4">
              {array.map((value, index) => (
                <div
                  key={index}
                  style={{
                    height: `${(value / 320) * 100}%`,
                    width: `${100 / array.length}%`,
                    backgroundColor: getBarColor(index),
                    transition: "height 0.1s ease, background-color 0.1s ease",
                    borderRadius: "2px 2px 0 0",
                    minWidth: "2px",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Array Search Tab */}
      {activeTab === "array" && <ArraySearch />}

      {/* Tree Tab */}
      {activeTab === "tree" && <TreeVisualizer />}
    </main>
  );
}
function ArraySearch() {
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState("");
  const [arrayInput, setArrayInput] = useState("3 7 1 9 4 6 2 8 5");
  const [algorithm, setAlgorithm] = useState("linear");
  const [current, setCurrent] = useState(-1);
  const [found, setFound] = useState(-1);
  const [searched, setSearched] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");
  const stopRef = useRef(false);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleGenerate = () => {
    const nums = arrayInput
      .trim()
      .split(" ")
      .map(Number)
      .filter((n) => !isNaN(n));
    setArray(nums);
    setCurrent(-1);
    setFound(-1);
    setSearched([]);
    setMessage("");
  };

  const linearSearch = async (arr, t) => {
    for (let i = 0; i < arr.length; i++) {
      if (stopRef.current) return;
      setCurrent(i);
      setSearched((prev) => [...prev, i]);
      await sleep(300);

      if (arr[i] === t) {
        setFound(i);
        setMessage(`✅ Found ${t} at index ${i}!`);
        setCurrent(-1);
        return;
      }
    }
    setMessage(`❌ ${t} not found in array`);
    setCurrent(-1);
  };

  const binarySearch = async (arr, t) => {
    const sorted = [...arr].sort((a, b) => a - b);
    setArray(sorted);
    setMessage("Array sorted for binary search...");
    await sleep(500);

    let left = 0;
    let right = sorted.length - 1;

    while (left <= right) {
      if (stopRef.current) return;
      const mid = Math.floor((left + right) / 2);
      setCurrent(mid);
      setSearched((prev) => [...prev, mid]);
      await sleep(500);

      if (sorted[mid] === t) {
        setFound(mid);
        setMessage(`✅ Found ${t} at index ${mid}!`);
        setCurrent(-1);
        return;
      } else if (sorted[mid] < t) {
        left = mid + 1;
        setMessage(`${t} > ${sorted[mid]}, search right half`);
      } else {
        right = mid - 1;
        setMessage(`${t} < ${sorted[mid]}, search left half`);
      }
      await sleep(300);
    }
    setMessage(`❌ ${t} not found in array`);
    setCurrent(-1);
  };

  const handleVisualize = async () => {
    if (array.length === 0) {
      setMessage("Generate array first!");
      return;
    }
    const t = parseInt(target);
    if (isNaN(t)) {
      setMessage("Enter a valid target number!");
      return;
    }
    stopRef.current = false;
    setIsRunning(true);
    setCurrent(-1);
    setFound(-1);
    setSearched([]);
    setMessage("");

    if (algorithm === "linear") await linearSearch(array, t);
    else await binarySearch(array, t);

    setIsRunning(false);
  };

  const getBoxColor = (index) => {
    if (found === index) return "bg-green-500 border-green-400";
    if (current === index) return "bg-yellow-500 border-yellow-400";
    if (searched.includes(index)) return "bg-red-500/50 border-red-400";
    return "bg-gray-700 border-gray-600";
  };

  return (
    <div className="px-8 py-6">
      <div className="flex flex-wrap gap-4 mb-8 items-end">
        <div>
          <label className="text-xs text-gray-400 block mb-2">Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={isRunning}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none"
          >
            <option value="linear">Linear Search</option>
            <option value="binary">Binary Search</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-2">
            Array (space separated)
          </label>
          <input
            type="text"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            disabled={isRunning}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-2">Target</label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g. 7"
            disabled={isRunning}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm w-24 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isRunning}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Generate
        </button>

        <button
          onClick={handleVisualize}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
        >
          ▶ Visualize
        </button>
      </div>

      {message && (
        <div className="mb-4 text-sm font-medium text-blue-300">{message}</div>
      )}

      <div className="flex flex-wrap gap-2 p-6 bg-gray-900 rounded-xl border border-gray-800 min-h-[100px] items-center">
        {array.map((val, index) => (
          <div key={index} className="text-center">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-bold text-white transition-all duration-300 ${getBoxColor(index)}`}
            >
              {val}
            </div>
            <div className="text-xs text-gray-500 mt-1">{index}</div>
          </div>
        ))}
        {array.length === 0 && (
          <p className="text-gray-500 text-sm">
            Enter array values and click Generate
          </p>
        )}
      </div>

      <div className="flex gap-6 mt-4">
        {[
          { color: "bg-gray-700", label: "Default" },
          { color: "bg-yellow-500", label: "Current" },
          { color: "bg-red-500/50", label: "Searched" },
          { color: "bg-green-500", label: "Found" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TreeVisualizer() {
  const [input, setInput] = useState('1 2 3 4 5 6 7')
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [traversalOrder, setTraversalOrder] = useState([])
  const [currentNode, setCurrentNode] = useState(null)
  const [visitedNodes, setVisitedNodes] = useState([])
  const [algorithm, setAlgorithm] = useState('bfs')
  const [isRunning, setIsRunning] = useState(false)
  const stopRef = useRef(false)

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const buildTree = () => {
    const values = input.trim().split(' ').map(Number).filter(n => !isNaN(n))
    if (values.length === 0) return

    const newNodes = []
    const newEdges = []

    const levelWidth = 600
    const levelHeight = 100

    values.forEach((val, i) => {
      const level = Math.floor(Math.log2(i + 1))
      const levelStart = Math.pow(2, level) - 1
      const levelEnd = Math.pow(2, level + 1) - 2
      const levelCount = levelEnd - levelStart + 1
      const posInLevel = i - levelStart
      const x = (levelWidth / (levelCount + 1)) * (posInLevel + 1)
      const y = level * levelHeight + 50

      newNodes.push({
        id: `${i}`,
        data: { label: `${val}` },
        position: { x, y },
        style: {
          background: '#1f2937',
          color: 'white',
          border: '2px solid #3b82f6',
          borderRadius: '50%',
          width: 50,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }
      })

      const leftChild = 2 * i + 1
      const rightChild = 2 * i + 2

      if (leftChild < values.length) {
        newEdges.push({
          id: `e${i}-${leftChild}`,
          source: `${i}`,
          target: `${leftChild}`,
          style: { stroke: '#4b5563' }
        })
      }
      if (rightChild < values.length) {
        newEdges.push({
          id: `e${i}-${rightChild}`,
          source: `${i}`,
          target: `${rightChild}`,
          style: { stroke: '#4b5563' }
        })
      }
    })

    setNodes(newNodes)
    setEdges(newEdges)
    setTraversalOrder([])
    setCurrentNode(null)
    setVisitedNodes([])
  }

  const bfs = (values) => {
    const order = []
    const queue = [0]
    while (queue.length > 0) {
      const i = queue.shift()
      if (i >= values.length) continue
      order.push(i)
      queue.push(2 * i + 1)
      queue.push(2 * i + 2)
    }
    return order
  }

  const dfs = (values, i = 0, order = []) => {
    if (i >= values.length) return order
    order.push(i)
    dfs(values, 2 * i + 1, order)
    dfs(values, 2 * i + 2, order)
    return order
  }

  const handleTraverse = async () => {
    const values = input.trim().split(' ').map(Number).filter(n => !isNaN(n))
    if (values.length === 0) return

    stopRef.current = false
    setIsRunning(true)
    setVisitedNodes([])
    setCurrentNode(null)

    const order = algorithm === 'bfs' ? bfs(values) : dfs(values)
    setTraversalOrder(order)

    const visited = []
    for (const idx of order) {
      if (stopRef.current) break
      setCurrentNode(`${idx}`)
      visited.push(`${idx}`)
      setVisitedNodes([...visited])
      await sleep(600)
    }

    setCurrentNode(null)
    setIsRunning(false)
  }

  const getNodeStyle = (nodeId) => {
    if (currentNode === nodeId) {
      return {
        background: '#eab308',
        color: 'black',
        border: '2px solid #ca8a04',
        borderRadius: '50%',
        width: 50,
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    }
    if (visitedNodes.includes(nodeId)) {
      return {
        background: '#22c55e',
        color: 'white',
        border: '2px solid #16a34a',
        borderRadius: '50%',
        width: 50,
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    }
    return {
      background: '#1f2937',
      color: 'white',
      border: '2px solid #3b82f6',
      borderRadius: '50%',
      width: 50,
      height: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold'
    }
  }

  const styledNodes = nodes.map(node => ({
    ...node,
    style: getNodeStyle(node.id)
  }))

  return (
    <div className="px-8 py-6">
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="text-xs text-gray-400 block mb-2">Tree values (level order)</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isRunning}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-2">Traversal</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={isRunning}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none"
          >
            <option value="bfs">BFS (Level Order)</option>
            <option value="dfs">DFS (Pre-order)</option>
          </select>
        </div>

        <button
          onClick={buildTree}
          disabled={isRunning}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Build Tree
        </button>

        <button
          onClick={handleTraverse}
          disabled={isRunning || nodes.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
        >
          ▶ Traverse
        </button>
      </div>

      {traversalOrder.length > 0 && (
        <div className="mb-4 text-sm text-gray-400">
          Traversal order: <span className="text-white font-mono">
            {traversalOrder.map(i => input.trim().split(' ')[i]).join(' → ')}
          </span>
        </div>
      )}

      <div style={{ height: '500px' }} className="bg-gray-900 rounded-xl border border-gray-800">
        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Enter values and click "Build Tree"</p>
          </div>
        ) : (
          <ReactFlow
            nodes={styledNodes}
            edges={edges}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
          >
            <Background color="#374151" gap={16} />
            <Controls />
          </ReactFlow>
        )}
      </div>

      <div className="flex gap-6 mt-4">
        {[
          { color: 'bg-blue-600', label: 'Unvisited' },
          { color: 'bg-yellow-500', label: 'Current' },
          { color: 'bg-green-500', label: 'Visited' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}