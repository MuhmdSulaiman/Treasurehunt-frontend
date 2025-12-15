import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/trailUpdate.css";
import { checkAuth } from "../auth/checkAuth";

const TrailUpdate = () => {
  const { id } = useParams(); // levelNumber
  const [level, setLevel] = useState(null);
  const [editValues, setEditValues] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/users/trail/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const levelWithImages = {
          ...res.data.level,
          places: res.data.level.places.map((p) => ({
            ...p,
            image: p.image ? `/uploads/${p.image}` : null,
            newImage: null,
          })),
        };

        setLevel(levelWithImages);
        setEditValues(levelWithImages.places);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load level data");
      }
    };

    fetchLevel();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingIndex === null) return;

    try {
      const token = localStorage.getItem("token");
      const selected = editValues[editingIndex];

      const formData = new FormData();
      formData.append("index", editingIndex);
      formData.append("place", selected.name);
      formData.append("answer", selected.answer);

      if (selected.newImage) {
        formData.append("image", selected.newImage);
      }

      await api.put(`/users/trail/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/trailRetrieve");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="update-wrapper">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <div className="update-card">
        <h2>Update Level {id}</h2>

        {message && <p className="error">{message}</p>}

        {!level ? (
          <p className="loading">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className="list-title">Click a place to edit</h3>

            <ul className="place-list">
              {editValues.map((place, i) => (
                <li
                  key={i}
                  className={`place-item ${editingIndex === i ? "active" : ""}`}
                  onClick={() => setEditingIndex(i)}
                >
                  {editingIndex === i ? (
                    <div className="edit-section">
                      {/* Place Name */}
                      <label>Place Name</label>
                      <input
                        type="text"
                        value={place.name}
                        onChange={(e) => {
                          const updated = [...editValues];
                          updated[i].name = e.target.value;
                          setEditValues(updated);
                        }}
                        autoFocus
                      />

                      {/* Answer */}
                      <label>Answer</label>
                      <input
                        type="text"
                        value={place.answer}
                        onChange={(e) => {
                          const updated = [...editValues];
                          updated[i].answer = e.target.value;
                          setEditValues(updated);
                        }}
                      />

                      {/* Existing Image Preview */}
                      {place.image && (
                        <img
                          src={place.image}
                          alt="preview"
                          className="preview-img"
                        />
                      )}

                      {/* Upload New Image */}
                      <label>Update Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const updated = [...editValues];
                          updated[i].newImage = e.target.files[0];
                          setEditValues(updated);
                        }}
                      />
                    </div>
                  ) : (
                    <span>
                      <strong>{place.name}</strong>
                      {place.image && (
                        <img
                          src={place.image}
                          alt={place.name}
                          className="preview-img"
                        />
                      )}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {editingIndex !== null && (
              <button type="submit" className="update-btn">
                Save Changes
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default checkAuth(TrailUpdate);
