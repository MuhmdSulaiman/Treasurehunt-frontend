import React, { useState } from "react";
import api from "../api";
import "../styles/trail_component.css";
import Navbar from "../navbar";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";

const TrailCreate = () => {
const [form, setForm] = useState({
levelNumber: "",
place: "",
answer: "",
image: null
});

const [message, setMessage] = useState(""); // string message
const [levelData, setLevelData] = useState(null); // backend level object
const [loading, setLoading] = useState(false);
const navigate = useNavigate();

const handleChange = (e) => {
if (e.target.name === "image") {
setForm({ ...form, image: e.target.files[0] });
} else {
setForm({ ...form, [e.target.name]: e.target.value });
}
};

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setMessage("");
setLevelData(null);


try {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("levelNumber", Number(form.levelNumber));
  formData.append("place", form.place.trim());
  formData.append("answer", form.answer.trim());
  if (form.image) formData.append("image", form.image);

  const res = await api.post("/users/trailCreate", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  });

  // Separate string message and returned level object
  setMessage(res.data.message || "Trail created successfully");
  setLevelData(res.data.level || null);

  // Reset form
  setForm({ levelNumber: "", place: "", answer: "", image: null });

  // Optional redirect
  setTimeout(() => {
    navigate("/trailRetrieve");
  }, 1000);

} catch (error) {
  setMessage(error.response?.data?.message || "Error creating trail");
} finally {
  setLoading(false);
}


};

return ( <div className="trail-wrapper"> <Navbar />


  <div className="trail-card">
    <h2>Create Trail Level</h2>

    {message && <p className="trail-message">{message}</p>}

    <form className="trail-form" onSubmit={handleSubmit}>
      <label>Level Number (1–5)</label>
      <input
        type="number"
        name="levelNumber"
        value={form.levelNumber}
        onChange={handleChange}
        min="1"
        max="5"
        required
      />

      <label>question</label>
      <input
        type="text"
        name="place"
        value={form.place}
        onChange={handleChange}
        placeholder="Enter question"
        
      />

      <label>Answer</label>
      <input
        type="text"
        name="answer"
        value={form.answer}
        onChange={handleChange}
        placeholder="Enter answer"
        required
      />

      <label>Upload Image (optional)</label>
      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Add Trail"}
      </button>
    </form>

    {/* Display level data safely */}
    {levelData && (
      <div className="level-preview">
        <h3>Level {levelData.levelNumber} Places</h3>
        {levelData.places.map(p => (
          <div key={p._id} className="place-card">
            <p><strong>Name:</strong> {p.name}</p>
            <p><strong>Answer:</strong> {p.answer}</p>
            {p.image && (
              <img
                src={p.image}
                alt={p.name}
                style={{ maxWidth: "200px", display: "block", marginTop: "5px" }}
              />
            )}
          </div>
        ))}
      </div>
    )}
  </div>
</div>


);
};

export default checkAuth(TrailCreate);
