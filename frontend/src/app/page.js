export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">AlgoFlow</h1>
        <div className="flex gap-4">
          <button className="text-gray-400 hover:text-white transition">Login</button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24">
        <h2 className="text-5xl font-bold mb-4">
          Stop getting stuck on DSA
        </h2>
        <p className="text-gray-400 text-xl max-w-xl mb-8">
          Practice smarter. Battle friends. Get AI-powered hints. 
          Know exactly when you are placement ready.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg transition">
          Start Practicing Free
        </button>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-24 max-w-5xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Algorithm Visualizer</h3>
          <p className="text-gray-400 text-sm">
            See your code executing step by step. Animated on your actual input.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Battle Mode</h3>
          <p className="text-gray-400 text-sm">
            Challenge friends in real time. Race to solve. See their code live.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">AI Interview Simulator</h3>
          <p className="text-gray-400 text-sm">
            Practice with an AI interviewer. Get scored on approach and communication.
          </p>
        </div>
      </section>

    </main>
  )
}