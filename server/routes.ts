import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertItemSchema, insertClaimSchema, updateClaimSchema, signupSchema, loginSchema, users } from "@shared/schema";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set up multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check custom session first
      if ((req.session as any)?.user) {
        const sessionUser = (req.session as any).user;
        return res.json(sessionUser);
      }
      
      // Fall back to Replit Auth if available
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }
      
      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Custom signup route
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const result = signupSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input. Please try again.",
          errors: result.error.issues.map(issue => issue.message)
        });
      }

      const { firstName, lastName, studentId, email, password } = result.data;

      // Check if student ID already exists
      const existingUser = await storage.getUserByStudentId(studentId);
      if (existingUser) {
        return res.status(400).json({ message: "Student ID already registered. Please try again." });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await storage.createUserFromSignup({
        firstName,
        lastName,
        studentId,
        email,
        password: hashedPassword,
      });

      res.status(201).json({ message: "Account created successfully", userId: user.id });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account. Please try again." });
    }
  });

  // Custom logout route
  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Custom login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid student ID or password. Please try again." });
      }

      const { studentId, password } = result.data;

      // Get user by student ID
      const user = await storage.getUserByStudentId(studentId);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid student ID or password. Please try again." });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid student ID or password. Please try again." });
      }

      // Set session
      (req.session as any).user = {
        id: user.id,
        studentId: user.studentId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      };

      res.json({ 
        message: "Login successful", 
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  });

  // Item routes
  app.get("/api/items", async (req, res) => {
    try {
      const { category, location, status, search, dateFrom, dateTo } = req.query;
      
      const filters = {
        category: category as string,
        location: location as string,
        status: status as string,
        search: search as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };
      
      const items = await storage.getItems(filters);
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const item = await storage.getItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post("/api/items", isAuthenticated, upload.fields([
    { name: 'photo_0', maxCount: 1 },
    { name: 'photo_1', maxCount: 1 },
    { name: 'photo_2', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      // Handle multiple photos
      let photoUrl = null;
      if (req.files) {
        const photos = [];
        for (let i = 0; i < 3; i++) {
          const photoField = `photo_${i}`;
          if (req.files[photoField] && req.files[photoField][0]) {
            photos.push(`/uploads/${req.files[photoField][0].filename}`);
          }
        }
        if (photos.length > 0) {
          photoUrl = photos[0]; // For now, just use the first photo as main photo
        }
      }

      const itemData = insertItemSchema.parse({
        ...req.body,
        foundById: userId,
        photoUrl: photoUrl,
      });

      const item = await storage.createItem(itemData);
      
      // Notify students who might be interested
      // TODO: Implement notification logic for matching categories/search alerts
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.patch("/api/items/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "staff") {
        return res.status(403).json({ message: "Only staff can update items" });
      }

      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const item = await storage.updateItem(id, updates);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  // Claim routes
  app.get("/api/claims", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { status, itemId } = req.query;
      
      const filters = {
        status: status as string,
        itemId: itemId ? parseInt(itemId as string) : undefined,
        studentId: user?.role === "student" ? userId : undefined,
      };
      
      const claims = await storage.getClaims(filters);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({ message: "Failed to fetch claims" });
    }
  });

  app.post("/api/claims", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const claimData = insertClaimSchema.parse({
        ...req.body,
        studentId: userId,
      });

      const claim = await storage.createClaim(claimData);
      
      // Notify staff of new claim
      const staffUsers = await db.select().from(users).where(eq(users.role, "staff"));
      for (const staffUser of staffUsers) {
        await storage.createNotification({
          userId: staffUser.id,
          title: "New Claim Submitted",
          message: `A student has submitted a claim for an item`,
          type: "info",
          relatedClaimId: claim.id,
        });
      }
      
      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating claim:", error);
      res.status(500).json({ message: "Failed to create claim" });
    }
  });

  app.patch("/api/claims/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "staff") {
        return res.status(403).json({ message: "Only staff can update claims" });
      }

      const id = parseInt(req.params.id);
      const updates = updateClaimSchema.parse({
        ...req.body,
        reviewedById: userId,
        reviewedAt: new Date(),
      });
      
      const claim = await storage.updateClaim(id, updates);
      
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      // Notify student of claim status update
      await storage.createNotification({
        userId: claim.studentId,
        title: "Claim Status Updated",
        message: `Your claim has been ${claim.status}`,
        type: claim.status === "approved" ? "success" : "info",
        relatedClaimId: claim.id,
      });
      
      res.json(claim);
    } catch (error) {
      console.error("Error updating claim:", error);
      res.status(500).json({ message: "Failed to update claim" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { unreadOnly } = req.query;
      
      const notifications = await storage.getNotifications(userId, unreadOnly === "true");
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "staff") {
        return res.status(403).json({ message: "Only staff can access analytics" });
      }

      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Archive old items endpoint
  app.post("/api/archive-old-items", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "staff") {
        return res.status(403).json({ message: "Only staff can archive items" });
      }

      const { daysOld = 30 } = req.body;
      const archivedCount = await storage.archiveOldItems(daysOld);
      
      res.json({ archivedCount });
    } catch (error) {
      console.error("Error archiving items:", error);
      res.status(500).json({ message: "Failed to archive items" });
    }
  });

  app.get("/api/export-report", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "staff") {
        return res.status(403).json({ message: "Only staff can export reports" });
      }

      const items = await storage.getItems();
      const claims = await storage.getClaims();
      
      // Generate CSV content
      const csvRows = [
        // Header
        "Item ID,Item Name,Category,Location,Date Found,Status,Priority,Claims Count,Last Claim Date"
      ];
      
      items.forEach(item => {
        const itemClaims = claims.filter(claim => claim.itemId === item.id);
        const lastClaimDate = itemClaims.length > 0 
          ? Math.max(...itemClaims.map(c => new Date(c.createdAt).getTime()))
          : null;
        
        csvRows.push([
          item.id,
          `"${item.name}"`,
          item.category,
          item.location,
          new Date(item.dateFound).toLocaleDateString(),
          item.status,
          item.priority,
          itemClaims.length,
          lastClaimDate ? new Date(lastClaimDate).toLocaleDateString() : "None"
        ].join(","));
      });
      
      const csvContent = csvRows.join("\\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="lost-found-report-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting report:", error);
      res.status(500).json({ message: "Failed to export report" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Function to broadcast notifications to all connected clients
  global.broadcastNotification = (notification: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  };

  return httpServer;
}
