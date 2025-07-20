import React from "react";
import {
  Download,
  FileSpreadsheet,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BenchmarkReportProps {
  report: {
    downloadUrl?: string;
    leaseCount: number;
    fileName: string;
  };
}

export default function BenchmarkReport({ report }: BenchmarkReportProps) {
  const handleDownload = () => {
    if (report && report.downloadUrl) {
      window.open(report.downloadUrl, "_blank");
    } else {
      alert("No download link available for this report.");
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-purple-600" />
          <div>
            <div className="font-medium text-purple-900">
              Benchmark Complete
            </div>
            <div className="text-sm text-purple-700">
              Report generated from {report.leaseCount} lease documents
            </div>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Excel
        </Button>
      </motion.div>

      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Benchmark Report Ready
        </h3>
        <p className="text-gray-600 mb-4">
          Click the button above to download the report:
          <br />
          <span className="font-semibold">{report.fileName}</span>
        </p>

        {report.downloadUrl && report.fileName.toLowerCase().endsWith('.pdf') ? (
          <div className="w-full flex justify-center mt-4">
            <iframe
              src={report.downloadUrl}
              title="PDF Preview"
              width="100%"
              height="500px"
              className="border rounded shadow"
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 border text-left">
            <div className="text-sm text-purple-800 bg-purple-50 p-4 rounded-lg">
              <strong>Note:</strong> A preview of the benchmark report is not
              available. Please use the download button to view the full report.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
