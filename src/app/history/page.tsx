"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock as ClockIcon,
  RefreshCw,
  Download,
  Eye,
} from "lucide-react";
import Layout from "@/components/layout";
import { ApiService } from "@/utils/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface JobHistoryItem {
  jobExecutionID: string;
  fileName: string;
  jobStatus: "SUCCESS" | "FAILED" | "IN_PROGRESS";
  created_date?: string;
}

export default function History() {
  const [jobs, setJobs] = useState<JobHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Export functionality state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<"XLSX" | "PDF">("XLSX");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<{ url: string; format: string } | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobHistoryItem | null>(null);

  const fetchJobHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get account_id from localStorage (set during login)
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error("User not logged in");
      }
      
      const user = JSON.parse(userData);
      const account_id = user.accountID;
      
      if (!account_id) {
        throw new Error("Account ID not found");
      }

      const response = await ApiService.fetchJobs(account_id);
      
      if (response.status === "success" && response.jobs) {
        setJobs(response.jobs);
      } else {
        throw new Error(response.message || "Failed to fetch job history");
      }
    } catch (error) {
      console.error("Failed to fetch job history:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch job history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800 border-green-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleViewAbstract = (job: JobHistoryItem) => {
    setSelectedJob(job);
    setShowExportDialog(true);
    setExportError(null);
    setExportSuccess(null);
    setExportFormat("XLSX");
  };

  const handleExportAnalysis = async () => {
    if (!selectedJob) {
      setExportError("No job selected for export");
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const response = await ApiService.exportAnalysis(selectedJob.jobExecutionID, exportFormat);
      
      if (response.status === "success" && response.public_url) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = response.public_url;
        link.download = `analysis_${selectedJob.jobExecutionID}.${exportFormat.toLowerCase()}`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Set success state for manual download option
        setExportSuccess({ url: response.public_url, format: exportFormat });
        setExportError(null);
      } else {
        setExportError(response.message || "Export failed");
        setExportSuccess(null);
      }
    } catch (error) {
      console.error("Export error:", error);
      setExportError(error instanceof Error ? error.message : "Export failed");
      setExportSuccess(null);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout currentPageName="History">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto p-6 sm:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analysis history...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPageName="History">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="rounded-t-lg px-6 py-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ClockIcon className="w-6 h-6" /> Analysis History
                  </CardTitle>
                  <button
                    onClick={fetchJobHistory}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {error && (
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 text-red-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div>
                        <h3 className="font-medium">Error loading history</h3>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Analysis ID</TableHead>
                        <TableHead>File Analysed</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>View Abstract</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.length > 0 ? (
                        jobs.map((job) => (
                          <TableRow key={job.jobExecutionID}>
                            <TableCell className="font-mono text-sm">
                              {job.jobExecutionID}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                {job.fileName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${getStatusBadge(job.jobStatus)} border capitalize`}
                              >
                                {job.jobStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                onClick={() => handleViewAbstract(job)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                disabled={job.jobStatus !== "SUCCESS"}
                              >
                                <Eye className="w-4 h-4" />
                                View Abstract
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-16 text-gray-500"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <ClockIcon className="w-12 h-12 text-gray-300" />
                              <div>
                                <h3 className="font-medium text-gray-700 mb-1">
                                  No analysis history yet
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Start analyzing leases to see your history here.
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Export Analysis Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Abstract - {selectedJob?.fileName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!exportSuccess ? (
              <>
                <p className="text-sm text-gray-600">
                  Choose the format to view your analysis abstract:
                </p>
                <div>
                  <Label htmlFor="export-format">Export Format</Label>
                  <select
                    id="export-format"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as "XLSX" | "PDF")}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="XLSX">XLSX (Excel)</option>
                    <option value="PDF">PDF</option>
                  </select>
                </div>
                {exportError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{exportError}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-700">
                    <Download className="w-5 h-5" />
                    <p className="text-sm font-medium">Export Successful!</p>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Your {exportSuccess.format} file has been generated and should start downloading automatically.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700 mb-2">
                    If the download didn&apos;t start automatically, you can download it manually:
                  </p>
                  <Button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = exportSuccess.url;
                      link.download = `analysis_${selectedJob?.jobExecutionID}.${exportSuccess.format.toLowerCase()}`;
                      link.target = "_blank";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download {exportSuccess.format} File
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowExportDialog(false);
                setExportError(null);
                setExportSuccess(null);
                setSelectedJob(null);
                setExportFormat("XLSX");
              }}
              disabled={isExporting}
            >
              {exportSuccess ? "Close" : "Cancel"}
            </Button>
            {!exportSuccess && (
              <Button
                onClick={handleExportAnalysis}
                disabled={isExporting || !selectedJob}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
