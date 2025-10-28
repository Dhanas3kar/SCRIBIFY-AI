import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const UploadPage = () => {
  const { id } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------
  // Upload handler
  // -------------------------------------------------
  const uploadFile = async (type, fileList) => {
    if (!fileList || fileList.length === 0) return alert("Select a file");

    const formData = new FormData();
    formData.append("notebook_id", id);
    if (type === "answers") {
      for (let f of fileList) formData.append("files", f);
    } else formData.append("file", fileList[0]);

    try {
      setLoading(true);
      await axios.post(`${API_URL}/upload/${type}`, formData);
      alert(`${type} uploaded successfully ✅`);
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${type} ❌`);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // Evaluate notebook
  // -------------------------------------------------
  const handleEvaluate = async () => {
    if (!id) return;
    try {
      setLoading(true);
      await axios.post(`${API_URL}/evaluate/${id}`);
      alert("Evaluation complete ✅");
      await fetchReports();
    } catch (err) {
      console.error(err);
      alert("Evaluation failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // Fetch generated reports
  // -------------------------------------------------
  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_URL}/reports/${id}`);
      setReports(res.data);
    } catch (err) {
      console.warn("No reports yet");
    }
  };

  useEffect(() => {
    fetchReports();
  }, [id]);

  // -------------------------------------------------
  // Styles
  // -------------------------------------------------
  const styles = {
    container: {
      display: "grid",
      gridTemplateColumns: "1fr 2fr 1fr",
      height: "100vh",
      gap: "20px",
      padding: "30px",
      backgroundColor: "#fafafa",
      fontFamily: "'Poppins', sans-serif",
    },
    box: {
      background: "#fff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
    button: {
      backgroundColor: "#4f46e5",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "10px 16px",
      cursor: "pointer",
      marginTop: "10px",
    },
    uploadInput: { display: "none" },
    reportItem: {
      background: "#f3f4f6",
      borderRadius: "8px",
      padding: "8px 12px",
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "8px",
    },
    link: {
      color: "#4f46e5",
      textDecoration: "none",
      fontWeight: "500",
    },
  };

  // -------------------------------------------------
  // Render
  // -------------------------------------------------
  return (
    <div style={styles.container}>
      {/* Left - Question + Answers */}
      <div>
        <div style={styles.box}>
          <h3>Question Paper</h3>
          <label style={styles.button}>
            Upload
            <input
              type="file"
              accept="application/pdf"
              style={styles.uploadInput}
              onChange={(e) => uploadFile("question", e.target.files)}
            />
          </label>
        </div>

        <div style={{ ...styles.box, marginTop: "20px" }}>
          <h3>Student Answers</h3>
          <label style={styles.button}>
            Upload
            <input
              type="file"
              multiple
              accept="application/pdf"
              style={styles.uploadInput}
              onChange={(e) => uploadFile("answers", e.target.files)}
            />
          </label>
        </div>
      </div>

      {/* Center - Source Book */}
      <div style={styles.box}>
        <h3>Source Book</h3>
        <label style={styles.button}>
          Upload
          <input
            type="file"
            accept="application/pdf"
            style={styles.uploadInput}
            onChange={(e) => uploadFile("subject", e.target.files)}
          />
        </label>
      </div>

      {/* Right - Reports */}
      <div style={styles.box}>
        <h3>Reports</h3>
        <button
          style={{ ...styles.button, opacity: loading ? 0.6 : 1 }}
          onClick={handleEvaluate}
          disabled={loading}
        >
          {loading ? "Processing..." : "Evaluate"}
        </button>

        <div style={{ marginTop: "15px", width: "100%" }}>
          {reports.length === 0 && <p>No reports yet 📄</p>}
          {reports.map((r, i) => (
            <div key={i} style={styles.reportItem}>
              <span>{r.student}</span>
              <a href={`${API_URL}${r.url}`} style={styles.link} target="_blank">
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
