import React from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const UploadPage = () => {
  const { id } = useParams();

  const uploadFile = async (type, fileList) => {
    const formData = new FormData();
    formData.append("notebook_id", id);
    if (type === "answers") {
      for (let f of fileList) formData.append("files", f);
    } else formData.append("file", fileList[0]);

    await axios.post(`http://localhost:8000/upload/${type}`, formData);
    alert(`${type} uploaded successfully`);
  };

  const handleEvaluate = async () => {
    await axios.post(`http://localhost:8000/evaluate/${id}`);
    alert("Evaluation complete ✅");
  };

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
    uploadInput: { display: "none" },
    button: {
      backgroundColor: "#4f46e5",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "10px 16px",
      cursor: "pointer",
      marginTop: "10px",
    },
  };

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
        <button style={styles.button} onClick={handleEvaluate}>
          Evaluate
        </button>
      </div>
    </div>
  );
};

export default UploadPage;