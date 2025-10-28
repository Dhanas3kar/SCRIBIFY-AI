import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyNotebooks = () => {
  const navigate = useNavigate();
  const [notebooks, setNotebooks] = useState([]);

  useEffect(() => {
    const fetchNotebooks = async () => {
      const res = await axios.get("http://localhost:8000/notebooks");
      setNotebooks(res.data);
    };
    fetchNotebooks();
  }, []);

  const handleCreate = async () => {
    const name = prompt("Enter notebook name:");
    if (!name) return;
    const res = await axios.post("http://localhost:8000/upload/create_notebook", {
      name,
      teacher_id: 1, // replace with logged-in teacher ID
    });
    navigate(`/upload/${res.data.notebook_id}`);
  };

  const styles = {
    container: {
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: "#fff",
      minHeight: "100vh",
      padding: "40px 60px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    title: {
      fontSize: "22px",
      fontWeight: "600",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "20px",
    },
    card: {
      background: "#f9f9ff",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.2s",
      border: "1px solid #e3e3e3",
    },
    createCard: {
      background: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      color: "#4f46e5",
      fontWeight: "500",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Notebooks</h2>
        <button
          onClick={handleCreate}
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          + Create New
        </button>
      </div>

      <div style={styles.grid}>
        <div style={{ ...styles.card, ...styles.createCard }} onClick={handleCreate}>
          + Create new notebook
        </div>

        {notebooks.map((nb) => (
          <div
            key={nb.id}
            style={styles.card}
            onClick={() => navigate(`/upload/${nb.id}`)}
          >
            <img
              src="/folder-icon.png"
              alt="notebook"
              style={{ width: "40px", marginBottom: "10px" }}
            />
            <h4>{nb.name || "Untitled notebook"}</h4>
            <p style={{ fontSize: "13px", color: "#777" }}>
              {new Date(nb.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyNotebooks;

