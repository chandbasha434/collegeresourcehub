# College Resource Hub

## Overview

This is a web-based platform designed to facilitate peer-to-peer sharing of educational resources among college students. The application serves as a centralized repository where students can upload, discover, and access study materials including notes, past exam papers, and study guides. The platform emphasizes quality through community-driven ratings and provides advanced categorization by subject, semester, and content type to help students efficiently find relevant materials.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React 18 using TypeScript and Vite as the build tool. The UI framework leverages Radix UI primitives with shadcn/ui components for a consistent design system. The application follows a modern component-based architecture with:

- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom design tokens following a sophisticated grey color palette
- **UI Components**: Comprehensive component library based on Radix UI primitives
- **Theme System**: Built-in dark/light theme support with preference persistence

### Backend Architecture
The server-side uses Express.js with TypeScript in an ESM configuration. Key architectural decisions include:

- **API Design**: RESTful API endpoints with proper HTTP status codes and error handling
- **File Upload**: Multer middleware for handling file uploads with size limits and type validation
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL storage for authentication state

### Authentication System
The application integrates with Replit's OAuth system for secure authentication:

- **OAuth Integration**: Uses OpenID Connect with Replit as the identity provider
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Role-based Access**: Support for student and admin roles
- **Security**: JWT-based authentication with proper session management

### Database Design
The database schema supports the core functionality with these key entities:

- **Users**: Extended profile information including major, role, and academic details
- **Resources**: File metadata, categorization, and upload tracking
- **Ratings**: Community-driven quality assessment system
- **Tags**: Flexible tagging system for improved resource discovery
- **Favorites**: User bookmark functionality for resource management

### File Management
The system handles file uploads with a structured approach:

- **Storage Strategy**: Local file system with user-segregated directories
- **File Validation**: MIME type checking for PDFs, Word documents, and images
- **Size Limits**: 10MB maximum file size with progress tracking
- **Security**: File sanitization and secure file serving

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL database connectivity
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **express**: Node.js web application framework
- **multer**: File upload middleware
- **passport**: Authentication middleware

### UI and Design System
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for managing component variants
- **lucide-react**: Icon library for consistent iconography

### Authentication and Security
- **openid-client**: OpenID Connect client implementation
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session middleware for Express

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and enhanced developer experience
- **tsx**: TypeScript execution for Node.js
- **drizzle-kit**: Database migration and schema management tools

### External Services
- **Replit OAuth**: Identity provider for user authentication
- **PostgreSQL**: Primary database for all application data
- **Google Fonts**: Typography resources (Inter and JetBrains Mono)