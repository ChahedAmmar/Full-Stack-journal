import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import dotenv from 'dotenv';
dotenv.config();

export default function Journal() {
  const [content, setContent] = useState("");
  const [title, settitle] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [aiAdvices, setAiAdvices] = useState({});
  const [loadingAdviceId, setLoadingAdviceId] = useState(null);
  const navigate = useNavigate();

  async function CreatePost(title, content) {
    const mood = "happy";
    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch("http://localhost:8000/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          title,
          content,
          mood,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "creation failed");
      console.log("success");
    } catch (err) {
      console.error("Signup error:", err.message);
    }
  }

  function handleCreation(e) {
    e.preventDefault();
    CreatePost(title, content);
  }
function handleNavigation(){
    navigate('/');
}
  async function getAll() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No userId found in localStorage");
      return;
    }

    const response = await fetch(`http://localhost:8000/api/entries/user/${userId}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to fetch entries");
    }

    const data = await response.json();
    return data;
  }

  async function handleEntries(e) {
    e.preventDefault();
    try {
      const allEntries = await getAll();
      setEntries(allEntries);
      console.log(entries); 
    } catch (error) {
      console.error(error.message);
    }
  }

  async function deleteEntry(entryId) {
    try {
      const response = await fetch(`http://localhost:8000/api/entries/${entryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete entry");
      }

      console.log(`Entry ${entryId} deleted successfully`);
    } catch (error) {
      console.error("Delete error:", error.message);
    }
  }

  async function handleDelete(e, entryId) {
    e.preventDefault();
    await deleteEntry(entryId);
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  }

  async function Details(entryId) {
    const response = await fetch(`http://localhost:8000/api/entries/${entryId}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to fetch entries");
    }

    const data = await response.json();
    return data;
  }

  async function handleDetails(e, entryId) {
    e.preventDefault();
    try {
      const res = await Details(entryId);
      setSelectedEntry(res);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function updateEntry(entryId, updatedData) {
    const response = await fetch(`http://localhost:8000/api/entries/${entryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update entry");
    }

    return data;
  }
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedContent, setUpdatedContent] = useState("");

  async function handleUpdate(entryId) {
    const entry = await Details(entryId);

    try {
      const updated = await updateEntry(entryId, {
        title: updatedTitle || entry.title,
        content: updatedContent || entry.content,
      });
      console.log("Updated:", updated);
    } catch (err) {
      console.error("Error updating entry:", err.message);
    }
  }
  async function getAIMoodAdvice(userContent) {
  const apiKey = process.env.REACT_APP_API_KEY;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const prompt = `
You are a compassionate mental health assistant. A user has just written a journal entry. Read it and provide:
1. A short reflection on what they may be feeling.
2. A gentle piece of advice or emotional support.
3. An optional positive reminder to uplift them.

Here is the journal entry:
"${userContent}"
`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    const data = await response.json();

const contentObj = data?.candidates?.[0]?.content;
if (!contentObj) return 'No response';

const aiReply = contentObj.parts.map(part => part.text).join(' ');

return aiReply;
  } catch (error) {
    console.error('Error fetching AI response:', error.message);
    return 'Could not get advice at this time.';
  }
}
async function handleGetAIAdvice(entryId, content) {
  if (aiAdvices[entryId]) return; 

  setLoadingAdviceId(entryId);
  const advice = await getAIMoodAdvice(content);
  setAiAdvices((prev) => ({ ...prev, [entryId]: advice }));
  setLoadingAdviceId(null);
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 font-sans text-gray-800">
<button
  onClick={handleNavigation}
  className="
    bg-yellow-500 
    hover:bg-yellow-600 
    text-white 
    font-semibold 
    py-2 
    px-6 
    rounded-lg 
    shadow-md 
    transition 
    duration-300 
    ease-in-out
    focus:outline-none 
    focus:ring-2 
    focus:ring-yellow-400
    focus:ring-offset-2
  "
>
  Log OUT
</button>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-yellow-600 text-center">My Bright Journal</h1>

        <form
          onSubmit={handleCreation}
          className="mb-8 space-y-4"
          aria-label="Create journal entry"
        >
          <label className="block">
            <span className="text-yellow-700 font-semibold mb-1 block">Journal Title</span>
            <input
              type="text"
              onChange={(e) => settitle(e.target.value)}
              className="w-full border border-yellow-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your journal title"
              required
            />
          </label>

          <label className="block">
            <span className="text-yellow-700 font-semibold mb-1 block">Today's Thoughts</span>
            <textarea
              placeholder="Vent out about your day..."
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-28 border border-yellow-300 rounded-md px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </label>

          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-md shadow transition"
          >
            Create Entry
          </button>
        </form>

        <div className="mb-8 text-center">
          <button
            onClick={handleEntries}
            className="bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-semibold py-2 px-5 rounded-md shadow transition"
          >
            Load All Entries
          </button>
        </div>

        <ul className="space-y-6">
          {entries.map((entry) => (
  <li
    key={entry.id}
    className="border border-yellow-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-yellow-50"
  >
    <div className="flex justify-between items-start">
      <strong className="text-yellow-700 text-xl">{entry.title}</strong>
      <div className="space-x-2">
        <button
          onClick={(e) => handleDelete(e, entry.id)}
          className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm"
        >
          Delete
        </button>
        <button
          onClick={(e) => handleDetails(e, entry.id)}
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1 rounded-md text-sm"
        >
          See Details
        </button>
      </div>
    </div>

    <div className="mt-3 space-y-2">
      <input
        type="text"
        placeholder="New title"
        onChange={(e) => setUpdatedTitle(e.target.value)}
        className="w-full border border-yellow-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <input
        type="text"
        placeholder="New content"
        onChange={(e) => setUpdatedContent(e.target.value)}
        className="w-full border border-yellow-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <button
        onClick={() => handleUpdate(entry.id)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-4 rounded-md shadow transition"
      >
        Update
      </button>
    </div>

    <div className="mt-4">
      <button
        onClick={() => handleGetAIAdvice(entry.id, entry.content)}
        disabled={loadingAdviceId === entry.id}
        className="bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50 text-yellow-900 px-3 py-1 rounded-md text-sm"
      >
        {loadingAdviceId === entry.id ? "Getting AI Advice..." : "Get AI Advice"}
      </button>

      {aiAdvices[entry.id] && (
        <div className="mt-3 p-3 bg-yellow-100 rounded-md text-yellow-900 whitespace-pre-wrap">
          <strong>AI Advice:</strong>
           <ReactMarkdown>{aiAdvices[entry.id]}</ReactMarkdown>
        </div>
      )}
    </div>
  </li>
))}

        </ul>

        {selectedEntry && (
          <div className="mt-12 p-6 bg-yellow-50 border border-yellow-300 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-3 text-yellow-700">{selectedEntry.title}</h2>
            <p className="mb-3 whitespace-pre-line">{selectedEntry.content}</p>
            <p className="text-yellow-600 font-semibold">Mood: {selectedEntry.mood}</p>
            <p className="text-yellow-500 text-sm mt-1">
              Date: {new Date(selectedEntry.created_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
