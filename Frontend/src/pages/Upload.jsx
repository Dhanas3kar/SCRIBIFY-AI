import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const UploadPage = () => {
  const { id } = useParams();
<<<<<<< HEAD
  const navigate = useNavigate();

  // State management
  const [uploadedFiles, setUploadedFiles] = useState({
    question: null,
    subject: null,
    answers: []
  });
  const [uploadProgress, setUploadProgress] = useState({
    question: 0,
    subject: 0,
    answers: 0
  });
  const [loading, setLoading] = useState({
    question: false,
    subject: false,
    answers: false,
    evaluate: false
  });
  const [errors, setErrors] = useState({});
  const [evaluationStatus, setEvaluationStatus] = useState(null);
  const [quotaInfo, setQuotaInfo] = useState(null);

  // Validation constants
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_ANSWER_FILES = 100; // Maximum answer sheets per batch
  const ALLOWED_TYPES = ['application/pdf'];

  // Load existing uploads on mount
  useEffect(() => {
    loadNotebookStatus();
  }, [id]);

  const loadNotebookStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/notebooks/${id}`);
      if (response.data) {
        setUploadedFiles({
          question: response.data.question_paper ? { name: "Uploaded" } : null,
          subject: response.data.subject_book ? { name: "Uploaded" } : null,
          answers: response.data.answers || []
        });
        setEvaluationStatus(response.data.status);
      }
    } catch (error) {
      console.error("Failed to load notebook status:", error);
    }
  };

  // File validation
  const validateFile = (file, type) => {
    const errors = [];

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`Invalid file type. Only PDF files are allowed.`);
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`);
    }

    // Check file name
    if (!/^[\w\-. ]+$/.test(file.name)) {
      errors.push(`Invalid file name. Use only letters, numbers, spaces, dots, hyphens.`);
    }

    return errors;
  };

  const validateAnswerBatch = (fileList) => {
    if (fileList.length === 0) {
      return ["No files selected."];
    }

    if (fileList.length > MAX_ANSWER_FILES) {
      return [`Maximum ${MAX_ANSWER_FILES} answer sheets allowed per batch.`];
    }

    const errors = [];
    for (let file of fileList) {
      const fileErrors = validateFile(file, 'answers');
      if (fileErrors.length > 0) {
        errors.push(`${file.name}: ${fileErrors.join(', ')}`);
      }
    }

    return errors;
  };
=======
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
>>>>>>> aa8d4836cdb9760d7ff5f8259677b8f95d7727fc

  // -------------------------------------------------
  // Upload handler
  // -------------------------------------------------
  const uploadFile = async (type, fileList) => {
<<<<<<< HEAD
    // Clear previous errors
    setErrors(prev => ({ ...prev, [type]: null }));

    // Validate files
    let validationErrors = [];
    if (type === "answers") {
      validationErrors = validateAnswerBatch(fileList);
    } else {
      validationErrors = validateFile(fileList[0], type);
    }

    if (validationErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        [type]: validationErrors.join('\n')
      }));
      return;
    }

    // Set loading state
    setLoading(prev => ({ ...prev, [type]: true }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));

    try {
      const formData = new FormData();
      formData.append("notebook_id", id);

      if (type === "answers") {
        for (let f of fileList) {
          formData.append("files", f);
        }
      } else {
        formData.append("file", fileList[0]);
      }

      // Upload with progress tracking
      const response = await axios.post(
        `http://localhost:8000/upload/${type}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(prev => ({ ...prev, [type]: percentCompleted }));
          },
          timeout: 300000 // 5 minute timeout
        }
      );

      // Update uploaded files state
      if (type === "answers") {
        setUploadedFiles(prev => ({
          ...prev,
          answers: [...prev.answers, ...Array.from(fileList)]
        }));
      } else {
        setUploadedFiles(prev => ({
          ...prev,
          [type]: fileList[0]
        }));
      }

      // Show success message
      showNotification(
        `✅ ${type === 'answers' ? fileList.length + ' answer sheet(s)' : capitalizeFirst(type)} uploaded successfully`,
        'success'
      );

    } catch (error) {
      console.error(`Upload error (${type}):`, error);
      
      let errorMessage = 'Upload failed. ';
      if (error.response) {
        // Server responded with error
        errorMessage += error.response.data.detail || error.response.data.message || 'Server error.';
      } else if (error.request) {
        // Request made but no response
        errorMessage += 'No response from server. Check your connection.';
      } else {
        // Request setup error
        errorMessage += error.message;
      }

      setErrors(prev => ({ ...prev, [type]: errorMessage }));
      showNotification(errorMessage, 'error');

    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
=======
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
>>>>>>> aa8d4836cdb9760d7ff5f8259677b8f95d7727fc
    }
  };

  // -------------------------------------------------
  // Evaluate notebook
  // -------------------------------------------------
  const handleEvaluate = async () => {
<<<<<<< HEAD
    // Validation before evaluation
    if (!uploadedFiles.question) {
      showNotification('❌ Please upload question paper first', 'error');
      return;
    }
    if (!uploadedFiles.subject) {
      showNotification('❌ Please upload subject/source book first', 'error');
      return;
    }
    if (uploadedFiles.answers.length === 0) {
      showNotification('❌ Please upload at least one answer sheet', 'error');
      return;
    }

    // Confirm evaluation
    const confirmed = window.confirm(
      `Ready to evaluate ${uploadedFiles.answers.length} answer sheet(s)?\n\nThis will process all uploaded files and generate reports.`
    );

    if (!confirmed) return;

    setLoading(prev => ({ ...prev, evaluate: true }));
    setEvaluationStatus('processing');
    setErrors(prev => ({ ...prev, evaluate: null }));

    try {
      const response = await axios.post(
        `http://localhost:8000/evaluate/${id}`,
        {},
        { timeout: 600000 } // 10 minute timeout for evaluation
      );

      setEvaluationStatus('completed');
      
      // Show success with details
      const message = response.data.sheets_processed 
        ? `✅ Evaluation complete!\n\n📊 Processed: ${response.data.sheets_processed} sheets\n⏱️ Time: ${response.data.processing_time}s\n💰 Cost: ₹${response.data.cost_incurred?.toFixed(2) || 0}\n📋 Remaining: ${response.data.sheets_remaining || 'N/A'}`
        : '✅ Evaluation complete!';

      showNotification(message, 'success');

      // Store quota info if available
      if (response.data.sheets_remaining !== undefined) {
        setQuotaInfo({
          used: response.data.sheets_processed,
          remaining: response.data.sheets_remaining,
          cost: response.data.cost_incurred
        });
      }

      // Navigate to reports after 2 seconds
      setTimeout(() => {
        navigate(`/reports/${id}`);
      }, 2000);

    } catch (error) {
      console.error("Evaluation error:", error);
      setEvaluationStatus('failed');
      
      let errorMessage = 'Evaluation failed. ';
      
      if (error.response?.status === 402) {
        // Payment/quota error
        errorMessage = '❌ Quota Exceeded\n\n' + (error.response.data.message || 'Insufficient quota. Please upgrade your plan.');
        
        if (error.response.data.details) {
          const details = error.response.data.details;
          errorMessage += `\n\nYou need: ${details.overage_count} more sheets\nCost: ₹${details.overage_cost}\n\nSuggestion: ${details.upgrade_suggestion?.suggested_plan || 'Upgrade your plan'}`;
        }
      } else if (error.response) {
        errorMessage += error.response.data.detail || error.response.data.message || 'Server error.';
      } else if (error.request) {
        errorMessage += 'No response from server. The evaluation may be taking longer than expected.';
      } else {
        errorMessage += error.message;
      }

      setErrors(prev => ({ ...prev, evaluate: errorMessage }));
      showNotification(errorMessage, 'error');

    } finally {
      setLoading(prev => ({ ...prev, evaluate: false }));
    }
  };

  // Utility functions
  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const showNotification = (message, type) => {
    // Enhanced alert with better formatting
    if (type === 'success') {
      alert(message);
    } else {
      alert(message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const canEvaluate = () => {
    return uploadedFiles.question && 
           uploadedFiles.subject && 
           uploadedFiles.answers.length > 0 &&
           evaluationStatus !== 'processing';
=======
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
>>>>>>> aa8d4836cdb9760d7ff5f8259677b8f95d7727fc
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
      position: "relative",
    },
    button: {
      backgroundColor: "#4f46e5",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "10px 16px",
      cursor: "pointer",
      marginTop: "10px",
      transition: "all 0.2s",
      fontWeight: "500",
      fontSize: "14px",
    },
    buttonDisabled: {
      backgroundColor: "#9ca3af",
      cursor: "not-allowed",
      opacity: 0.6,
    },
    buttonSuccess: {
      backgroundColor: "#10b981",
    },
    buttonDanger: {
      backgroundColor: "#ef4444",
    },
    statusBadge: {
      position: "absolute",
      top: "10px",
      right: "10px",
      padding: "4px 12px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
    },
    statusSuccess: {
      backgroundColor: "#d1fae5",
      color: "#065f46",
    },
    statusProcessing: {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    },
    statusError: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    },
    progressBar: {
      width: "100%",
      height: "4px",
      backgroundColor: "#e5e7eb",
      borderRadius: "2px",
      marginTop: "12px",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#4f46e5",
      transition: "width 0.3s",
    },
    fileInfo: {
      marginTop: "12px",
      fontSize: "12px",
      color: "#6b7280",
      maxWidth: "200px",
      wordWrap: "break-word",
    },
    errorMessage: {
      marginTop: "12px",
      padding: "8px 12px",
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      borderRadius: "6px",
      fontSize: "12px",
      maxWidth: "100%",
      whiteSpace: "pre-wrap",
      textAlign: "left",
    },
    successMessage: {
      marginTop: "12px",
      padding: "8px 12px",
      backgroundColor: "#d1fae5",
      color: "#065f46",
      borderRadius: "6px",
      fontSize: "12px",
    },
    spinner: {
      display: "inline-block",
      width: "16px",
      height: "16px",
      border: "2px solid rgba(255,255,255,0.3)",
      borderTop: "2px solid #fff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      marginLeft: "8px",
    },
    quotaInfo: {
      marginTop: "16px",
      padding: "12px",
      backgroundColor: "#eff6ff",
      borderRadius: "8px",
      fontSize: "13px",
      color: "#1e40af",
      textAlign: "left",
    },
    infoIcon: {
      display: "inline-block",
      width: "14px",
      height: "14px",
      borderRadius: "50%",
      backgroundColor: "#60a5fa",
      color: "#fff",
      fontSize: "10px",
      lineHeight: "14px",
      marginRight: "6px",
      fontWeight: "bold",
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
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.container}>
        {/* Left - Question + Answers */}
        <div>
          {/* Question Paper Section */}
          <div style={styles.box}>
            {uploadedFiles.question && (
              <span style={{ ...styles.statusBadge, ...styles.statusSuccess }}>
                ✓ Uploaded
              </span>
            )}
            <h3 style={{ marginBottom: "8px" }}>Question Paper</h3>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>
              Upload the exam question paper (PDF only, max 50MB)
            </p>
            
            <label 
              style={{
                ...styles.button,
                ...(loading.question ? styles.buttonDisabled : {}),
                ...(uploadedFiles.question ? styles.buttonSuccess : {})
              }}
            >
              {loading.question ? (
                <>
                  Uploading...
                  <span style={styles.spinner}></span>
                </>
              ) : uploadedFiles.question ? (
                "✓ Uploaded - Replace?"
              ) : (
                "📄 Upload Question Paper"
              )}
              <input
                type="file"
                accept="application/pdf"
                style={styles.uploadInput}
                onChange={(e) => uploadFile("question", e.target.files)}
                disabled={loading.question}
              />
            </label>

            {loading.question && uploadProgress.question > 0 && (
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${uploadProgress.question}%`
                  }}
                ></div>
              </div>
            )}

            {uploadedFiles.question && !errors.question && (
              <div style={styles.fileInfo}>
                ✓ {uploadedFiles.question.name}
                {uploadedFiles.question.size && (
                  <div>{formatFileSize(uploadedFiles.question.size)}</div>
                )}
              </div>
            )}

            {errors.question && (
              <div style={styles.errorMessage}>
                ⚠️ {errors.question}
              </div>
            )}
          </div>

          {/* Answer Sheets Section */}
          <div style={{ ...styles.box, marginTop: "20px" }}>
            {uploadedFiles.answers.length > 0 && (
              <span style={{ ...styles.statusBadge, ...styles.statusSuccess }}>
                {uploadedFiles.answers.length} file(s)
              </span>
            )}
            <h3 style={{ marginBottom: "8px" }}>Student Answers</h3>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>
              Upload student answer sheets (PDF only, max {MAX_ANSWER_FILES} files)
            </p>
            
            <label 
              style={{
                ...styles.button,
                ...(loading.answers ? styles.buttonDisabled : {})
              }}
            >
              {loading.answers ? (
                <>
                  Uploading...
                  <span style={styles.spinner}></span>
                </>
              ) : (
                `📝 Upload Answer Sheets`
              )}
              <input
                type="file"
                multiple
                accept="application/pdf"
                style={styles.uploadInput}
                onChange={(e) => uploadFile("answers", e.target.files)}
                disabled={loading.answers}
              />
            </label>

            {loading.answers && uploadProgress.answers > 0 && (
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${uploadProgress.answers}%`
                  }}
                ></div>
              </div>
            )}

            {uploadedFiles.answers.length > 0 && !errors.answers && (
              <div style={styles.successMessage}>
                ✓ {uploadedFiles.answers.length} answer sheet(s) uploaded
              </div>
            )}

            {errors.answers && (
              <div style={styles.errorMessage}>
                ⚠️ {errors.answers}
              </div>
            )}
          </div>
        </div>

        {/* Center - Source Book */}
        <div style={styles.box}>
          {uploadedFiles.subject && (
            <span style={{ ...styles.statusBadge, ...styles.statusSuccess }}>
              ✓ Uploaded
            </span>
          )}
          <h3 style={{ marginBottom: "8px" }}>Source Book / Reference Material</h3>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>
            Upload the subject textbook or reference material for evaluation context (PDF only, max 50MB)
          </p>
          
          <label 
            style={{
              ...styles.button,
              ...(loading.subject ? styles.buttonDisabled : {}),
              ...(uploadedFiles.subject ? styles.buttonSuccess : {})
            }}
          >
            {loading.subject ? (
              <>
                Uploading...
                <span style={styles.spinner}></span>
              </>
            ) : uploadedFiles.subject ? (
              "✓ Uploaded - Replace?"
            ) : (
              "📚 Upload Source Book"
            )}
            <input
              type="file"
              accept="application/pdf"
              style={styles.uploadInput}
              onChange={(e) => uploadFile("subject", e.target.files)}
              disabled={loading.subject}
            />
          </label>

          {loading.subject && uploadProgress.subject > 0 && (
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${uploadProgress.subject}%`
                }}
              ></div>
            </div>
          )}

          {uploadedFiles.subject && !errors.subject && (
            <div style={styles.fileInfo}>
              ✓ {uploadedFiles.subject.name}
              {uploadedFiles.subject.size && (
                <div>{formatFileSize(uploadedFiles.subject.size)}</div>
              )}
            </div>
          )}

          {errors.subject && (
            <div style={styles.errorMessage}>
              ⚠️ {errors.subject}
            </div>
          )}

          <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px", fontSize: "13px", color: "#374151", textAlign: "left" }}>
            <div style={{ fontWeight: "600", marginBottom: "8px" }}>💡 Tips for best results:</div>
            <ul style={{ margin: "0", paddingLeft: "20px", lineHeight: "1.6" }}>
              <li>Ensure PDFs are clear and readable</li>
              <li>Scan at 300 DPI or higher</li>
              <li>Avoid shadows and distortions</li>
              <li>Keep file sizes under 50MB</li>
            </ul>
          </div>
        </div>

        {/* Right - Reports */}
        <div style={styles.box}>
          {evaluationStatus === 'completed' && (
            <span style={{ ...styles.statusBadge, ...styles.statusSuccess }}>
              ✓ Complete
            </span>
          )}
          {evaluationStatus === 'processing' && (
            <span style={{ ...styles.statusBadge, ...styles.statusProcessing }}>
              ⏳ Processing
            </span>
          )}
          {evaluationStatus === 'failed' && (
            <span style={{ ...styles.statusBadge, ...styles.statusError }}>
              ✗ Failed
            </span>
          )}

          <h3 style={{ marginBottom: "8px" }}>Evaluate & Generate Reports</h3>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>
            Process all uploaded files and generate detailed evaluation reports
          </p>

          {/* Prerequisites checklist */}
          <div style={{ width: "100%", textAlign: "left", marginBottom: "16px", fontSize: "13px" }}>
            <div style={{ marginBottom: "6px", color: uploadedFiles.question ? "#10b981" : "#6b7280" }}>
              {uploadedFiles.question ? "✓" : "○"} Question Paper
            </div>
            <div style={{ marginBottom: "6px", color: uploadedFiles.subject ? "#10b981" : "#6b7280" }}>
              {uploadedFiles.subject ? "✓" : "○"} Source Book
            </div>
            <div style={{ marginBottom: "6px", color: uploadedFiles.answers.length > 0 ? "#10b981" : "#6b7280" }}>
              {uploadedFiles.answers.length > 0 ? "✓" : "○"} Answer Sheets ({uploadedFiles.answers.length})
            </div>
          </div>

          <button 
            style={{
              ...styles.button,
              ...(loading.evaluate || !canEvaluate() ? styles.buttonDisabled : {}),
              ...(evaluationStatus === 'completed' ? styles.buttonSuccess : {})
            }}
            onClick={handleEvaluate}
            disabled={loading.evaluate || !canEvaluate()}
          >
            {loading.evaluate ? (
              <>
                Evaluating...
                <span style={styles.spinner}></span>
              </>
            ) : evaluationStatus === 'completed' ? (
              "✓ Evaluation Complete"
            ) : (
              "🚀 Start Evaluation"
            )}
          </button>

          {errors.evaluate && (
            <div style={styles.errorMessage}>
              {errors.evaluate}
            </div>
          )}

          {quotaInfo && (
            <div style={styles.quotaInfo}>
              <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                <span style={styles.infoIcon}>i</span>
                Usage Summary
              </div>
              <div>Sheets Processed: {quotaInfo.used}</div>
              <div>Sheets Remaining: {quotaInfo.remaining === -1 ? 'Unlimited' : quotaInfo.remaining}</div>
              <div>Cost: ₹{quotaInfo.cost?.toFixed(2) || 0}</div>
            </div>
          )}

          {evaluationStatus === 'completed' && (
            <button 
              style={{
                ...styles.button,
                marginTop: "12px",
                backgroundColor: "#10b981"
              }}
              onClick={() => navigate(`/reports/${id}`)}
            >
              📊 View Reports
            </button>
          )}

          <div style={{ marginTop: "24px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px", fontSize: "12px", color: "#6b7280" }}>
            <div style={{ fontWeight: "600", marginBottom: "6px" }}>⏱️ Processing Time</div>
            <div>~3 seconds per answer sheet</div>
            <div style={{ marginTop: "8px" }}>Estimated: {Math.ceil(uploadedFiles.answers.length * 3 / 60)} minutes</div>
          </div>
        </div>
      </div>
<<<<<<< HEAD
    </>
=======

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
>>>>>>> aa8d4836cdb9760d7ff5f8259677b8f95d7727fc
  );
};

export default UploadPage;
