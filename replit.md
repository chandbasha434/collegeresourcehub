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

## Application Flow & Features

### Landing Experience
When users first visit the application, they encounter a beautifully designed landing page showcasing:
- **Hero Section**: Clear value proposition for peer-to-peer educational resource sharing
- **Feature Highlights**: Upload & Share, Download Resources, Rate & Review functionality  
- **Community Stats**: 10,000+ study resources, 5,000+ active students, 50+ universities
- **Call-to-Action**: Multiple "Sign In" buttons directing to `/api/login` for Replit OAuth

### Authentication Flow
1. **Login Process**: Users click "Sign In" → redirected to `/api/login` → Replit OAuth → authenticated
2. **Session Management**: 7-day session duration with secure PostgreSQL storage
3. **User Profile Creation**: Auto-creates user profile with Replit account details (name, email, profile image)
4. **Role Assignment**: Users default to "student" role, with admin capabilities available

### Main Application Dashboard
Once authenticated, users access a comprehensive resource sharing platform with:

#### Navigation Structure
- **Sidebar Navigation**: Persistent left sidebar with user profile and main navigation
- **Header Bar**: Global search, theme toggle, notifications, user menu with logout
- **Responsive Design**: Mobile-friendly with collapsible sidebar

#### Core Features

**1. Home Dashboard**
- Welcome screen with personalized greeting
- Quick access to recent activities
- Overview of user's uploaded resources and favorites

**2. Browse Resources**
- **Advanced Search**: Filter by subject, semester, file type, minimum rating
- **Sorting Options**: Newest, oldest, highest rated, most downloaded
- **Resource Grid**: Card-based layout showing resource previews
- **Pagination**: Efficient loading of large resource collections

**3. Resource Management**
- **Upload System**: Drag-and-drop file upload with progress tracking
- **File Validation**: Supports PDFs, Word docs, and images (10MB limit)
- **Metadata Entry**: Title, description, subject, semester, tags
- **User Directory Structure**: Files organized by user ID for security

**4. Community Features**
- **Rating System**: 1-5 star ratings with written reviews
- **Favorites**: Bookmark resources for quick access
- **Download Tracking**: Automatic download count incrementing
- **Resource Statistics**: View popularity and rating metrics

**5. Advanced Discovery**
- **Tag System**: Flexible tagging for improved resource categorization
- **Trending Content**: Popular resources by timeframe (week/month/all-time)
- **Top Contributors**: Recognition for active uploaders
- **Subject-based Browsing**: Filter by academic subjects

**6. User Account Management**
- **Profile Settings**: Update personal information, major, academic details
- **My Resources**: View and manage uploaded resources
- **My Favorites**: Access bookmarked content
- **Upload History**: Track sharing contributions

**7. Administrative Features** (Admin Role)
- **User Management**: View all registered users
- **Content Moderation**: Toggle resource active status
- **Platform Analytics**: Dashboard statistics and trending insights
- **Resource Administration**: Bulk resource management

### Technical Workflow

#### File Upload Process
1. **File Selection**: User selects file via upload interface
2. **Client Validation**: File type and size checking
3. **Secure Upload**: Multer handles file storage in user-specific directories
4. **Database Entry**: Resource metadata stored with file path reference
5. **Tag Processing**: Optional tags created/associated with resource
6. **Immediate Availability**: Resource instantly available for community discovery

#### Search & Discovery
1. **Query Processing**: Frontend sends filtered search parameters
2. **Database Query**: Optimized SQL queries with proper indexing  
3. **Result Rendering**: Fast resource card rendering with pagination
4. **Real-time Updates**: Cache invalidation ensures fresh results

#### Authentication & Security
1. **OAuth Flow**: Secure Replit OpenID Connect integration
2. **Session Security**: HTTP-only cookies with CSRF protection
3. **Role-based Access**: Middleware enforcement of authentication requirements
4. **File Security**: User-segregated file storage with access controls

## Getting Started

### For New Users
1. **Access the Application**: Visit the running application URL
2. **Sign In**: Click "Sign In" on the landing page
3. **Authenticate**: Complete Replit OAuth process
4. **Explore**: Browse existing resources or upload your first material
5. **Engage**: Rate resources, add favorites, and contribute to the community

### For Contributors
1. **Upload Resources**: Use the "Upload" feature to share study materials
2. **Add Metadata**: Include detailed descriptions and appropriate tags
3. **Community Guidelines**: Share high-quality, relevant educational content
4. **Monitor Impact**: Track downloads and ratings on your contributions

### For Developers
1. **Local Development**: Run `npm run dev` to start the development server
2. **Database Management**: Use `npm run db:push` for schema changes
3. **Environment Setup**: All necessary secrets are pre-configured in Replit
4. **Deployment**: Application is ready for production deployment

## Current Deployment Status

### Production Ready
- ✅ **Frontend**: React application with Vite build system
- ✅ **Backend**: Express server with proper middleware setup  
- ✅ **Database**: PostgreSQL with complete schema deployment
- ✅ **Authentication**: Fully configured Replit OAuth integration
- ✅ **File System**: Secure file upload and storage system
- ✅ **API Endpoints**: Complete REST API for all functionality

### Deployment Configuration
- **Build Process**: `npm run build` creates production bundles
- **Start Command**: `npm run start` serves production application
- **Port Configuration**: Runs on port 5000 with proper host binding
- **Environment Variables**: All secrets properly configured and secured

### Access Information
- **Development URL**: Application running on port 5000
- **Authentication**: Ready for immediate user sign-up and usage
- **File Storage**: Upload directory configured and operational
- **Database**: All tables created and relationships established

The application is fully functional and ready for user onboarding. Users can immediately sign in, upload resources, browse content, and participate in the educational community.