import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertItemSchema, insertClaimSchema, updateClaimSchema, users } from "@shared/schema";
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
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  app.post("/api/items", isAuthenticated, upload.single("photo"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "staff") {
        return res.status(403).json({ message: "Only staff can add items" });
      }

      const itemData = insertItemSchema.parse({
        ...req.body,
        foundById: userId,
        photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
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
