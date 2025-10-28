import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Poppins font
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#fff",
      fontFamily: "'Poppins', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    header: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "25px 60px",
      boxSizing: "border-box",
    },
    logo: {
      fontSize: "24px",
      fontWeight: "600",
      color: "#111",
    },
    navButtons: {
      display: "flex",
      gap: "15px",
    },
    btn: {
      backgroundColor: "#000",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "10px 28px",
      fontSize: "15px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "all 0.3s",
    },
    btnOutline: {
      backgroundColor: "#fff",
      color: "#000",
      border: "1.5px solid #000",
    },
    main: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "0 20px",
      marginTop: "-40px",
    },
    heading: {
      fontSize: "90px",
      fontWeight: "600",
      color: "#111",
      marginBottom: "10px",
    },
    gradientText: {
      background: "linear-gradient(90deg, #3b82f6, #60a5fa, #22c55e)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    subText: {
      fontSize: "17px",
      color: "#555",
      maxWidth: "650px",
      marginBottom: "40px",
    },
    footer: {
      marginTop: "80px",
      fontSize: "18px",
      fontWeight: "400",
      color: "#111",
    },
  };

  return (
    <div style={styles.container}>
      {/* ---------------- Header ---------------- */}
      <div style={styles.header}>
        <div style={styles.logo}>The GrayMatter</div>
        <div style={styles.navButtons}>
          <button
            style={{ ...styles.btnOutline, ...styles.btn }}
            onClick={() => navigate("/register")}
          >
            Register
          </button>
          <button
            style={styles.btn}
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>

      {/* ---------------- Main Content ---------------- */}
      <div style={styles.main}>
        <h1 style={styles.heading}>
           Align.Analyze.<span style={styles.gradientText}>Access.</span>
        </h1>
        <p style={styles.subText}>
          Your intelligent exam evaluation partner - upload textbooks, question papers, and student answer sheets. Scribify automatically analyzes, evaluates, and 
          generates detailed performance reports using Gemini-powered reasoning.
        </p>
      </div>

      {/* ---------------- Footer ---------------- */}
      
    </div>
  );
};

export default Dashboard;
