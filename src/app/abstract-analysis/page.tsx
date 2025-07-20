"use client";

import Layout from "@/components/layout";
import { FileText, Upload, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FileUploadZone,
  LeaseViewer,
  AbstractDisplay,
  PDFViewer,
} from "@/components/abstract";
import { useState } from "react";

export default function AbstractAnalysis() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAbstract, setShowAbstract] = useState(false);

  // Mock abstract data for demonstration
  const mockAbstract = {
    downloadUrl: "https://example.com/abstract.xlsx",
    fileName: "Lease_Abstract_Analysis.xlsx",
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setShowAbstract(false);
  };

  const handleStartAnalysis = () => {
    if (uploadedFile) {
      setIsProcessing(true);
      // Simulate processing time
      setTimeout(() => {
        setIsProcessing(false);
        setShowAbstract(true);
      }, 3000);
    } else {
      alert("Please upload a lease document first.");
    }
  };

  return (
    <Layout currentPageName="AbstractAnalysis">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Abstract Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Upload and analyze lease documents to extract key insights and
              patterns.
            </p>
          </div>

          {/* File Upload Section */}
          {!uploadedFile && (
            <div className="bg-white p-6 rounded-lg border-0 shadow-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upload Document
              </h2>
              <FileUploadZone onFileUpload={handleFileUpload} />
            </div>
          )}

          {/* Document Viewer Section */}
          {uploadedFile && !showAbstract && (
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
                      {isProcessing
                        ? "Analyzing Document..."
                        : "Start Abstract Analysis"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Abstract Display Section */}
          {showAbstract && (
            <div className="bg-white p-6 rounded-lg border-0 shadow-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Analysis Results
              </h2>
              <AbstractDisplay abstract={mockAbstract} />

              <div className="mt-6 text-center">
                <Button
                  onClick={() => {
                    setUploadedFile(null);
                    setShowAbstract(false);
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
