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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FolderKanban, Plus, FileText } from "lucide-react";
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, analysesData] = await Promise.all([
        Project.list("-created_date"),
        LeaseAnalysis.list(),
      ]);
      setProjects(projectsData);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    setIsCreating(true);
    try {
      await Project.create({
        name: newProjectName,
        description: newProjectDesc,
      });
      setNewProjectName("");
      setNewProjectDesc("");
      document.getElementById("close-dialog")?.click();
      await fetchData();
    } catch (error) {
      console.error("Failed to create project", error);
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FolderKanban className="w-8 h-8" /> Projects
            </h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
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
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost" id="close-dialog">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

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
