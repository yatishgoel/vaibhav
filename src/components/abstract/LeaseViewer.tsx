import React from "react";
import { FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaseViewerProps {
  file: File;
}

export default function LeaseViewer({ file }: LeaseViewerProps) {
  const handleDownload = () => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-gray-600" />
          <div>
            <div className="font-medium text-gray-900">{file.name}</div>
            <div className="text-sm text-gray-600">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Document Preview
        </h3>
        <p className="text-gray-600 mb-4">
          Original lease document: {file.name}
        </p>
        {file.type === "application/pdf" ? (
          <div className="w-full flex justify-center mt-4">
            <iframe
              src={URL.createObjectURL(file)}
              title="PDF Preview"
              width="100%"
              height="500px"
              className="border rounded shadow"
            />
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Document preview is only available for PDF files.
          </div>
        )}
        <div className="mt-6 p-4 bg-white rounded border text-left">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Document Information:
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• File: {file.name}</div>
            <div>• Size: {(file.size / 1024 / 1024).toFixed(2)} MB</div>
            <div>• Type: {file.type}</div>
            <div>
              • Last Modified: {new Date(file.lastModified).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
