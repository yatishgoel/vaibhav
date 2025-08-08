"use client";

import React, { useState, useEffect } from "react";
import { Project } from "@/entities/Project";
import { LeaseAnalysis } from "@/entities/LeaseAnalysis";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Plus, ArrowLeft, Eye } from "lucide-react";
import { format } from "date-fns";
import Layout from "@/components/layout";
import PDFViewer from "@/components/abstract/PDFViewer";

interface ProjectData {
  id?: string;
  name: string;
  description?: string;
  created_date?: string;
}

interface AnalysisData {
  id?: string;
  lease_name: string;
  analysis_type: "abstract" | "benchmark";
  status: "processing" | "completed" | "failed";
  created_date?: string;
}

export default function ProjectDetails() {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  const [project, setProject] = useState<ProjectData | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [projectPdfs, setProjectPdfs] = useState<{ url: string; filename: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPdfs, setIsLoadingPdfs] = useState(false);
  const [error, setError] = useState("");
  const params = useParams();
  const projectId = params?.id as string;

  useEffect(() => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setError("");
        const [projectData, analysesData] = await Promise.all([
          Project.get(projectId),
          LeaseAnalysis.filter({ project_id: projectId }, "-created_date"),
        ]);
        setProject(projectData);
        setAnalyses(analysesData);
        
        // Fetch project PDFs
        setIsLoadingPdfs(true);
        try {
          console.log("📁 Fetching PDFs for project:", projectId);
          const pdfs = await Project.getProjectPDFs(projectId);
          console.log("📁 Received PDFs:", pdfs);
          setProjectPdfs(pdfs);
          console.log("📁 Set projectPdfs state to:", pdfs);
        } catch (pdfError) {
          console.error("Failed to fetch project PDFs:", pdfError);
          setError("Failed to load project PDFs");
        } finally {
          setIsLoadingPdfs(false);
        }
      } catch (error) {
        console.error("Failed to fetch project details:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch project details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  // Debug useEffect to track state changes
  useEffect(() => {
    console.log("📁 State update - isLoadingPdfs:", isLoadingPdfs, "projectPdfs.length:", projectPdfs.length, "projectPdfs:", projectPdfs);
  }, [isLoadingPdfs, projectPdfs]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Layout currentPageName="ProjectDetails">
        <div className="p-8">Loading project details...</div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout currentPageName="ProjectDetails">
        <div className="p-8">Project not found.</div>
      </Layout>
    );
  }

  return (
    <Layout currentPageName="ProjectDetails">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
          <div className="mb-8">
            <Link
              href={createPageUrl("Projects")}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Link>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {project.name}
                </h1>
                <p className="text-gray-500 mt-1">{project.description}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={createPageUrl(
                    `AbstractAnalysis?project_id=${projectId}`
                  )}
                >
                  <Button>
                    <Plus className="w-4 h-4 mr-2" /> New Abstract
                  </Button>
                </Link>
                <Link
                  href={createPageUrl(
                    `BenchmarkAnalysis?project_id=${projectId}`
                  )}
                >
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" /> New Benchmark
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg flex items-center">
              <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-red-600 text-xs">✕</span>
              </div>
              {error}
            </div>
          )}

          {/* Project PDFs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Project Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPdfs ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading project documents...</p>
                  </div>
                ) : projectPdfs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projectPdfs.map((pdf, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedPdf(pdf.url)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {pdf.filename}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Click to view
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPdf(pdf.url);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-medium text-gray-700 mb-1">
                      No documents yet
                    </h3>
                    <p className="text-sm text-gray-500">
                      Documents will appear here when uploaded to this project.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Analyses in this project</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lease</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyses.length > 0 ? (
                        analyses.map((analysis) => (
                          <TableRow key={analysis.id}>
                            <TableCell className="font-medium">
                              {analysis.lease_name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1.5 capitalize"
                              >
                                {analysis.analysis_type === "abstract" ? (
                                  <FileText className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <TrendingUp className="w-3 h-3 text-purple-600" />
                                )}
                                {analysis.analysis_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {analysis.created_date
                                ? format(
                                    new Date(analysis.created_date),
                                    "MMM d, yyyy"
                                  )
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${getStatusBadge(
                                  analysis.status
                                )} capitalize`}
                              >
                                {analysis.status}
                              </Badge>
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
                              <FileText className="w-12 h-12 text-gray-300" />
                              <div>
                                <h3 className="font-medium text-gray-700 mb-1">
                                  No analyses yet
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Start analyzing documents in this project.
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

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PDFViewer
          pdfUrl={selectedPdf}
          filename={projectPdfs.find(pdf => pdf.url === selectedPdf)?.filename || "Document"}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </Layout>
  );
}
