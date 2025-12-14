import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/trail_retrieve.css";
import Navbar from "../navbar";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";

const TrailRetrieve = () => {
const [levels, setLevels] = useState([]);
const [message, setMessage] = useState("");
const navigate = useNavigate();

useEffect(() => {
const fetchTrails = async () => {
try {
const token = localStorage.getItem("token");
const res = await axios.get("/users/trail", {
headers: { Authorization: `Bearer ${token}` },
});


    // Use relative /uploads/ path for images
    const levelsWithImages = res.data.levels.map((lvl) => ({
      ...lvl,
      places: lvl.places.map((p) => ({
        ...p,
        image: p.image ? `/uploads/${p.image}` : null,
      })),
    }));

    setLevels(levelsWithImages);
  } catch (err) {
    setMessage(err.response?.data?.message || "Failed to load trail data");
  }
};

fetchTrails();


}, []);

const handleClick = (lvl) => {
if (!lvl?.levelNumber) return;
navigate(`/trailRetrieve/${lvl.levelNumber}`);
};

return ( <div className="trail-retrieve-wrapper"> <Navbar /> <h2 className="title">All Trail Levels</h2>


  {message && <p className="retrieve-error">{message}</p>}

  {levels.length === 0 ? (
    <p className="empty-msg">No trail levels added yet.</p>
  ) : (
    <div className="trail-list">
      {levels.map((lvl) => (
        <div
          className="trail-level-card"
          key={lvl._id}
          onClick={() => handleClick(lvl)}
        >
          <h3>Level {lvl.levelNumber}</h3>

          {lvl.places.length === 0 ? (
            <p className="no-place">No places added.</p>
          ) : (
            <div className="level-preview">
              {lvl.places.map((p) => (
                <div key={p._id} className="place-card">
                  <p><strong>question:</strong> {p.name}</p>
                  <p><strong>Answer:</strong> {p.answer}</p>
                  {p.image && (
                    <img
                      src={p.image}
                      // alt={p.name}
                      style={{ maxWidth: "200px", display: "block", marginTop: "5px" }}
                    />
                  )}
                </div>
                
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>


);
};

export default checkAuth(TrailRetrieve);
