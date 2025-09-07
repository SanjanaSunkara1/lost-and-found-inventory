# High School Lost & Found App 🔎

This is a digital [Lost & Found inventory management system](https://4a00581d-15fe-401a-a822-dad87b531b0e-00-7ld0kc3a54iu.kirk.replit.dev/) for High Schools, where students and staff can add found items, search the inventory, and claim their lost belongings with real time notifications.

## Features ✨

- **Theme Selection**: Can switch between dark and light mode whenever needed
- **Add Items**: Upload found items with photos, descriptions, and location details
- **Search & Browse**: Filter items by category, location, and search terms
- **Claim System**: Submit claims for lost items with description verification
- **Real time Notifications**: WebSocket notifications for claim updates
- **My Claims**: Track your submitted claims and pickup locations
- **Mobile Friendly**: Responsive design optimized for phones and tablets
- **School Branding**: Westwood High School theme with burnt orange colors
- **Secure Authentication**: Replit OpenID Connect login system


## Account Setup Instructions

1. **Create Account**: Sign up with a student ID that starts with "s" followed by any 6 digits (e.g., s987654, s555123, s999888)
2. **Set Password**: Choose a secure password for your account
3. **Log In**: Use your student ID and password to log into the system
4. **Start Using**: Once logged in, you can add items, browse inventory, and claim lost belongings


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

## Credits
Created using `AI Assistance`
