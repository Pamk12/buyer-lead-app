Buyer Lead Management CRM
A full-stack CRM for managing real estate buyer leads, built with Next.js, Prisma, and NextAuth.js.

Key Features
🔐 Secure Authentication: Google OAuth login via NextAuth.js.

👤 Role-Based Access: Standard user and developer admin roles.

✅ Full CRUD Functionality: Create, Read, and Update buyer leads.

🚀 Advanced Data Management:

Server-Side Pagination, Debounced Search, and URL-Synced Filtering.

CSV Import/Export with row-level validation and filtered exports.

⭐ Production-Ready: Includes API rate limiting, global error handling, unit tests, and accessibility features.

Tech Stack
Framework: Next.js (App Router)

Styling: Tailwind CSS

ORM: Prisma

Database: PostgreSQL

Authentication: NextAuth.js

UI Components: Headless UI

Testing: Jest & React Testing Library

Getting Started
Prerequisites
Node.js (v18+)

A running PostgreSQL database.

Setup & Run
Clone and Install:

git clone <your-repository-url>
cd buyer-lead-app
npm install

Environment Variables:

Copy .env.example to .env.

Fill in your database URL, Google OAuth credentials, AUTH_SECRET, and ADMIN_EMAIL.

cp .env.example .env

Database Migration:

npx prisma db push

Run Locally:

npm run dev

The application will be available at http://localhost:3000.

Architecture Notes
SSR-First: Primarily uses Next.js Server Components for efficient data fetching, with Client Components reserved for interactivity.

Server-Side Validation: All critical validation and authorization logic is handled in Server Actions for maximum security.
