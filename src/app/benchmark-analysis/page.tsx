"use client";

import Layout from "@/components/layout";
import { TrendingUp, BarChart3, PieChart, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiFileUpload, BenchmarkReport } from "@/components/benchmark";
import { useState } from "react";

export default function BenchmarkAnalysis() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Mock report data for demonstration
  const mockReport = {
    downloadUrl: "https://example.com/report.xlsx",
    leaseCount: uploadedFiles.length,
    fileName: "Benchmark_Analysis_Report.xlsx",
  };

  const handleFilesUpload = (files: File[]) => {
    setUploadedFiles(files);
    setShowReport(false);
  };

  const handleGenerateBenchmark = () => {
    if (uploadedFiles.length >= 2) {
      setIsProcessing(true);
      // Simulate processing time
      setTimeout(() => {
        setIsProcessing(false);
        setShowReport(true);
      }, 3000);
    } else {
      alert(
        "Please upload at least 2 lease documents to generate a benchmark report."
      );
    }
  };

  return (
    <Layout currentPageName="BenchmarkAnalysis">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Benchmark Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Compare your lease terms against market standards and industry
              benchmarks.
            </p>
          </div>

          {/* Multi-File Upload Section */}
          <div className="bg-white p-6 rounded-lg border-0 shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Lease Documents
            </h2>
            <MultiFileUpload onFilesUpload={handleFilesUpload} />

            {uploadedFiles.length >= 2 && !showReport && (
              <div className="mt-6 text-center">
                <Button
                  onClick={handleGenerateBenchmark}
                  disabled={isProcessing}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                >
                  {isProcessing
                    ? "Generating Benchmark..."
                    : "Generate Benchmark Report"}
                </Button>
              </div>
            )}
          </div>

          {/* Benchmark Report Section */}
          {showReport && (
            <div className="bg-white p-6 rounded-lg border-0 shadow-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Benchmark Report
              </h2>
              <BenchmarkReport report={mockReport} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
