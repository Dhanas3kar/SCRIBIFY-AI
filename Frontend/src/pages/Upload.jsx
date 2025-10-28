<<<<<<< HEAD
import React, { useState, useRef } from 'react';
import {
  Upload as UploadIcon,
  FileText,
  X,
  CheckCircle,
  Plus,
  Book,
  Users,
  FileCheck,
  Sparkles,
  Cloud,
  Loader2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

const Upload = () => {
  // State for three separate upload zones
  const [questionPaper, setQuestionPaper] = useState(null);
  const [answerScripts, setAnswerScripts] = useState([]);
  const [sourceDocument, setSourceDocument] = useState(null);
  
  const [draggingZone, setDraggingZone] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  
  const questionPaperRef = useRef(null);
  const answerScriptsRef = useRef(null);
  const sourceDocumentRef = useRef(null);

  // Handlers for drag and drop by zone
  const handleDragOver = (e, zone) => {
    e.preventDefault();
    setDraggingZone(zone);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggingZone(null);
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    setDraggingZone(null);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files, zone);
  };

  const handleFileSelect = (e, zone) => {
    const files = Array.from(e.target.files);
    handleFiles(files, zone);
  };

  const handleFiles = (files, zone) => {
    const validFiles = files.filter(f => f.type === 'application/pdf');
    
    if (zone === 'question') {
      if (validFiles.length > 0) {
        setQuestionPaper({
          id: Math.random().toString(36),
          file: validFiles[0],
          name: validFiles[0].name,
          size: validFiles[0].size
        });
      }
    } else if (zone === 'answer') {
      const newAnswers = validFiles.map(file => ({
        id: Math.random().toString(36),
        file,
        name: file.name,
        size: file.size
      }));
      setAnswerScripts(prev => [...prev, ...newAnswers]);
    } else if (zone === 'source') {
      if (validFiles.length > 0) {
        setSourceDocument({
          id: Math.random().toString(36),
          file: validFiles[0],
          name: validFiles[0].name,
          size: validFiles[0].size
        });
      }
    }
  };

  const removeFile = (zone, id = null) => {
    if (zone === 'question') {
      setQuestionPaper(null);
    } else if (zone === 'answer' && id) {
      setAnswerScripts(prev => prev.filter(f => f.id !== id));
    } else if (zone === 'source') {
      setSourceDocument(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const startProcessing = () => {
    if (!questionPaper || answerScripts.length === 0 || !sourceDocument) {
      return;
    }
    
    setIsProcessing(true);
    setUploadProgress(0);
    setCurrentStep(1);
    setCompletedTasks([]);

    const tasks = [
      'Uploading Question Paper',
      'Uploading Answer Scripts',
      'Uploading Source Document',
      'Analyzing Documents',
      'Generating Report'
    ];

    let taskIndex = 0;
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 5;
        
        // Update completed tasks based on progress
        if (newProgress >= 20 && taskIndex === 0) {
          setCompletedTasks(prev => [...prev, tasks[0]]);
          taskIndex++;
        } else if (newProgress >= 40 && taskIndex === 1) {
          setCompletedTasks(prev => [...prev, tasks[1]]);
          taskIndex++;
        } else if (newProgress >= 60 && taskIndex === 2) {
          setCompletedTasks(prev => [...prev, tasks[2]]);
          taskIndex++;
        } else if (newProgress >= 80 && taskIndex === 3) {
          setCompletedTasks(prev => [...prev, tasks[3]]);
          taskIndex++;
        } else if (newProgress >= 100 && taskIndex === 4) {
          setCompletedTasks(prev => [...prev, tasks[4]]);
          taskIndex++;
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 4000);
          return 100;
        }
        return newProgress;
      });
    }, 200);
=======
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
>>>>>>> c06f751c2fdce0be08e3a9a98f4cc76449ac3e8a
  };

  const canProcess = questionPaper && answerScripts.length > 0 && sourceDocument;

  return (
<<<<<<< HEAD
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="max-w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Scribify AI</h1>
                <p className="text-xs text-gray-500">Automated Answer Script Evaluation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors">
                Analytics
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-lg transition-all shadow-md">
                Export Results
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md cursor-pointer hover:scale-105 transition-transform">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-24 right-8 bg-white shadow-2xl rounded-xl p-5 flex items-center gap-4 z-50 animate-in slide-in-from-right border border-emerald-400">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-base">Processing Complete!</p>
              <p className="text-sm text-gray-600">All documents analyzed successfully</p>
            </div>
          </div>
        )}

        {/* Main Layout - 3 Column (Sources | Upload Center | Status) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL - Sources/Documents List */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Documents</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                {(questionPaper ? 1 : 0) + (answerScripts.length > 0 ? 1 : 0) + (sourceDocument ? 1 : 0)}/3 Uploaded
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Question Paper Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Question Paper</h3>
                  {questionPaper && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />}
                </div>
                {questionPaper ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{questionPaper.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(questionPaper.size)}</p>
                      </div>
                      <button onClick={() => removeFile('question')} className="p-1 hover:bg-blue-200 rounded transition-colors">
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                    <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">No file uploaded</p>
                  </div>
                )}
              </div>

              {/* Answer Scripts Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Answer Scripts</h3>
                  {answerScripts.length > 0 && (
                    <>
                      <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full ml-auto">
                        {answerScripts.length}
                      </span>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </>
                  )}
                </div>
                {answerScripts.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {answerScripts.map((script) => (
                      <div key={script.id} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{script.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(script.size)}</p>
                          </div>
                          <button onClick={() => removeFile('answer', script.id)} className="p-1 hover:bg-purple-200 rounded transition-colors">
                            <X className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                    <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">No files uploaded</p>
                  </div>
                )}
              </div>

              {/* Source Document Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Book className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Source Document</h3>
                  {sourceDocument && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />}
                </div>
                {sourceDocument ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{sourceDocument.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(sourceDocument.size)}</p>
                      </div>
                      <button onClick={() => removeFile('source')} className="p-1 hover:bg-emerald-200 rounded transition-colors">
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                    <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">No file uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info at bottom */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">All uploaded documents will appear here for review</p>
              </div>
            </div>
          </div>

          {/* CENTER PANEL - Upload Areas */}
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-green-50 flex flex-col overflow-y-auto">
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-3xl space-y-6">
                
                {!isProcessing ? (
                  <>
                    {/* Question Paper Upload */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                          <FileCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">Question Paper</h3>
                          <p className="text-sm text-gray-500">Upload the exam question paper (PDF only)</p>
                        </div>
                      </div>
                      <div
                        onDragOver={(e) => handleDragOver(e, 'question')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'question')}
                        className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                          draggingZone === 'question'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                        onClick={() => questionPaperRef.current?.click()}
                      >
                        <input ref={questionPaperRef} type="file" accept=".pdf" onChange={(e) => handleFileSelect(e, 'question')} className="hidden" />
                        <div className="text-center">
                          <UploadIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {questionPaper ? '✓ Question paper uploaded' : 'Click or drag to upload question paper'}
                          </p>
                          <p className="text-xs text-gray-500">PDF format, max 50MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Answer Scripts Upload */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">Answer Scripts</h3>
                          <p className="text-sm text-gray-500">Upload student answer sheets (Multiple PDFs allowed)</p>
                        </div>
                      </div>
                      <div
                        onDragOver={(e) => handleDragOver(e, 'answer')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'answer')}
                        className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                          draggingZone === 'answer'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                        onClick={() => answerScriptsRef.current?.click()}
                      >
                        <input ref={answerScriptsRef} type="file" multiple accept=".pdf" onChange={(e) => handleFileSelect(e, 'answer')} className="hidden" />
                        <div className="text-center">
                          <UploadIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {answerScripts.length > 0 ? `✓ ${answerScripts.length} answer script(s) uploaded` : 'Click or drag to upload answer scripts'}
                          </p>
                          <p className="text-xs text-gray-500">PDF format, multiple files supported</p>
                        </div>
                      </div>
                    </div>

                    {/* Source Document Upload */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                          <Book className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">Source Document</h3>
                          <p className="text-sm text-gray-500">Upload reference textbook or study material (PDF only)</p>
                        </div>
                      </div>
                      <div
                        onDragOver={(e) => handleDragOver(e, 'source')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'source')}
                        className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                          draggingZone === 'source'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50'
                        }`}
                        onClick={() => sourceDocumentRef.current?.click()}
                      >
                        <input ref={sourceDocumentRef} type="file" accept=".pdf" onChange={(e) => handleFileSelect(e, 'source')} className="hidden" />
                        <div className="text-center">
                          <UploadIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {sourceDocument ? '✓ Source document uploaded' : 'Click or drag to upload source document'}
                          </p>
                          <p className="text-xs text-gray-500">PDF format, max 50MB</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Processing View */
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Documents</h3>
                        <p className="text-gray-600">Please wait while we analyze your files...</p>
                      </div>
                      <div className="space-y-3">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">{uploadProgress}% Complete</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Bar */}
            {!isProcessing && canProcess && (
              <div className="p-6 bg-white border-t border-gray-200">
                <div className="max-w-3xl mx-auto">
                  <button
                    onClick={startProcessing}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-base font-bold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.01] flex items-center justify-center gap-3"
                  >
                    <Sparkles className="w-6 h-6" />
                    Start Evaluation Process
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL - Task Progress & Status */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Processing Status</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Processing Status Card */}
                {!isProcessing && !canProcess && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                    <AlertCircle className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">Upload Required Documents</p>
                    <p className="text-xs text-gray-600">Please upload all three documents to begin processing</p>
                  </div>
                )}

                {!isProcessing && canProcess && (
                  <div className="bg-emerald-50 border border-emerald-400 rounded-xl p-5 text-center">
                    <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">Ready to Process</p>
                    <p className="text-xs text-gray-600">All documents uploaded. Click the button below to start.</p>
                  </div>
                )}

                {/* Task Progress List */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Task Progress</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Upload Question Paper', icon: FileCheck, color: 'blue' },
                      { label: 'Upload Answer Scripts', icon: Users, color: 'purple' },
                      { label: 'Upload Source Document', icon: Book, color: 'emerald' },
                      { label: 'Analyze Documents', icon: Sparkles, color: 'yellow' },
                      { label: 'Generate Report', icon: FileText, color: 'green' },
                    ].map((task, index) => {
                      const isCompleted = completedTasks.includes(task.label);
                      const isCurrent = isProcessing && index === completedTasks.length;
                      
                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isCompleted
                              ? 'bg-emerald-50 border-emerald-300'
                              : isCurrent
                              ? 'bg-blue-50 border-blue-300 animate-pulse'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isCompleted ? 'bg-emerald-500' : isCurrent ? `bg-${task.color}-500` : 'bg-gray-300'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <task.icon className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                            )}
                          </div>
                          <p className={`text-xs font-medium flex-1 ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                            {task.label}
                          </p>
                          {isCurrent && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Completion Message */}
                {completedTasks.length === 5 && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-400 rounded-xl p-5">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-1">All Tasks Completed!</p>
                      <p className="text-xs text-gray-600">Your evaluation report is ready</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Info */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-900">Document Requirements:</p>
                <ul className="text-xs text-gray-600 space-y-1 ml-3">
                  <li>• PDF format only</li>
                  <li>• Max file size: 50MB</li>
                  <li>• Multiple answer scripts OK</li>
                  <li>• Clear, readable quality</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
=======
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
>>>>>>> c06f751c2fdce0be08e3a9a98f4cc76449ac3e8a
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
