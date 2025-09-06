# High School Lost & Found App 🔎

A digital Lost & Found inventory management system for High Schools, where students and staff can add found items, search the inventory, and claim their lost belongings with real time notifications.

## Features ✨

- **Add Items**: Upload found items with photos, descriptions, and location details
- **Search & Browse**: Filter items by category, location, and search terms
- **Claim System**: Submit claims for lost items with description verification
- **Real time Notifications**: WebSocket notifications for claim updates
- **My Claims**: Track your submitted claims and pickup locations
- **Mobile Friendly**: Responsive design optimized for phones and tablets
- **School Branding**: Westwood High School theme with burnt orange colors
- **Secure Authentication**: Replit OpenID Connect login system

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for data fetching
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **WebSocket** for real-time updates
- **Multer** for file uploads

### Authentication & Deployment
- **Replit OpenID Connect** for authentication
- **Session-based** authentication with PostgreSQL storage
- **Replit Deployments** ready

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL database
4. Run the development server: `npm run dev`
5. Access at `http://localhost:5000`

## Project Structure

- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared TypeScript schemas and types
- `/uploads` - File storage for item photos
