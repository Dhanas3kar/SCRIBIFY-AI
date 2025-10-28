import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyNotebooks = () => {
  const navigate = useNavigate();
  
  // State management
  const [notebooks, setNotebooks] = useState([]);
  const [filteredNotebooks, setFilteredNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, name, status
  const [filterStatus, setFilterStatus] = useState("all"); // all, idle, processing, completed
  const [creatingNotebook, setCreatingNotebook] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Get teacher ID from localStorage or context (fallback to 1 for now)
  const getTeacherId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.teacher_id || user?.id || 1;
    } catch {
      return 1;
    }
  };

  // Fetch notebooks with error handling
  const fetchNotebooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const teacherId = getTeacherId();
      const response = await axios.get(
        `http://localhost:8000/notebooks?teacher_id=${teacherId}`,
        { timeout: 10000 }
      );

      const notebooksData = Array.isArray(response.data) ? response.data : [];
      setNotebooks(notebooksData);
      setFilteredNotebooks(notebooksData);

    } catch (err) {
      console.error("Failed to fetch notebooks:", err);
      
      let errorMessage = "Failed to load notebooks. ";
      if (err.response) {
        errorMessage += err.response.data?.detail || "Server error.";
      } else if (err.request) {
        errorMessage += "No response from server. Check your connection.";
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      setNotebooks([]);
      setFilteredNotebooks([]);

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);

  // Search and filter effect
  useEffect(() => {
    let filtered = [...notebooks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(nb => 
        (nb.name || "Untitled").toLowerCase().includes(query) ||
        (nb.id?.toString() || "").includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(nb => nb.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "Untitled").localeCompare(b.name || "Untitled");
        case "status":
          return (a.status || "idle").localeCompare(b.status || "idle");
        case "recent":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredNotebooks(filtered);
  }, [notebooks, searchQuery, sortBy, filterStatus]);

  // Create notebook with validation
  const handleCreate = async () => {
    // Custom modal for better UX (can be replaced with a proper modal component)
    const name = prompt("Enter notebook name:\n\n(e.g., 'Class 10 Math - Mid Term 2025')");
    
    if (!name) return;

    // Validate name
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      alert("❌ Notebook name must be at least 3 characters long.");
      return;
    }

    if (trimmedName.length > 100) {
      alert("❌ Notebook name must be less than 100 characters.");
      return;
    }

    // Check for duplicate names
    const isDuplicate = notebooks.some(
      nb => (nb.name || "").toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      const proceed = window.confirm(
        `A notebook named "${trimmedName}" already exists.\n\nCreate anyway?`
      );
      if (!proceed) return;
    }

    setCreatingNotebook(true);

    try {
      const teacherId = getTeacherId();
      const response = await axios.post(
        "http://localhost:8000/upload/create_notebook",
        { name: trimmedName, teacher_id: teacherId },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 
        }
      );

      if (response.data?.notebook_id) {
        // Add to local state immediately for better UX
        const newNotebook = {
          id: response.data.notebook_id,
          name: trimmedName,
          created_at: new Date().toISOString(),
          status: "idle",
          teacher_id: teacherId
        };
        
        setNotebooks(prev => [newNotebook, ...prev]);
        
        // Navigate to upload page
        setTimeout(() => {
          navigate(`/upload/${response.data.notebook_id}`);
        }, 300);
      }

    } catch (err) {
      console.error("Failed to create notebook:", err);
      
      let errorMessage = "Failed to create notebook. ";
      if (err.response) {
        errorMessage += err.response.data?.detail || "Server error.";
      } else if (err.request) {
        errorMessage += "No response from server.";
      } else {
        errorMessage += err.message;
      }
      
      alert(`❌ ${errorMessage}`);

    } finally {
      setCreatingNotebook(false);
    }
  };

  // Delete notebook with confirmation
  const handleDelete = async (notebookId, notebookName, event) => {
    event.stopPropagation(); // Prevent card click

    const confirmed = window.confirm(
      `⚠️ Delete "${notebookName}"?\n\nThis will permanently delete:\n• All uploaded files\n• Generated reports\n• Evaluation data\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(notebookId);

    try {
      await axios.delete(
        `http://localhost:8000/notebooks/${notebookId}`,
        { timeout: 10000 }
      );

      // Remove from local state
      setNotebooks(prev => prev.filter(nb => nb.id !== notebookId));
      
      alert("✅ Notebook deleted successfully");

    } catch (err) {
      console.error("Failed to delete notebook:", err);
      
      let errorMessage = "Failed to delete notebook. ";
      if (err.response?.status === 404) {
        errorMessage = "Notebook not found. It may have been already deleted.";
        // Remove from local state anyway
        setNotebooks(prev => prev.filter(nb => nb.id !== notebookId));
      } else if (err.response) {
        errorMessage += err.response.data?.detail || "Server error.";
      } else {
        errorMessage += "Please try again.";
      }
      
      alert(`❌ ${errorMessage}`);

    } finally {
      setDeletingId(null);
    }
  };

  // Navigate to notebook
  const handleNotebookClick = (notebook) => {
    if (deletingId === notebook.id) return; // Prevent click during delete
    
    // Navigate based on status
    if (notebook.status === "completed") {
      // Option to view reports or continue editing
      const action = window.confirm(
        `"${notebook.name}" evaluation is complete.\n\nOK = View Reports\nCancel = Edit Notebook`
      );
      
      if (action) {
        navigate(`/reports/${notebook.id}`);
      } else {
        navigate(`/upload/${notebook.id}`);
      }
    } else {
      navigate(`/upload/${notebook.id}`);
    }
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return { backgroundColor: "#d1fae5", color: "#065f46", text: "✓ Completed" };
      case "processing":
        return { backgroundColor: "#fef3c7", color: "#92400e", text: "⏳ Processing" };
      case "failed":
        return { backgroundColor: "#fee2e2", color: "#991b1b", text: "✗ Failed" };
      default:
        return { backgroundColor: "#e0e7ff", color: "#3730a3", text: "○ Draft" };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined 
      });
    } catch {
      return "Unknown date";
    }
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
      position: "relative",
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
    button: {
      backgroundColor: "#000",
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    buttonDisabled: {
      backgroundColor: "#9ca3af",
      cursor: "not-allowed",
      opacity: 0.6,
    },
    searchBar: {
      width: "300px",
      padding: "10px 16px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      fontFamily: "'Poppins', sans-serif",
    },
    filterBar: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    select: {
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      fontFamily: "'Poppins', sans-serif",
      cursor: "pointer",
      backgroundColor: "#fff",
    },
    statusBadge: {
      position: "absolute",
      top: "10px",
      right: "10px",
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: "600",
    },
    deleteButton: {
      position: "absolute",
      top: "10px",
      left: "10px",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
      zIndex: 10,
    },
    loadingSpinner: {
      display: "inline-block",
      width: "20px",
      height: "20px",
      border: "3px solid rgba(0,0,0,0.1)",
      borderTop: "3px solid #4f46e5",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#6b7280",
    },
    errorState: {
      textAlign: "center",
      padding: "40px 20px",
      backgroundColor: "#fee2e2",
      borderRadius: "12px",
      color: "#991b1b",
    },
    statsBar: {
      display: "flex",
      gap: "20px",
      padding: "16px 20px",
      backgroundColor: "#f9fafb",
      borderRadius: "12px",
      marginBottom: "20px",
      fontSize: "14px",
    },
    statItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    statLabel: {
      color: "#6b7280",
      fontWeight: "500",
    },
    statValue: {
      color: "#111827",
      fontWeight: "600",
    },
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .notebook-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          }
          .delete-btn:hover {
            background-color: #dc2626 !important;
            color: #fff !important;
            transform: scale(1.1);
          }
          .create-card:hover {
            background-color: #e5e7eb !important;
          }
        `}
      </style>
      
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>My Notebooks</h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              Create and manage your evaluation notebooks
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creatingNotebook}
            style={{
              ...styles.button,
              ...(creatingNotebook ? styles.buttonDisabled : {})
            }}
          >
            {creatingNotebook ? (
              <>
                Creating...
                <span style={{ ...styles.loadingSpinner, marginLeft: "8px", width: "16px", height: "16px", borderWidth: "2px" }}></span>
              </>
            ) : (
              "+ Create New"
            )}
          </button>
        </div>

        {/* Statistics Bar */}
        {!loading && !error && notebooks.length > 0 && (
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total:</span>
              <span style={styles.statValue}>{notebooks.length}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Completed:</span>
              <span style={styles.statValue}>
                {notebooks.filter(nb => nb.status === "completed").length}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Processing:</span>
              <span style={styles.statValue}>
                {notebooks.filter(nb => nb.status === "processing").length}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Drafts:</span>
              <span style={styles.statValue}>
                {notebooks.filter(nb => nb.status === "idle" || !nb.status).length}
              </span>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        {!loading && !error && notebooks.length > 0 && (
          <div style={styles.filterBar}>
            <input
              type="text"
              placeholder="🔍 Search notebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchBar}
            />
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="status">Sort: Status</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Status</option>
              <option value="idle">Drafts</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>

            {(searchQuery || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
                style={{
                  ...styles.button,
                  backgroundColor: "#6b7280",
                  padding: "8px 12px",
                  fontSize: "13px"
                }}
              >
                Clear Filters
              </button>
            )}

            <div style={{ marginLeft: "auto", fontSize: "14px", color: "#6b7280" }}>
              Showing {filteredNotebooks.length} of {notebooks.length}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ ...styles.loadingSpinner, margin: "0 auto 16px", width: "40px", height: "40px" }}></div>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading your notebooks...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={styles.errorState}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <h3 style={{ marginBottom: "8px" }}>Failed to Load Notebooks</h3>
            <p style={{ marginBottom: "20px" }}>{error}</p>
            <button
              onClick={fetchNotebooks}
              style={{
                ...styles.button,
                backgroundColor: "#dc2626"
              }}
            >
               Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && notebooks.length === 0 && (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📚</div>
            <h3 style={{ fontSize: "20px", marginBottom: "8px", color: "#111827" }}>
              No Notebooks Yet
            </h3>
            <p style={{ marginBottom: "24px" }}>
              Create your first notebook to start evaluating answer sheets with AI
            </p>
            <button
              onClick={handleCreate}
              style={{
                ...styles.button,
                backgroundColor: "#4f46e5",
                fontSize: "16px",
                padding: "12px 24px"
              }}
            >
              + Create Your First Notebook
            </button>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && notebooks.length > 0 && filteredNotebooks.length === 0 && (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "#111827" }}>
              No Results Found
            </h3>
            <p style={{ marginBottom: "20px" }}>
              No notebooks match your search criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
              style={{
                ...styles.button,
                backgroundColor: "#6b7280"
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Notebooks Grid */}
        {!loading && !error && filteredNotebooks.length > 0 && (
          <div style={styles.grid}>
            {/* Create New Card */}
            <div 
              className="create-card"
              style={{ ...styles.card, ...styles.createCard }} 
              onClick={handleCreate}
            >
              + Create new notebook
            </div>

            {/* Notebook Cards */}
            {filteredNotebooks.map((nb) => {
              const statusStyle = getStatusStyle(nb.status);
              
              return (
                <div
                  key={nb.id}
                  className="notebook-card"
                  style={styles.card}
                  onClick={() => handleNotebookClick(nb)}
                >
                  {/* Delete Button */}
                  <button
                    className="delete-btn"
                    style={styles.deleteButton}
                    onClick={(e) => handleDelete(nb.id, nb.name || "Untitled", e)}
                    disabled={deletingId === nb.id}
                    title="Delete notebook"
                  >
                    {deletingId === nb.id ? "..." : "×"}
                  </button>

                  {/* Status Badge */}
                  <span style={{ ...styles.statusBadge, backgroundColor: statusStyle.backgroundColor, color: statusStyle.color }}>
                    {statusStyle.text}
                  </span>

                  {/* Icon */}
                  <div style={{ fontSize: "40px", marginBottom: "10px", marginTop: "20px" }}>
                    {nb.status === "completed" ? "✓" : nb.status === "processing" ? "⏳" : "📁"}
                  </div>

                  {/* Notebook Name */}
                  <h4 style={{ 
                    marginBottom: "8px", 
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#111827",
                    wordWrap: "break-word",
                    minHeight: "40px"
                  }}>
                    {nb.name || "Untitled notebook"}
                  </h4>

                  {/* Date */}
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                    {formatDate(nb.created_at)}
                  </p>

                  {/* Additional Info */}
                  {nb.status === "completed" && (
                    <p style={{ fontSize: "12px", color: "#059669", fontWeight: "500" }}>
                      Click to view reports
                    </p>
                  )}
                  {nb.status === "processing" && (
                    <p style={{ fontSize: "12px", color: "#d97706", fontWeight: "500" }}>
                      Evaluation in progress...
                    </p>
                  )}
                  {nb.status === "failed" && (
                    <p style={{ fontSize: "12px", color: "#dc2626", fontWeight: "500" }}>
                      Evaluation failed
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh Button */}
        {!loading && notebooks.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              onClick={fetchNotebooks}
              style={{
                ...styles.button,
                backgroundColor: "#6b7280",
                padding: "8px 16px",
                fontSize: "13px"
              }}
            >
              🔄 Refresh
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MyNotebooks;

