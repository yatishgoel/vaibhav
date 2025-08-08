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
} from "@/components/abstract";
import AbstractPDFViewer from "@/components/abstract/AbstractPDFViewer";
import { useState } from "react";
import { ApiService } from "@/utils/api";
import { ExtractedResult } from "@/entities/LeaseAnalysis";
import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/entities/Project";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


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
  
  // Project selection state
  const [projects, setProjects] = useState<{ id?: string; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  // Export functionality state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<"XLSX" | "PDF">("XLSX");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<{ url: string; format: string } | null>(null);
  const [currentJobExecutionId, setCurrentJobExecutionId] = useState<string>("");

  const loadProjects = async () => {
    try {
      const projectsData = await Project.list();
      setProjects(projectsData);
      return projectsData;
    } catch (error) {
      console.error("Failed to load projects:", error);
      return [];
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    
    setIsCreatingProject(true);
    try {
      const newProject = await Project.create({
        name: newProjectName,
        description: newProjectDesc,
      });
      
      setNewProjectName("");
      setNewProjectDesc("");
      setShowCreateProjectDialog(false);
      
      // Reload projects and select the new one
      await loadProjects();
      setSelectedProjectId(newProject.id || "");
      
      // Continue with file upload
      if (pendingFile) {
        setUploadedFile(pendingFile);
        setPendingFile(null);
        await performAnalysis(pendingFile, newProject.id);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    console.log("📁 File uploaded:", file);
    
    // Load projects first and get the data directly
    const projectsData = await loadProjects();
    console.log("📁 Loaded projects:", projectsData);
    
    if (projectsData.length === 0) {
      console.log("📁 No projects found, showing create project dialog");
      // No projects exist, show create project dialog
      setPendingFile(file);
      setShowCreateProjectDialog(true);
      return;
    }
    
    console.log("📁 Projects found, showing project selection dialog");
    // Show project selection dialog
    setPendingFile(file);
    setShowProjectDialog(true);
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

  const performAnalysis = async (fileToAnalyze: File, projectId?: string) => {
    console.log("🚀 performAnalysis called");
    console.log("📁 fileToAnalyze:", fileToAnalyze);
    console.log("📁 projectId:", projectId);

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
        fileToAnalyze,
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
        },
        projectId
      );

      if (results.status === "success") {
        setExtractedResults(results.extracted_results);
        setShowResults(true);
        // Store the job execution ID for export functionality
        // Note: This assumes the jobExecutionId is available in the results
        // You may need to modify the API response to include this
        setCurrentJobExecutionId(results.jobExecutionId || "");
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

  const handleStartAnalysis = async () => {
    if (!uploadedFile) {
      console.error("❌ No file to analyze");
      alert("Please upload a lease document first.");
      return;
    }

    await performAnalysis(uploadedFile);
  };

  const handleExportAnalysis = async () => {
    if (!currentJobExecutionId) {
      setExportError("No analysis available for export");
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const response = await ApiService.exportAnalysis(currentJobExecutionId, exportFormat);
      
      if (response.status === "success" && response.public_url) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = response.public_url;
        link.download = `analysis_${currentJobExecutionId}.${exportFormat.toLowerCase()}`;
        link.target = "_blank"; // Open in new tab as fallback
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
    } finally {
      setIsExporting(false);
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
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={async () => {
                      if (uploadedFile) {
                        setProcessing({
                          isUploading: false,
                          isAnalyzing: false,
                          uploadProgress: "",
                          analysisProgress: "",
                          error: null,
                        });
                        // Retry with the same file and project
                        await performAnalysis(uploadedFile, selectedProjectId || undefined);
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Retry Analysis
                  </Button>
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
                    Upload New File
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Viewer Section */}
          {uploadedFile && !showResults && !isProcessing && !processing.error && (
            <div className="mb-8">
              {uploadedFile.type === "application/pdf" ? (
                <AbstractPDFViewer
                  file={uploadedFile}
                  extractedResults={extractedResults}
                />
              ) : (
                <div className="bg-white p-6 rounded-lg border-0 shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Document Review
                  </h2>
                  <LeaseViewer file={uploadedFile} />
                </div>
              )}
            </div>
          )}

          {/* Results Display Section */}
          {showResults && extractedResults.length > 0 && uploadedFile && (
            <div className="mb-8">
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
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
                    <Button
                      onClick={() => setShowExportDialog(true)}
                      className="flex items-center gap-2"
                      disabled={!currentJobExecutionId}
                    >
                      <Download className="w-4 h-4" />
                      Export Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <AbstractPDFViewer
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

          {/* Project Selection Dialog */}
          <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select a Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Choose a project to associate with this analysis:
                </p>
                <div>
                  <Label htmlFor="project-select">Project</Label>
                  <select
                    id="project-select"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowProjectDialog(false);
                    setPendingFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedProjectId) {
                      alert("Please select a project");
                      return;
                    }
                    setShowProjectDialog(false);
                    if (pendingFile) {
                      setUploadedFile(pendingFile);
                      setPendingFile(null);
                      await performAnalysis(pendingFile, selectedProjectId);
                    }
                  }}
                  disabled={!selectedProjectId}
                >
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Project Dialog */}
          <Dialog open={showCreateProjectDialog} onOpenChange={setShowCreateProjectDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <Label htmlFor="newProjectName">Project Name</Label>
                  <Input
                    id="newProjectName"
                    value={newProjectName}
                    className="mt-2"
                    onChange={(e) => setNewProjectName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newProjectDesc">Description (Optional)</Label>
                  <Textarea
                    id="newProjectDesc"
                    value={newProjectDesc}
                    className="mt-2"
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setShowCreateProjectDialog(false);
                      setPendingFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingProject}>
                    {isCreatingProject ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Export Analysis Dialog */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Analysis</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {!exportSuccess ? (
                  <>
                    <p className="text-sm text-gray-600">
                      Choose the format for your analysis export:
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
                        <CheckCircle className="w-5 h-5" />
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
                          link.download = `analysis_${currentJobExecutionId}.${exportSuccess.format.toLowerCase()}`;
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
                    setExportFormat("XLSX");
                  }}
                  disabled={isExporting}
                >
                  {exportSuccess ? "Close" : "Cancel"}
                </Button>
                {!exportSuccess && (
                  <Button
                    onClick={handleExportAnalysis}
                    disabled={isExporting || !currentJobExecutionId}
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
        </div>
      </div>
    </Layout>
  );
}
