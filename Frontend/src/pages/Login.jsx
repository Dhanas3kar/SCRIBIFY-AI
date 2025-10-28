import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import loginImage from "../assets/5625806-removebg-preview.png"; // same image

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Load Google font (Poppins)
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("http://localhost:8000/auth/login", form);
      navigate("/my-notebooks");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Left side image */}
        <div style={styles.imageSection}>
          <img src={loginImage} alt="Login" style={styles.image} />
        </div>

        {/* Right side form */}
        <div style={styles.formSection}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Login to continue your Scribify AI journey 🚀</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Gmail ID"
              value={form.email}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              style={styles.input}
            />

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" style={styles.button}>
              Log In
            </button>
          </form>

          <div style={styles.loginText}>
            Don’t have an account?{" "}
            <Link to="/register" style={styles.link}>
              Create one
            </Link>
          </div>

          {/* Social buttons */}
          <div style={styles.socialContainer}>
            <button style={{ ...styles.socialBtn, color: "#000" }}>𝕏</button>
            <button style={{ ...styles.socialBtn, color: "#DB4437" }}>G</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

// -------------------------
// Inline styles (same as Register)
// -------------------------
const styles = {
  container: {
    backgroundColor: "#f4f5f7",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Poppins', sans-serif",
  },
 card: {
    background: "#fff",
    display: "flex",
    flexDirection: "row",
    width: "1000px",
    maxWidth: "95%",
    borderRadius: "16px",
    boxShadow: "0 4px 25px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  imageSection: {
    width: "50%",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "80%",
    height: "auto",
  },
  formSection: {
    width: "50%",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    color: "#444",
    marginTop: "12px",
  },
  input: {
    width: "90%",
    padding: "10px 14px",
    fontSize: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    marginTop: "5px",
    transition: "border-color 0.3s",
  },
  button: {
    width: "30%",
    marginTop: "20px",
    
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    fontSize: "15px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  error: {
    color: "red",
    fontSize: "13px",
    marginTop: "6px",
  },
  loginText: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "14px",
    color: "#666",
  },
  link: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: "500",
  },
  socialContainer: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },
  socialBtn: {
    width: "40px",
    height: "40px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    background: "white",
    fontSize: "20px",
    transition: "background 0.3s",
  },
};
