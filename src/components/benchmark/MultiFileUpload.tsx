import React, { useCallback } from "react";
import { Upload, FileText, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface MultiFileUploadProps {
  onFilesUpload: (files: File[]) => void;
}

export default function MultiFileUpload({
  onFilesUpload,
}: MultiFileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (newFiles: File[]) => {
    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    onFilesUpload(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    onFilesUpload(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
          dragActive
            ? "border-purple-400 bg-purple-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center"
          >
            <Upload className="w-8 h-8 text-purple-600" />
          </motion.div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload multiple lease documents
          </h3>
          <p className="text-gray-600 mb-6">
            Upload 2 or more leases to generate a comprehensive benchmark report
          </p>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Files
          </Button>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <AnimatePresence>
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => removeFile(index)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
