import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import QRScanner from "./QRScanner";
import "../styles/startgame.css";
import "../styles/QRScanner.css";
import { checkAuth } from "../auth/checkAuth";

const StartGame = () => {
const { playerId } = useParams();
const navigate = useNavigate();

const [nextTarget, setNextTarget] = useState(null);
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);
const [scanning, setScanning] = useState(false);
const [error, setError] = useState("");
const [completed, setCompleted] = useState(false);

// -----------------------------
// START GAME
// -----------------------------
const startGame = async () => {
setLoading(true);
setMessage("");
setError("");


try {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    `/player/start-game/${playerId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // Prepend /uploads/ to image filename
  const target = res.data.nextTarget;
  if (target && target.image) {
    target.image = `/uploads/${target.image}`;
  }

  setNextTarget(target || null);
  setMessage(res.data.message || "Game started");
  setCompleted(false);
} catch (err) {
  setError(err.response?.data?.message || "Unable to start game");
} finally {
  setLoading(false);
}


};

// -----------------------------
// HANDLE SCAN FROM QRScanner
// -----------------------------
const handleScan = async (parsed) => {
setScanning(false);
setError("");
setMessage("Verifying...");


if (!parsed?.answer) {
  setError("Invalid QR! Missing answer.");
  setMessage("");
  return;
}

try {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    `/player/verify-qr/${playerId}`,
    { answer: parsed.answer },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setMessage(res.data.message || "Verified successfully");

  let target = res.data.nextTarget;
  if (target && target.image) {
    target.image = `/uploads/${target.image}`;
  }

  if (res.data.nextTarget) {
    setNextTarget(target);
  } else {
    setCompleted(true);
    setNextTarget(null);
  }
} catch (err) {
  setError(err.response?.data?.message || "Verification failed");
  setMessage("");
}


};

return ( <div className="startgame-page"> <div className="topbar">
<button className="back-btn" onClick={() => navigate(-1)}>
← Back </button> <h1 className="page-title">Treasure Hunt</h1> </div>


  <div className="card">
    {/* START SCREEN */}
    {!nextTarget && !completed && (
      <div className="center">
        <p className="lead">Press start to get your first clue.</p>
        <button className="primary" onClick={startGame} disabled={loading}>
          {loading ? "Starting…" : "Start Game"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    )}

    {/* GAME PROGRESS */}
    {nextTarget && !completed && (
      <>
        <div className="clue-section">
          <h2>Level {nextTarget.levelNumber}</h2>
          <p className="clue">{nextTarget.name}</p>
          {nextTarget?.image && (
  <img src={nextTarget?.image ? `${nextTarget.image}` : ""} alt={nextTarget?.name || ""} />

)}
        </div>

        <button className="secondary" onClick={() => setScanning(true)}>
          Scan QR
        </button>

        {scanning && <QRScanner onScan={handleScan} />}

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </>
    )}

    {/* COMPLETED */}
    {completed && (
      <div className="complete-card">
        <h2>🎉 Congratulations!</h2>
        <p>You finished the trail.</p>
        <button className="primary" onClick={() => navigate("/")}>
          Home
        </button>
      </div>
    )}
  </div>
</div>


);
};

export default checkAuth(StartGame);
