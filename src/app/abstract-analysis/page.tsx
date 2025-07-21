"use client";

import Layout from "@/components/layout";
import {
  FileText,
  Upload,
  Search,
  Download,
  AlertCircle,
  CheckCircle,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FileUploadZone,
  LeaseViewer,
  AbstractDisplay,
  PDFViewer,
} from "@/components/abstract";
import { useState } from "react";
import { ApiService } from "@/utils/api";
import { ExtractedResult } from "@/entities/LeaseAnalysis";
import { Card, CardContent } from "@/components/ui/card";

interface ProcessingState {
  isUploading: boolean;
  isAnalyzing: boolean;
  uploadProgress: string;
  analysisProgress: string;
  error: string | null;
}

export default function AbstractAnalysis() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedResults, setExtractedResults] = useState<ExtractedResult[]>(
    []
  );
  const [showResults, setShowResults] = useState(false);
  const [processing, setProcessing] = useState<ProcessingState>({
    isUploading: false,
    isAnalyzing: false,
    uploadProgress: "",
    analysisProgress: "",
    error: null,
  });

  const handleFileUpload = (file: File) => {
    console.log("📁 File uploaded:", file);
    setUploadedFile(file);
    setShowResults(false);
    setExtractedResults([]);
    setProcessing({
      isUploading: false,
      isAnalyzing: false,
      uploadProgress: "",
      analysisProgress: "",
      error: null,
    });
  };

  const testApiConnection = async () => {
    console.log("🔍 Testing API connection...");
    try {
      const result = await ApiService.testConnection();
      if (result.success) {
        alert(`✅ Connection successful: ${result.message}`);
      } else {
        alert(`❌ Connection failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Connection test error:", error);
      alert(
        `❌ Connection test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleStartAnalysis = async () => {
    console.log("🚀 handleStartAnalysis called");
    console.log("📁 uploadedFile:", uploadedFile);

    if (!uploadedFile) {
      alert("Please upload a lease document first.");
      return;
    }

    try {
      console.log("🔧 Starting analysis workflow...");

      // Reset state
      setProcessing({
        isUploading: true,
        isAnalyzing: false,
        uploadProgress: "Uploading file to server...",
        analysisProgress: "",
        error: null,
      });

      console.log("📤 State updated, calling API...");

      // Upload file and analyze with progress updates
      const results = await ApiService.uploadAndAnalyze(
        uploadedFile,
        (stage, message) => {
          if (stage === "uploading") {
            setProcessing((prev) => ({
              ...prev,
              uploadProgress: message,
            }));
          } else if (stage === "analyzing") {
            setProcessing((prev) => ({
              ...prev,
              isUploading: false,
              isAnalyzing: true,
              analysisProgress: message,
            }));
          }
        }
      );

      if (results.status === "success") {
        setExtractedResults(results.extracted_results);
        setShowResults(true);
        setProcessing({
          isUploading: false,
          isAnalyzing: false,
          uploadProgress: "",
          analysisProgress: "",
          error: null,
        });
      } else {
        throw new Error(results.message || "Analysis failed");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setProcessing({
        isUploading: false,
        isAnalyzing: false,
        uploadProgress: "",
        analysisProgress: "",
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during analysis",
      });
    }
  };

  const isProcessing = processing.isUploading || processing.isAnalyzing;

  return (
    <Layout currentPageName="AbstractAnalysis">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Abstract Analysis
                </h1>
                <p className="text-gray-600 mt-2">
                  Upload and analyze lease documents to extract key insights and
                  patterns.
                </p>
              </div>

              {/* Debug: Test Connection Button */}
              <Button
                onClick={testApiConnection}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Wifi className="w-4 h-4" />
                Test API Connection
              </Button>
            </div>
          </div>

          {/* File Upload Section */}
          {!uploadedFile && !isProcessing && (
            <div className="bg-white p-6 rounded-lg border-0 shadow-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upload Document
              </h2>
              <FileUploadZone onFileUpload={handleFileUpload} />
            </div>
          )}

          {/* Processing Loader */}
          {isProcessing && (
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Processing Your Document
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Please wait while we analyze your lease document...
                  </p>

                  <div className="space-y-2 max-w-md mx-auto">
                    {processing.uploadProgress && (
                      <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                        <Upload className="w-4 h-4" />
                        {processing.uploadProgress}
                      </div>
                    )}
                    {processing.analysisProgress && (
                      <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                        <Search className="w-4 h-4" />
                        {processing.analysisProgress}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {processing.error && (
            <Card className="mb-8 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <h3 className="font-medium">Analysis Failed</h3>
                    <p className="text-sm text-red-600 mt-1">
                      {processing.error}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      setUploadedFile(null);
                      setProcessing({
                        isUploading: false,
                        isAnalyzing: false,
                        uploadProgress: "",
                        analysisProgress: "",
                        error: null,
                      });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Viewer Section */}
          {uploadedFile && !showResults && !isProcessing && !processing.error && (
            <div className="mb-8">
              {uploadedFile.type === "application/pdf" ? (
                <PDFViewer
                  file={uploadedFile}
                  onAnalyze={handleStartAnalysis}
                />
              ) : (
                <div className="bg-white p-6 rounded-lg border-0 shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Document Review
                  </h2>
                  <LeaseViewer file={uploadedFile} />

                  <div className="mt-6 text-center">
                    <Button
                      onClick={handleStartAnalysis}
                      disabled={isProcessing}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                    >
                      Start Abstract Analysis
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Display Section */}
          {showResults && extractedResults.length > 0 && uploadedFile && (
            <div className="mb-8">
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <div>
                      <h3 className="font-medium">Analysis Complete</h3>
                      <p className="text-sm text-green-600">
                        Found {extractedResults.length} key data points in your
                        lease document
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <PDFViewer
                file={uploadedFile}
                extractedResults={extractedResults}
              />

              <div className="mt-6 text-center">
                <Button
                  onClick={() => {
                    setUploadedFile(null);
                    setShowResults(false);
                    setExtractedResults([]);
                  }}
                  variant="outline"
                  className="mr-4"
                >
                  Upload New Document
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
