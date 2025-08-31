import {
  users,
  items,
  claims,
  notifications,
  type User,
  type UpsertUser,
  type SignupData,
  type Item,
  type InsertItem,
  type Claim,
  type InsertClaim,
  type UpdateClaim,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByStudentId(studentId: string): Promise<User | undefined>;
  createUserFromSignup(signupData: SignupData): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Item operations
  getItems(filters?: {
    category?: string;
    location?: string;
    status?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, updates: Partial<Item>): Promise<Item | undefined>;
  archiveOldItems(daysOld: number): Promise<number>;
  
  // Claim operations
  getClaims(filters?: { status?: string; itemId?: number; studentId?: string }): Promise<Claim[]>;
  getClaim(id: number): Promise<Claim | undefined>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: number, updates: UpdateClaim): Promise<Claim | undefined>;
  
  // Notification operations
  getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  
  // Analytics operations
  getAnalytics(): Promise<{
    totalItems: number;
    itemsReturned: number;
    pendingClaims: number;
    recoveryRate: number;
    categoryStats: Array<{ category: string; count: number }>;
    locationStats: Array<{ location: string; count: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByStudentId(studentId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.studentId, studentId));
    return user;
  }

  async createUserFromSignup(signupData: SignupData): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        studentId: signupData.studentId,
        email: signupData.email,
        password: signupData.password, // Will be hashed in the route handler
        role: "student",
      })
      .returning();
    return user;
  }

  // Item operations
  async getItems(filters?: {
    category?: string;
    location?: string;
    status?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Item[]> {
    let query = db.select().from(items);
    
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(items.category, filters.category as any));
    }
    
    if (filters?.location) {
      conditions.push(eq(items.location, filters.location));
    }
    
    if (filters?.status) {
      conditions.push(eq(items.status, filters.status as any));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          like(items.name, `%${filters.search}%`),
          like(items.description, `%${filters.search}%`)
        )
      );
    }
    
    if (filters?.dateFrom) {
      conditions.push(gte(items.dateFound, filters.dateFrom));
    }
    
    if (filters?.dateTo) {
      conditions.push(lte(items.dateFound, filters.dateTo));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(items.createdAt));
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db
      .insert(items)
      .values(item)
      .returning();
    return newItem;
  }

  async updateItem(id: number, updates: Partial<Item>): Promise<Item | undefined> {
    const [updatedItem] = await db
      .update(items)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return updatedItem;
  }

  async archiveOldItems(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await db
      .update(items)
      .set({ 
        status: "archived", 
        dateArchived: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(items.status, "active"),
          lte(items.dateFound, cutoffDate)
        )
      );
    
    return result.rowCount || 0;
  }

  // Claim operations
  async getClaims(filters?: { 
    status?: string; 
    itemId?: number; 
    studentId?: string 
  }): Promise<Claim[]> {
    let query = db.select().from(claims);
    
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(claims.status, filters.status as any));
    }
    
    if (filters?.itemId) {
      conditions.push(eq(claims.itemId, filters.itemId));
    }
    
    if (filters?.studentId) {
      conditions.push(eq(claims.studentId, filters.studentId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(claims.createdAt));
  }

  async getClaim(id: number): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim;
  }

  async createClaim(claim: InsertClaim): Promise<Claim> {
    const [newClaim] = await db
      .insert(claims)
      .values(claim)
      .returning();
    return newClaim;
  }

  async updateClaim(id: number, updates: UpdateClaim): Promise<Claim | undefined> {
    const [updatedClaim] = await db
      .update(claims)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(claims.id, id))
      .returning();
    return updatedClaim;
  }

  // Notification operations
  async getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    let query = db.select().from(notifications);
    
    if (unreadOnly) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.read, false))) as any;
    } else {
      query = query.where(eq(notifications.userId, userId)) as any;
    }
    
    return await query.orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  // Analytics operations
  async getAnalytics(): Promise<{
    totalItems: number;
    itemsReturned: number;
    pendingClaims: number;
    recoveryRate: number;
    categoryStats: Array<{ category: string; count: number }>;
    locationStats: Array<{ location: string; count: number }>;
  }> {
    const [totalItemsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items);
    
    const [itemsReturnedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(eq(items.status, "claimed"));
    
    const [pendingClaimsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(claims)
      .where(eq(claims.status, "pending"));
    
    const categoryStats = await db
      .select({
        category: items.category,
        count: sql<number>`count(*)`
      })
      .from(items)
      .groupBy(items.category)
      .orderBy(desc(sql`count(*)`));
    
    const locationStats = await db
      .select({
        location: items.location,
        count: sql<number>`count(*)`
      })
      .from(items)
      .groupBy(items.location)
      .orderBy(desc(sql`count(*)`));
    
    const totalItems = totalItemsResult.count;
    const itemsReturned = itemsReturnedResult.count;
    const recoveryRate = totalItems > 0 ? (itemsReturned / totalItems) * 100 : 0;
    
    return {
      totalItems,
      itemsReturned,
      pendingClaims: pendingClaimsResult.count,
      recoveryRate: Math.round(recoveryRate * 100) / 100,
      categoryStats,
      locationStats,
    };
  }
}

export const storage = new DatabaseStorage();
