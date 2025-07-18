import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../index.css';

export default function Auth() {
  const navigate = useNavigate();
  const usernameRef = useRef();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleAuthRequest = async (type) => {
    setFeedback(null);

    if (!username.trim() || !password.trim()) {
      setFeedback({ type: "error", message: "Username and password are required." });
      return;
    }

    if (password.length < 4) {
      setFeedback({ type: "error", message: "Password must be at least 4 characters." });
      return;
    }

    setLoading(true);
    try {
      const endpoint = `http://localhost:8000/api/users/${type}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || `${type} failed`);

      if (type === "signup") {
        setFeedback({ type: "success", message: "Signup successful! You can now log in." });
        setPassword("");
      } else {
        localStorage.setItem("userId", data.userId);
        setFeedback({ type: "success", message: "Login successful! Redirecting..." });
        setTimeout(() => navigate("/Journal"), 1000);
      }

      setUsername("");
      setPassword("");
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-300 p-6">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-white rounded-xl shadow-xl p-10 w-full max-w-md border border-yellow-200"
      >
        <h2 className="text-3xl font-bold text-yellow-700 mb-6 text-center"> Welcome !</h2>

        <label className="block mb-5">
          <span className="text-yellow-700 font-semibold">Username</span>
          <input
            ref={usernameRef}
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full border border-yellow-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            disabled={loading}
          />
        </label>

        <label className="block mb-6">
          <span className="text-yellow-700 font-semibold">Password</span>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-yellow-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            disabled={loading}
          />
        </label>

        {feedback && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              feedback.type === "error"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="flex gap-4 justify-between">
          <button
            onClick={() => handleAuthRequest("signup")}
            disabled={loading}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 rounded-lg shadow transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
          <button
            onClick={() => handleAuthRequest("login")}
            disabled={loading}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-lg shadow transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Log In"}
          </button>
        </div>
      </form>
    </div>
  );
}
