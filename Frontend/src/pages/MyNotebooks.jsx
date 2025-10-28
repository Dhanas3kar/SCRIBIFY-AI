import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Base API URL (set in .env as VITE_API_URL=http://localhost:8000)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const MyNotebooks = () => {
  const navigate = useNavigate();
  const [notebooks, setNotebooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [loading, setLoading] = useState(false);

  const teacherId = localStorage.getItem("teacher_id");

  // ✅ Fetch all notebooks
  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        const res = await axios.get(`${API_URL}/notebooks`);
        setNotebooks(res.data);
      } catch (err) {
        console.error("Error fetching notebooks:", err);
        alert("Failed to load notebooks ❌");
      }
    };
    fetchNotebooks();
  }, []);

  // ✅ Create a new notebook
  const handleCreate = async () => {
    if (!newNotebookName.trim()) return alert("Enter notebook name");
    if (!teacherId) return alert("Please log in again");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", newNotebookName);
      formData.append("teacher_id", teacherId);

      const res = await axios.post(`${API_URL}/upload/create_notebook`, formData);
      setShowModal(false);
      navigate(`/upload/${res.data.notebook_id}`);
    } catch (err) {
      console.error("Error creating notebook:", err);
      alert("Error creating notebook ❌");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: "#fff",
      minHeight: "100vh",
      padding: "40px 80px",
      color: "#1f1f1f",
    },
    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "40px",
    },
    logo: { fontSize: "22px", fontWeight: 600 },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
    },
    icon: { width: "28px", height: "28px", cursor: "pointer" },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: 500,
      marginBottom: "25px",
      marginLeft: "140px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "30px",
      marginLeft: "140px",
    },
    card: {
      background: "#f7f8ff",
      borderRadius: "16px",
      padding: "25px 20px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.25s ease",
      border: "1px solid #eceef8",
      width: "280px",
      height: "200px",
    },
    cardHover: {
      transform: "translateY(-4px)",
      boxShadow: "0 6px 10px rgba(0,0,0,0.1)",
    },
    createCard: {
      background: "#fafaff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      color: "#4f46e5",
      fontWeight: 500,
      border: "2px dashed #cfd2fa",
    },
    modalBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0, 0, 0, 0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    modal: {
      background: "#fff",
      padding: "30px 40px",
      borderRadius: "16px",
      width: "350px",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      outline: "none",
      marginTop: "10px",
      fontSize: "14px",
    },
    modalButton: {
      background: "#4f46e5",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "10px 18px",
      marginTop: "15px",
      cursor: "pointer",
      fontWeight: 500,
    },
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.logo}>Scribify AI</div>
        <div style={styles.iconContainer}>
          <img src="/settings.png" alt="settings" style={styles.icon} />
          <img src="/person.png" alt="profile" style={styles.icon} />
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Recent notebooks</h3>

      {/* Cards */}
      <div style={styles.grid}>
        <div
          style={{ ...styles.card, ...styles.createCard }}
          onClick={() => setShowModal(true)}
        >
          <div style={{ fontSize: "34px", marginBottom: "8px" }}>+</div>
          {loading ? "Creating..." : "Create new notebook"}
        </div>

        {notebooks.map((nb) => (
          <div
            key={nb.id}
            style={styles.card}
            onClick={() => navigate(`/upload/${nb.id}`)}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
            onMouseLeave={(e) =>
              Object.assign(e.currentTarget.style, {
                transform: "none",
                boxShadow: "none",
              })
            }
          >
            <img
              src="/notebook-icon.png"
              alt="notebook"
              style={{ width: "50px", marginBottom: "15px" }}
            />
            <h4 style={{ marginBottom: "5px" }}>{nb.name || "Untitled notebook"}</h4>
            <p style={{ fontSize: "13px", color: "#777" }}>
              {new Date(nb.created_at).toLocaleDateString()} • {nb.status}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Create New Notebook</h3>
            <input
              type="text"
              placeholder="Enter notebook name..."
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              style={styles.input}
            />
            <button style={styles.modalButton} onClick={handleCreate}>
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNotebooks;
