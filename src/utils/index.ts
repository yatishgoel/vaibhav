/**
 * Creates a page URL from a page name
 * Converts camelCase or PascalCase to lowercase with dashes
 */
export function createPageUrl(pageName: string): string {
  if (pageName === "Home") {
    return "/";
  }

  // Convert PascalCase/camelCase to kebab-case
  const kebabCase = pageName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

  return `/${kebabCase}`;
}

/**
 * Navigation configuration
 */
export const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: "BarChart3" },
  {
    title: "Abstract Analysis",
    url: createPageUrl("AbstractAnalysis"),
    icon: "FileText",
  },
  {
    title: "Benchmark Analysis",
    url: createPageUrl("BenchmarkAnalysis"),
    icon: "TrendingUp",
  },
  {
    title: "Property Analysis",
    url: createPageUrl("PropertyAnalysis"),
    icon: "FileText",
  },
];

export const userNavigationItems = [
  { title: "Projects", url: createPageUrl("Projects"), icon: "FolderKanban" },
  { title: "History", url: createPageUrl("History"), icon: "Clock" },
  { title: "Profile", url: createPageUrl("Profile"), icon: "User" },
];
