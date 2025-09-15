Buyer Lead Management CRM
A modern, full-stack CRM application designed to manage real estate buyer leads efficiently. Built with Next.js, Prisma, and NextAuth.js, this application provides a robust and secure platform for real estate professionals to track, filter, and manage their client pipeline.

✨ Key Features
This application is packed with features designed for a professional workflow:

🔐 Secure Authentication: Google OAuth login powered by NextAuth.js.

👤 Role-Based Access Control:

Standard Users: Can create, view, and edit their own leads based on email matching.

Developer Admin: A designated admin (via .env) can view and edit all leads in the system.

✅ Full CRUD Functionality: Create, Read, and Update buyer leads.

🚀 Advanced Data Table:

Server-Side Pagination: Efficiently handles large datasets by paginating results on the server.

Debounced Search: Instant search by name, email, or phone without overwhelming the server.

URL-Synced Filtering: Filter by numerous fields (Status, City, Property Type, etc.), with the current filter state reflected in the URL for easy sharing and bookmarking.

🔄 CSV Import & Export:

Smart Import: Bulk-import up to 200 leads at once from a CSV file.

Row-Level Validation: Each row is validated, and a clear report of errors is provided without stopping the import of valid rows.

Filtered Export: Export the currently filtered and searched list of buyers to a CSV file.

⭐ Quality & Production Readiness:

API Rate Limiting: Protects create and update actions from abuse.

Global Error Handling: A user-friendly error boundary prevents application crashes.

Unit Tested: Core business logic (like the CSV validator) is verified with Jest unit tests.

Accessibility: Thoughtful implementation of ARIA roles, form labels, and keyboard focus management.

Empty States: Helpful and informative messages when no data is available.

🛠️ Tech Stack
Framework: Next.js (App Router)

Styling: Tailwind CSS

ORM: Prisma

Database: PostgreSQL

Authentication: NextAuth.js

UI Components: Headless UI for accessible components.

Testing: Jest & React Testing Library

🚀 Getting Started & Setup
Follow these steps to get the project running on your local machine.

Prerequisites
Node.js (v18 or later recommended)

A package manager like npm, yarn, or pnpm

A running PostgreSQL database instance.

1. Clone and Install
git clone <your-repository-url>
cd buyer-lead-app
npm install

2. Setup Environment Variables
Create a .env file in the root of your project by copying the example file:

cp .env.example .env

Now, open the .env file and fill in all the required values. See the comments in the .env.example file for guidance on what each variable is for.

3. Database Migration
Push the Prisma schema to your database. This command creates and updates your database tables to match your schema.prisma file.

npx prisma db push

4. Seeding the Database (Optional)
For development, it's helpful to have some initial data. This project is set up to allow for Prisma seeding. You can create a prisma/seed.ts file and then run:

npx prisma db seed

5. Running the Application Locally
Start the Next.js development server:

npm run dev

The application should now be running at http://localhost:3000.

🏛️ Architectural & Design Notes
Component Strategy (SSR vs. Client)
This application leverages the Next.js App Router's Server-First component model:

Server Components by Default: Most pages (/buyers, /[id], /new) are React Server Components. This allows for secure and efficient data fetching directly on the server, reducing the amount of JavaScript shipped to the client and improving initial page load performance.

Client Components for Interactivity: Components requiring user interaction and state (e.g., the Filters component with its dropdowns, the ImportExportControls modal) are explicitly marked with the 'use client' directive. This isolates client-side interactivity to only the necessary parts of the application, keeping the footprint small.

Validation Strategy
Validation is handled at two levels to ensure both security and a good user experience:

Server-Side (Source of Truth): All critical business logic and validation occur in Server Actions. This includes rate limiting, ownership checks, and CSV row validation. This is the primary line of defense and cannot be bypassed by the client.

Client-Side (User Experience): Standard browser validation (e.g., <input type="email">, required) is used for immediate feedback. Error messages from server actions are passed back to the client and displayed in an accessible role="alert" element, informing the user of what went wrong.

Ownership and Authorization
Authorization logic is centralized within the lib/auth.ts configuration and enforced on the server:

Standard Users: A user's ability to edit a buyer is determined by matching their session email with the buyer's email address. This check is performed securely on the server when loading an edit page and is re-verified within the updateBuyer server action.

Developer Admin: A special email address defined in process.env.ADMIN_EMAIL grants superuser privileges. The NextAuth.js callbacks check for this email upon login and add an isAdmin: true flag to the user's session. This flag is then used throughout the application to bypass standard ownership rules, granting access to the "Admin View" and the ability to edit any record.

✅ Project Scope: What's Done vs. Skipped
What's Done
All the features listed in the "Key Features" section have been implemented to a production-ready standard, with a focus on security, performance, and user experience.

What's Skipped (and Why)
Complex State Management Library (e.g., Redux, Zustand): Skipped because the combination of Server Components for data fetching and URL state (useSearchParams) for filters handles most state management needs cleanly and efficiently, avoiding unnecessary client-side complexity.

Full End-to-End Testing (e.g., Cypress, Playwright): Skipped to focus on the core application logic. A unit test for the critical CSV validation logic was provided as a baseline for quality. E2E tests would be a logical next step for a mission-critical production application.

Database Seeding Script: A formal prisma/seed.ts script was skipped for brevity, though the project is configured to support it. The initial user is created automatically on the first Google login via the Prisma Adapter.
