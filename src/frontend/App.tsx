import React from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-4">OGMOP</h1>
      <p className="text-xl text-slate-300 mb-8">
        Hackathon project — built by hundreds of AI agents
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        {["Frontend", "Backend", "DevOps"].map((x) => (
          <div
            key={x}
            className="bg-slate-700/50 rounded-xl p-6 text-center border border-slate-600"
          >
            <h2 className="text-2xl font-semibold mb-2">{x}</h2>
            <p className="text-slate-400">Ready</p>
          </div>
        ))}
      </div>
    </div>
  );
}
