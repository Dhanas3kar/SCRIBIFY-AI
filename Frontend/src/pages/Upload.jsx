import React, { useState, useRef } from 'react';
import {
  Upload as UploadIcon,
  FileText,
  X,
  CheckCircle,
  Plus,
  Search,
  MessageSquare,
  Headphones,
  Film,
  GitBranch,
  FileCheck,
  StickyNote,
  Lightbulb,
  ChevronRight,
  Settings,
  Share,
  BarChart3,
  Menu,
  MoreVertical,
  Sparkles,
  Cloud,
  Loader2
} from 'lucide-react';

const Upload = () => {
  // State
  const [sources, setSources] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(f => 
      f.type === 'application/pdf' || 
      f.type.includes('text') || 
      f.type.includes('video') || 
      f.type.includes('audio')
    );
    setSources(prev => [...prev, ...validFiles.map(file => ({ 
      id: Math.random().toString(36), 
      file, 
      name: file.name, 
      size: file.size,
      type: getFileType(file)
    }))]);
  };

  const getFileType = (file) => {
    if (file.type.includes('pdf')) return 'pdf';
    if (file.type.includes('text')) return 'text';
    if (file.type.includes('video')) return 'video';
    if (file.type.includes('audio')) return 'audio';
    return 'file';
  };

  const removeSource = (id) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const startProcessing = () => {
    if (sources.length === 0) return;
    setIsProcessing(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Untitled notebook</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors">
                <Share className="w-4 h-4" />
                Share
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg transition-all shadow-sm">
                PRO
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-20 right-6 bg-white shadow-lg rounded-xl p-4 flex items-center gap-3 z-50 animate-in slide-in-from-right">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Sources uploaded successfully!</p>
              <p className="text-sm text-gray-600">You can now chat with your notebook.</p>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sources Panel */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Sources</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
                <button className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors">
                  <Search className="w-4 h-4" />
                  Discover
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.mp4,.mp3,.wav"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {sources.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Saved sources will appear here</p>
                  <p className="text-xs text-gray-500">
                    Click Add source above to add PDFs, websites, text, videos, or audio files. Or import a file directly from Google Drive.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {sources.map((source) => (
                    <div key={source.id} className="group p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                          {source.type === 'pdf' && <FileText className="w-5 h-5 text-red-600" />}
                          {source.type === 'text' && <StickyNote className="w-5 h-5 text-blue-600" />}
                          {source.type === 'video' && <Film className="w-5 h-5 text-purple-600" />}
                          {source.type === 'audio' && <Headphones className="w-5 h-5 text-green-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{source.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(source.size)}</p>
                        </div>
                        <button
                          onClick={() => removeSource(source.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="flex-1 bg-gray-50 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-8">
              {isProcessing ? (
                <div className="text-center space-y-6 max-w-md">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Processing your sources...</h3>
                    <p className="text-sm text-gray-600 mt-1">This may take a few moments</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">{uploadProgress}%</p>
                  </div>
                </div>
              ) : sources.length === 0 ? (
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Add a source to get started</h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm"
                  >
                    Upload a source
                  </button>
                </div>
              ) : (
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Lightbulb className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your notebook is ready!</h3>
                  <p className="text-sm text-gray-600 mb-6">Ask questions, generate audio overviews, or create study materials.</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm">
                    Start chatting
                  </button>
                </div>
              )}
            </div>

            {sources.length > 0 && !isProcessing && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{sources.length} sources</span>
                  <button
                    onClick={startProcessing}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate insights
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Studio Panel */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Studio</h2>
            </div>

            <div className="flex-1 p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">Create an Audio Overview in:</p>
                  <p className="text-xs text-gray-600">हिन्दी, বাংলা, മലയാളം, मराठी, தமிழ், తెలుగు, తెలుగు</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Headphones, label: 'Audio Overview', color: 'blue' },
                    { icon: Film, label: 'Video Overview', color: 'purple' },
                    { icon: GitBranch, label: 'Mind Map', color: 'green' },
                    { icon: FileCheck, label: 'Reports', color: 'orange' },
                    { icon: StickyNote, label: 'Flashcards', color: 'pink' },
                    { icon: Lightbulb, label: 'Quiz', color: 'indigo' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      disabled={sources.length === 0}
                      className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center gap-2 ${
                        sources.length === 0
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : `border-${item.color}-200 bg-${item.color}-50 hover:border-${item.color}-300 hover:bg-${item.color}-100 text-${item.color}-700`
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-600">
                    <strong>Studio output will be saved here.</strong><br />
                    After adding sources, click to add Audio Overview, Study Guide, Mind Map, and more!
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors flex items-center justify-center gap-2">
                <StickyNote className="w-5 h-5" />
                Add note
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-white border-t border-gray-200 px-6 py-3">
          <p className="text-xs text-gray-500 text-center">

          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-from-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-in {
          animation: slide-in-from-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Upload;