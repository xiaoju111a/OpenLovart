# OpenLovart 🎨

English | [中文](./README.zh.md)

[![GitHub stars](https://img.shields.io/github/stars/xiaoju111a/OpenLovart?style=social)](https://github.com/xiaoju111a/OpenLovart/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/xiaoju111a/OpenLovart?style=social)](https://github.com/xiaoju111a/OpenLovart/network/members)
[![GitHub issues](https://img.shields.io/github/issues/xiaoju111a/OpenLovart)](https://github.com/xiaoju111a/OpenLovart/issues)
[![GitHub license](https://img.shields.io/github/license/xiaoju111a/OpenLovart)](https://github.com/xiaoju111a/OpenLovart/blob/master/LICENSE)

OpenLovart is an AI-powered design platform that makes creative design simple and powerful. Bring your design ideas to life quickly through AI conversations and an intelligent canvas.

## ✨ Key Features

- 🤖 **AI Design Assistant** - Generate design solutions through natural language conversations
- 🎨 **Smart Canvas** - Visual editor with drag, zoom, rotate, and more
- 🖼️ **AI Image Generation** - Integrated with Google Gemini and X.AI Grok for high-quality image generation
- 💾 **Project Management** - Save and manage your design projects
- 👤 **User System** - Secure authentication and credit system powered by Clerk
- ☁️ **Cloud Storage** - Data persistence with Supabase

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **AI Services**: 
  - Google Gemini (Image Generation)
  - X.AI Grok (Design Suggestions)
- **Deployment**: Vercel

## 📦 Quick Start

### 1. Clone the Repository

```bash
git clone git@github.com:xiaoju111a/OpenLovart.git
cd OpenLovart
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# X.AI Grok API (Optional)
XAI_API_KEY=your_xai_api_key
```

### 4. Set Up Database

Execute `supabase-schema.sql` in Supabase to create the necessary tables:

```sql
-- Run in Supabase SQL Editor
-- File location: ./supabase-schema.sql
```

### 5. Configure Clerk JWT Template

Refer to the `CLERK_JWT_SETUP.md` document to configure Clerk's Supabase JWT template.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔑 Getting API Keys

### Clerk (Authentication Service)
1. Visit [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy the Publishable Key and Secret Key

### Supabase (Database)
1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Find the URL and anon key in Settings > API

### Google Gemini (AI Service)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API Key

### X.AI Grok (Optional)
1. Visit [X.AI Console](https://console.x.ai/)
2. Create an API Key

## 📁 Project Structure

```
OpenLovart/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── lovart/            # Main application pages
│   │   └── debug-*/           # Debug tools
│   ├── components/            # React components
│   │   └── lovart/           # Core components
│   ├── hooks/                # Custom Hooks
│   ├── lib/                  # Utility libraries
│   └── middleware.ts         # Middleware
├── public/                   # Static assets
├── supabase-schema.sql      # Database schema
└── .env.example             # Environment variables template
```

## 🛠️ Available Commands

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Run production server
npm run start

# Lint code
npm run lint
```

## 📚 Documentation

- [Clerk JWT Setup](./CLERK_JWT_SETUP.md)
- [Grok Integration Guide](./GROK_INTEGRATION.md)
- [User Credits Feature](./USER_CREDITS_FEATURE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

## 🚢 Deploy to Vercel

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Configure environment variables (same as `.env.local`)
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xiaoju111a/OpenLovart)

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.com/)
- [Supabase](https://supabase.com/)
- [Google Gemini](https://ai.google.dev/)
- [X.AI](https://x.ai/)

## 📊 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=xiaoju111a/OpenLovart&type=Date)](https://star-history.com/#xiaoju111a/OpenLovart&Date)

---

Made with ❤️ by Xiaoju
