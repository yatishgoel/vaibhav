"use client";

import React, { useState, useEffect } from "react";
import { Project } from "@/entities/Project";
import { LeaseAnalysis } from "@/entities/LeaseAnalysis";
import { motion } from "framer-motion";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FolderKanban, Plus, FileText, RefreshCw } from "lucide-react";
import Layout from "@/components/layout";

interface ProjectData {
  id?: string;
  name: string;
  description?: string;
  created_date?: string;
}

interface LeaseAnalysisData {
  id?: string;
  lease_name: string;
  analysis_type: "abstract" | "benchmark";
  status: "processing" | "completed" | "failed";
  project_id?: string;
  created_date?: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [projectAnalyses, setProjectAnalyses] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasLoadedProjects, setHasLoadedProjects] = useState(false);
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);

  useEffect(() => {
    fetchData(false); // Initial load - will fetch from API since hasLoadedProjects is false
  }, []);

  const fetchData = async (forceRefresh = false) => {
    setIsLoading(true);
    setError("");
    try {
      let projectsData: ProjectData[] = [];
      
      // Only fetch projects from API if not loaded yet or if force refresh is requested
      if (!hasLoadedProjects || forceRefresh) {
        console.log("📁 Fetching projects from API...");
        projectsData = await Project.list("-created_date");
        setProjects(projectsData);
        setHasLoadedProjects(true);
        setIsUsingCachedData(false);
      } else {
        console.log("📁 Using cached projects data");
        projectsData = projects; // Use existing projects data
        setIsUsingCachedData(true);
      }

      // Always fetch analyses data (this might be needed for real-time updates)
      const analysesData = await LeaseAnalysis.list();

      const analysesCount = analysesData.reduce(
        (acc: Record<string, number>, analysis: LeaseAnalysisData) => {
          if (analysis.project_id) {
            acc[analysis.project_id] = (acc[analysis.project_id] || 0) + 1;
          }
          return acc;
        },
        {}
      );
      setProjectAnalyses(analysesCount);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    setIsCreating(true);
    setError("");
    setSuccess("");
    try {
      const newProject = await Project.create({
        name: newProjectName,
        description: newProjectDesc,
      });
      
      // Clear form fields
      setNewProjectName("");
      setNewProjectDesc("");
      
      // Show success message
      setSuccess("Project added successfully!");
      
      // Close the dialog after a short delay to show success message
      setTimeout(() => {
        setIsDialogOpen(false);
        setSuccess("");
      }, 1500);
      
      // Refresh the projects list (force refresh to get the new project)
      await fetchData(true);
    } catch (error) {
      console.error("Failed to create project", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create project";
      setError(errorMessage);
      // Don't close dialog on error - let user see the error message
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <Layout currentPageName="Projects">
        <div className="p-8">Loading projects...</div>
      </Layout>
    );
  }

  return (
    <Layout currentPageName="Projects">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-6 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FolderKanban className="w-8 h-8" /> Projects
              </h1>
              {isUsingCachedData && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>•</span>
                  <span>Using cached data</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData(true)}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (open) {
                  // Clear messages when dialog opens
                  setError("");
                  setSuccess("");
                }
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> New Project
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={newProjectName}
                      className="mt-2"
                      onChange={(e) => setNewProjectName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectDesc">Description (Optional)</Label>
                    <Textarea
                      id="projectDesc"
                      value={newProjectDesc}
                      className="mt-2"
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                    />
                  </div>
                  
                  {/* Error and Success Messages in Dialog */}
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg flex items-center">
                      <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-red-600 text-xs">✕</span>
                      </div>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="text-green-600 text-sm bg-green-50 border border-green-200 p-3 rounded-lg flex items-center">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      {success}
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button 
                      variant="ghost" 
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg flex items-center">
              <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-red-600 text-xs">✕</span>
              </div>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 text-green-600 text-sm bg-green-50 border border-green-200 p-3 rounded-lg flex items-center">
              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/projects/${project.id || ""}`}>
                    <Card className="h-full flex flex-col border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {project.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-gray-600 line-clamp-2">
                          {project.description || "No description provided."}
                        </p>
                      </CardContent>
                      <CardFooter className="text-sm text-gray-500 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>
                          {projectAnalyses[project.id || ""] || 0} analyses
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <FolderKanban className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900">
                  No projects yet
                </h3>
                <p className="text-gray-500 mt-2">
                  Create your first project to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
