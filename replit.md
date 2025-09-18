# Overview

RestaurantPro is a restaurant management web application designed as a Capture The Flag (CTF) cybersecurity challenge. The application simulates a vulnerable restaurant management system with intentional security flaws for educational purposes. It features user authentication, order management, review systems, and administrative functions, all built with modern web technologies while containing deliberate vulnerabilities for security training exercises.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a modern component-based architecture. It uses Vite as the build tool and development server, providing fast hot module replacement and optimized bundling. The application leverages Wouter for client-side routing, offering a lightweight alternative to React Router.

State management is handled through a combination of Zustand for authentication state persistence and TanStack Query for server state management and API caching. The authentication system stores user sessions in browser storage, allowing persistent login states across page refreshes.

The UI is constructed using shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable interface elements. Styling is implemented with Tailwind CSS using a custom design system with CSS variables for theming support.

## Backend Architecture
The backend is built with Express.js running on Node.js, serving both API endpoints and static files. The server implements a RESTful API design with routes for authentication, user management, orders, reviews, and administrative functions. The application includes middleware for request logging and error handling.

The backend intentionally includes vulnerable endpoints and weak security implementations as part of the CTF challenge design. This includes endpoints for SQL injection testing, IDOR (Insecure Direct Object Reference) vulnerabilities, and administrative bypass mechanisms.

## Data Storage Solutions
The project is configured to use Drizzle ORM with PostgreSQL for production environments, as evidenced by the database schema definitions and configuration files. However, the current implementation uses an in-memory storage system (MemStorage) that simulates database operations without requiring an actual database connection.

The schema defines four main entities: users (with authentication and role management), orders (customer order tracking), reviews (customer feedback system), and adminData (sensitive administrative information). The in-memory implementation maintains data consistency during the application lifecycle while providing the flexibility needed for CTF scenarios.

## Authentication and Authorization
The authentication system implements session-based authentication with role-based access control. Users can register and login through standard forms, with the system supporting both regular users and administrators. The application stores authentication state both server-side and client-side for session persistence.

The system intentionally includes authentication bypasses and weak authorization checks as part of the CTF challenge. This includes IDOR vulnerabilities in admin endpoints, weak session management, and administrative privilege escalation opportunities for educational exploitation.

# External Dependencies

## Database and ORM
The application integrates with Drizzle ORM for type-safe database operations and schema management. While configured for PostgreSQL connectivity, the current implementation uses in-memory storage for the CTF environment. The Drizzle configuration supports migrations and schema synchronization for production deployments.

## UI and Styling
The frontend leverages a comprehensive UI component library through Radix UI primitives, providing accessible and customizable interface components. The styling system uses Tailwind CSS with PostCSS processing for optimized CSS generation. The shadcn/ui component system provides a scalable design system built on these foundations.

## Development and Build Tools
The application uses Vite for development server and build processes, with specific Replit integrations for the development environment. React Hook Form with Zod validation handles form management and data validation throughout the application. TanStack Query provides robust data fetching, caching, and synchronization capabilities for the frontend.

## Security and Validation
Form validation is handled through Zod schemas with React Hook Form integration, providing type-safe form handling and validation. The application includes various validation schemas for user registration, authentication, and data input while maintaining intentional security gaps for the CTF challenge context.