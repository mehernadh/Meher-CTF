import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertReviewSchema } from "@shared/schema";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve robots.txt with Flag 1
  app.get("/robots.txt", (req, res) => {
    const robotsContent = `User-agent: *
Disallow: /admin/
Disallow: /secret-search
Disallow: /api/
Allow: /

# THMxSFDC{r0b0ts_t3ll_s3cr3ts}
`;
    
    res.set("Content-Type", "text/plain");
    res.send(robotsContent);
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Return success with flag hint for console
      res.json({ 
        message: "Registration successful",
        user: { id: user.id, email: user.email, fullName: user.fullName },
        debug: "Check browser console for system initialization messages"
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ 
        message: "Login successful",
        user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, isAdmin: user.isAdmin }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data", error });
    }
  });

  // IDOR Vulnerability - User profile endpoint (Flag 3)
  app.get("/api/user/profile/:userRef", async (req, res) => {
    const { userRef } = req.params;
    
    // Intentionally vulnerable - no authorization check
    // Decode the user reference (simple base64)
    let userId;
    try {
      userId = Buffer.from(userRef, 'base64').toString('ascii');
    } catch {
      return res.status(400).json({ message: "Invalid user reference" });
    }
    
    const user = await storage.getUser(userId);
    const adminData = await storage.getAdminData(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // If accessing admin user (encoded ID: YWRtaW5fdXNlcl8yMDI0), return flag
    if (userId === "admin_user_2024" && adminData) {
      return res.json({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        permissions: ["all"],
        flag: adminData.adminFlag,
        lastLogin: "2024-01-15 09:30:00",
        secretData: adminData.secretData,
        profileAccess: "elevated"
      });
    }

    res.json({
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      message: "Standard profile access"
    });
  });

  // Orders API
  app.get("/api/orders", async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  // Reviews API with XSS vulnerability
  app.get("/api/reviews", async (req, res) => {
    const reviews = await storage.getReviews();
    res.json(reviews);
  });

  // Helper function to sanitize customer input (remove HTML/scripts)
  const sanitizeInput = (input: string): string => {
    return input.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '');
  };

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      
      // Sanitize customer name and comment (remove all HTML/scripts)
      // Keep response field vulnerable for XSS challenge
      const sanitizedReviewData = {
        ...reviewData,
        customerName: sanitizeInput(reviewData.customerName),
        comment: sanitizeInput(reviewData.comment),
        // response field stays as-is for XSS challenge
      };
      
      const review = await storage.createReview(sanitizedReviewData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data", error });
    }
  });

  // SQL Injection vulnerable search endpoint (Flag 4)
  app.post("/api/secret-search", async (req, res) => {
    const { query, searchType } = req.body;
    
    if (!query || !searchType) {
      return res.status(400).json({ message: "Query and search type required" });
    }

    try {
      // Intentionally vulnerable search function
      const results = await storage.searchDatabase(query, searchType);
      
      res.json({
        query: `SELECT * FROM ${searchType} WHERE name LIKE '%${query}%'`,
        searchType,
        results,
        executed: true
      });
    } catch (error) {
      res.status(500).json({ message: "Search failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Users endpoint for admin panel
  app.get("/api/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isAdmin: user.isAdmin
    })));
  });

  const httpServer = createServer(app);
  return httpServer;
}
