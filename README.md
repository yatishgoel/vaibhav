# LeaseFlow

A modern, AI-powered lease analysis platform built with Next.js 14, TypeScript, and Tailwind CSS.

## ✨ Features

- **Abstract Analysis**: Upload lease documents and get intelligent abstractions with key terms and clauses
- **Benchmark Analysis**: Compare multiple leases and generate comprehensive market analysis reports
- **Project Management**: Organize your analyses into projects for better tracking
- **History Tracking**: View all past analysis activities with detailed status tracking
- **User Management**: Complete profile management system
- **Responsive Design**: Beautiful UI that works on desktop and mobile

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Package Manager**: pnpm

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/yatishgoel/vaibhav.git
cd vaibhav
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📱 Pages & Routes

- `/` - Landing page with features and call-to-actions
- `/dashboard` - Main dashboard with stats and quick actions
- `/projects` - Project management and creation
- `/projects/[id]` - Individual project details and analyses
- `/abstract-analysis` - Single lease document analysis workflow
- `/benchmark-analysis` - Multi-lease comparison and benchmarking
- `/history` - Analysis history and activity tracking
- `/profile` - User profile management

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/
│   ├── projects/
│   ├── abstract-analysis/
│   ├── benchmark-analysis/
│   ├── history/
│   ├── profile/
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── abstract/          # Abstract analysis components
│   ├── benchmark/         # Benchmark analysis components
│   └── layout.tsx         # Main layout with sidebar
├── entities/              # Data models and mock APIs
│   ├── Project.ts
│   ├── LeaseAnalysis.ts
│   └── User.ts
└── utils/                 # Utility functions
```

## 🎨 Design System

- **Primary Colors**: Blue (Abstract Analysis), Purple (Benchmark Analysis)
- **Typography**: Clean, modern font hierarchy
- **Components**: Consistent card-based design with shadows
- **Layout**: Responsive sidebar navigation
- **Animations**: Smooth transitions with Framer Motion

## 🔧 Development

The project uses mock data for demonstration. To connect to a real backend:

1. Replace the mock methods in `src/entities/` with actual API calls
2. Update the interfaces to match your backend schema
3. Add authentication and authorization
4. Configure environment variables for API endpoints

## 📦 Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🏢 About

**LeaseFlow** - Streamlining commercial lease analysis with AI-powered insights.

Built by [AEGYS TECH](mailto:vaibhav@aegystech.com)
