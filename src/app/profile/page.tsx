"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, User as UserIcon, Mail, Shield } from "lucide-react";
import Layout from "@/components/layout";

interface UserData {
  id?: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setFullName(currentUser.full_name || "");
      } catch (err) {
        setError(
          "Could not load user profile. Please make sure you are logged in."
        );
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await User.updateMyUserData({ full_name: fullName });
      const updatedUser = await User.me();
      setUser(updatedUser);
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  if (error) {
    return (
      <Layout currentPageName="Profile">
        <div className="p-8 text-red-500">{error}</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout currentPageName="Profile">
        <div className="p-8">Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout currentPageName="Profile">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar_url} alt={user.full_name} />
                    <AvatarFallback className="text-3xl bg-blue-100 text-blue-600">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold">{user.full_name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="fullName"
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <UserIcon className="w-4 h-4" /> Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <Mail className="w-4 h-4" /> Email Address
                      </Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="role"
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <Shield className="w-4 h-4" /> Role
                      </Label>
                      <Input
                        id="role"
                        value={user.role}
                        disabled
                        className="bg-gray-100 cursor-not-allowed capitalize"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
