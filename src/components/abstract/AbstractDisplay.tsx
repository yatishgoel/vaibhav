import React from "react";
import { Download, FileSpreadsheet, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface AbstractDisplayProps {
  abstract: {
    downloadUrl?: string;
    fileName: string;
  };
}

export default function AbstractDisplay({ abstract }: AbstractDisplayProps) {
  const handleDownload = () => {
    if (abstract && abstract.downloadUrl) {
      // Open the URL in a new tab to trigger the download.
      window.open(abstract.downloadUrl, "_blank");
    } else {
      alert("No download link available for this abstract.");
    }
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <div className="font-medium text-green-900">Analysis Complete</div>
            <div className="text-sm text-green-700">
              Abstract generated successfully
            </div>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Excel
        </Button>
      </motion.div>

      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <FileSpreadsheet className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Generated Abstract Ready
        </h3>
        <p className="text-gray-600 mb-4">
          Click the button above to download the report:
          <br />
          <span className="font-semibold">{abstract.fileName}</span>
        </p>

        <div className="bg-white rounded-lg p-6 border text-left">
          <div className="text-sm text-blue-800 bg-blue-50 p-4 rounded-lg">
            <strong>Note:</strong> A preview of the Excel file is not available.
            Please use the download button to view the full abstract.
          </div>
        </div>
      </div>
    </div>
  );
}
