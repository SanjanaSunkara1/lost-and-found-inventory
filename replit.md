# Lost & Found Inventory Management System

## Overview

This is a full-stack Lost & Found inventory management system for Westwood High School, built to digitize the traditional physical bin and handwritten log system. The application provides a comprehensive solution for staff to add and manage lost items, students to browse and claim items, and administrators to track analytics and manage claims. The system features role-based access control with different interfaces for staff and students, real-time notifications via WebSocket, and comprehensive search and filtering capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18 and TypeScript using Vite as the build tool. The application uses a component-based architecture with the shadcn/ui design system built on top of Radix UI primitives and styled with Tailwind CSS. State management is handled through TanStack Query (React Query) for server state and local React state for UI interactions. The routing is managed using Wouter for client-side navigation.

The application implements a responsive design that works across desktop and mobile devices, with specific considerations for Chromebooks and smartphones. The UI follows a card-based layout pattern with comprehensive form handling using React Hook Form with Zod validation.

### Backend Architecture
The backend is built with Express.js and TypeScript using ESM modules. It follows a modular architecture with separate route handlers, storage abstraction layer, and authentication middleware. The server provides RESTful APIs for all CRUD operations and includes real-time WebSocket support for notifications.

The application uses session-based authentication with Replit's OpenID Connect provider, storing user sessions in PostgreSQL. File uploads are handled through Multer with image validation and storage in a local uploads directory.

### Database Design
The system uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema includes tables for users (with role-based access), items (with categories and priorities), claims (with status tracking), notifications, and sessions. The database supports advanced querying with filters for search, category, location, and date ranges.

Key relationships include users having multiple claims, items having multiple claims, and a comprehensive audit trail for all operations. The schema supports both staff and student roles with appropriate data access controls.

### Authentication & Authorization
The application implements Replit's OpenID Connect authentication system with session management stored in PostgreSQL. Role-based access control differentiates between staff and student users, with staff having additional privileges for adding items, reviewing claims, and accessing analytics.

Sessions are managed with secure HTTP-only cookies and include automatic session cleanup. The authentication middleware protects all API routes and provides user context throughout the application.

### File Management
Image uploads are handled through a dedicated multer configuration with file type validation (JPEG, PNG, GIF, WebP), size limits (5MB), and secure file storage. Images are served through a static file endpoint with proper security headers.

### Real-time Features
WebSocket integration provides real-time notifications for claim updates, new items, and system alerts. The notification system includes both in-app toasts and persistent notification storage with read/unread status tracking.

## External Dependencies

### Core Framework Dependencies
- **React 18** with TypeScript for the frontend framework
- **Express.js** with TypeScript for the backend API server
- **Vite** for frontend build tooling and development server

### Database & ORM
- **PostgreSQL** as the primary database using Neon Database service
- **Drizzle ORM** for type-safe database operations and migrations
- **@neondatabase/serverless** for serverless PostgreSQL connections

### UI Components & Styling
- **Radix UI** primitives for accessible component foundations
- **Tailwind CSS** for utility-first styling approach
- **shadcn/ui** component library for consistent design system
- **Lucide React** for consistent iconography

### State Management & Data Fetching
- **TanStack Query** for server state management and caching
- **React Hook Form** with **@hookform/resolvers** for form handling
- **Zod** for runtime type validation and schema validation

### Authentication & Session Management
- **Replit OpenID Connect** for user authentication
- **Passport.js** with OpenID Connect strategy
- **Express Session** with **connect-pg-simple** for PostgreSQL session storage

### File Handling & Storage
- **Multer** for multipart/form-data file upload handling
- Local file system storage for uploaded images
- **ws** WebSocket library for real-time communication

### Development & Build Tools
- **TypeScript** for static type checking across the full stack
- **ESBuild** for production server bundling
- **TSX** for development server with hot reloading
- **Replit Vite plugins** for development environment integration