"use client";

import { useState } from "react";

const PlusIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const MicrophoneIcon = () => (
  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const WaveformIcon = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="10" width="2" height="4" rx="1" />
    <rect x="8" y="7" width="2" height="10" rx="1" />
    <rect x="12" y="4" width="2" height="16" rx="1" />
    <rect x="16" y="7" width="2" height="10" rx="1" />
    <rect x="20" y="10" width="2" height="4" rx="1" />
  </svg>
);

export default function AIReporting() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Handle the query submission
      console.log("Query submitted:", query);
    }
  };

  return (
    <div className="p-8 min-h-full flex flex-col">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-800">AI Reporting</h1>
      <p className="mt-2 text-gray-600">AI-powered insights and analytics</p>

      {/* Centered Chat Interface */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-16">
        <div className="w-full max-w-2xl text-center">
          {/* Chat Heading */}
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">
            What would you like to know about your data?
          </h2>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 px-4 py-3">
              {/* Plus Icon */}
              <button type="button" className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors">
                <PlusIcon />
              </button>

              {/* Input Field */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about your reports"
                className="flex-1 mx-3 text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none text-base"
              />

              {/* Microphone Icon */}
              <button type="button" className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors mr-2">
                <MicrophoneIcon />
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                className="flex-shrink-0 w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
              >
                <WaveformIcon />
              </button>
            </div>
          </form>

          {/* Suggestion chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              "Show hiring trends this quarter",
              "Compare applicant sources",
              "Time-to-hire analysis",
              "Top performing job postings",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
