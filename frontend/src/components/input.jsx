import { useState } from "react";
import axios from "axios";

export default function Input({ storeData, onResponse }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    try {
      // Send both user input and storeData as JSON
      const res = await axios.post("https://quickspace.austin.kim/prompt_remove_points", {
          prompt: value,
          data: storeData
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      // Extract the array of IDs from response and pass to parent
      if (onResponse && res.data && res.data.data) {
        onResponse(res.data.data); // This should be the array of IDs like [33044057, 11658004, ...]
      }
    } catch (err) {
      console.error("API error:", err);
    }
    setLoading(false);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-4 left-0 w-full flex justify-center z-50"
    >
      <div className="flex items-center bg-white rounded-3xl shadow-md px-4 py-2 max-w-lg w-full">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-transparent border-none outline-none text-black text-base py-2"
          disabled={loading}
        />
        {loading ? (
          <span className="mx-auto text-gray-400 text-lg font-bold">. . .</span>
        ) : (
          <button
            type="submit"
            className="text-gray-400 hover:text-black mr-2 text-2xl bg-transparent border-none outline-none cursor-pointer transition-colors"
            disabled={loading}
            aria-label="Send"
          >
            →
          </button>
        )}
      </div>
    </form>
  );
}