import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../auth/checkAuth";
import "../styles/qrGenerate.css"; 

const GenerateQR = () => {
  const navigate = useNavigate();

  const [levelNumber, setLevelNumber] = useState("");
  const [answer, setAnswer] = useState(""); // fixed camelCase
  const [qrCode, setQrCode] = useState(null);
  const [qrContent, setQrContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setQrCode(null);
    setQrContent(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/player/generate-qr",
        { levelNumber, answer }, // send answer, not name
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQrCode(res.data.qrCode);
      setQrContent(res.data.qrContent);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate QR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-qr-page">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="page-title">Generate QR</h1>
      </div>

      <div className="card">
        <form onSubmit={handleGenerate} className="form">
          <label>
            Level Number:
            <input
              type="number"
              min="1"
              max="5"
              value={levelNumber}
              onChange={(e) => setLevelNumber(e.target.value)}
              required
            />
          </label>

          <label>
            Answer:
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
          </label>

          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Generating…" : "Generate QR"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {qrCode && (
          <div className="qr-result">
            <h2>QR Code for {answer}</h2>
            <img src={qrCode} alt={`QR for ${answer}`} />
            <p>QR Content: {JSON.stringify(qrContent)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default checkAuth(GenerateQR);
