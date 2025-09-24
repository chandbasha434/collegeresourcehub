import { 
  users, 
  resources,
  ratings,
  tags,
  resourceTags,
  favorites,
  type User, 
  type InsertUser,
  type UpsertUser,
  type Resource,
  type InsertResource,
  type Rating,
  type InsertRating,
  type Tag,
  type InsertTag,
  type Favorite,
  type InsertFavorite,
  type ResourceWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, gte, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (including Replit Auth required methods)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>; // Required by Replit Auth
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resource operations
  getResource(id: string): Promise<Resource | undefined>;
  getResourceWithDetails(id: string): Promise<ResourceWithDetails | undefined>;
  getResources(options?: {
    limit?: number;
    offset?: number;
    subject?: string;
    semester?: string;
    minRating?: number;
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'rating' | 'downloads' | 'relevance';
    userId?: string; // For user's own resources
  }): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, updates: Partial<Resource>): Promise<Resource | undefined>;
  deleteResource(id: string): Promise<boolean>;
  incrementDownloadCount(id: string): Promise<void>;
  
  // Rating operations
  getRating(resourceId: string, userId: string): Promise<Rating | undefined>;
  getRatingsForResource(resourceId: string): Promise<Rating[]>;
  createOrUpdateRating(rating: InsertRating): Promise<Rating>;
  deleteRating(resourceId: string, userId: string): Promise<boolean>;
  updateResourceRatingStats(resourceId: string): Promise<void>;
  
  // Tag operations
  getTag(id: string): Promise<Tag | undefined>;
  getTagByName(name: string): Promise<Tag | undefined>;
  getTags(): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  getOrCreateTag(name: string): Promise<Tag>;
  
  // Resource-Tag operations
  addTagToResource(resourceId: string, tagId: string): Promise<void>;
  removeTagFromResource(resourceId: string, tagId: string): Promise<void>;
  getTagsForResource(resourceId: string): Promise<Tag[]>;
  
  // Favorite operations
  getFavorite(userId: string, resourceId: string): Promise<Favorite | undefined>;
  getUserFavorites(userId: string): Promise<Resource[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, resourceId: string): Promise<boolean>;
  
  // Stats operations
  getDashboardStats(): Promise<{
    totalResources: number;
    totalDownloads: number;
    averageRating: number;
    activeUsers: number;
  }>;
  getUserStats(userId: string): Promise<{
    uploadedCount: number;
    totalDownloads: number;
    averageRating: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  // Resource operations
  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  async getResourceWithDetails(id: string): Promise<ResourceWithDetails | undefined> {
    const result = await db.query.resources.findFirst({
      where: eq(resources.id, id),
      with: {
        uploadedBy: true,
        ratings: true,
        resourceTags: {
          with: {
            tag: true
          }
        }
      }
    });
    
    if (!result) return undefined;
    
    return {
      ...result,
      averageRating: parseFloat(result.averageRating || "0"),
      ratingCount: result.ratingCount || 0,
    } as ResourceWithDetails;
  }

  async getResources(options: {
    limit?: number;
    offset?: number;
    subject?: string;
    semester?: string;
    minRating?: number;
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'rating' | 'downloads' | 'relevance';
    userId?: string;
  } = {}): Promise<Resource[]> {
    const {
      limit = 50,
      offset = 0,
      subject,
      semester,
      minRating,
      search,
      sortBy = 'newest',
      userId
    } = options;

    // Build conditions array
    const conditions = [eq(resources.isActive, true)];
    
    if (subject) {
      conditions.push(eq(resources.subject, subject));
    }
    
    if (semester) {
      conditions.push(eq(resources.semester, semester));
    }
    
    if (minRating) {
      conditions.push(gte(resources.averageRating, minRating.toString()));
    }
    
    if (search) {
      conditions.push(
        sql`(${resources.title} ILIKE ${`%${search}%`} OR ${resources.description} ILIKE ${`%${search}%`})`
      );
    }
    
    if (userId) {
      conditions.push(eq(resources.uploadedById, userId));
    }

    // Build where clause
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    // Build order by clause
    let orderBy;
    switch (sortBy) {
      case 'oldest':
        orderBy = resources.createdAt;
        break;
      case 'rating':
        orderBy = desc(resources.averageRating);
        break;
      case 'downloads':
        orderBy = desc(resources.downloadCount);
        break;
      case 'newest':
      default:
        orderBy = desc(resources.createdAt);
        break;
    }

    // Execute query
    return await db
      .select()
      .from(resources)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db
      .insert(resources)
      .values({
        ...insertResource,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return resource;
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource | undefined> {
    const [resource] = await db
      .update(resources)
      .set({ 
        ...updates, 
        updatedAt: new Date() 
      })
      .where(eq(resources.id, id))
      .returning();
    return resource || undefined;
  }

  async deleteResource(id: string): Promise<boolean> {
    const result = await db
      .update(resources)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(resources.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await db
      .update(resources)
      .set({ 
        downloadCount: sql`${resources.downloadCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(resources.id, id));
  }

  // Rating operations
  async getRating(resourceId: string, userId: string): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.resourceId, resourceId), eq(ratings.userId, userId)));
    return rating || undefined;
  }

  async getRatingsForResource(resourceId: string): Promise<Rating[]> {
    return db.select().from(ratings).where(eq(ratings.resourceId, resourceId));
  }

  async createOrUpdateRating(insertRating: InsertRating): Promise<Rating> {
    const [rating] = await db
      .insert(ratings)
      .values({
        ...insertRating,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [ratings.resourceId, ratings.userId],
        set: {
          rating: insertRating.rating,
          review: insertRating.review,
          updatedAt: new Date(),
        }
      })
      .returning();

    // Update resource rating stats
    await this.updateResourceRatingStats(insertRating.resourceId);
    
    return rating;
  }

  async deleteRating(resourceId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(ratings)
      .where(and(eq(ratings.resourceId, resourceId), eq(ratings.userId, userId)));
    
    if ((result.rowCount ?? 0) > 0) {
      await this.updateResourceRatingStats(resourceId);
    }
    
    return (result.rowCount ?? 0) > 0;
  }

  async updateResourceRatingStats(resourceId: string): Promise<void> {
    const [stats] = await db
      .select({
        avgRating: sql<number>`AVG(${ratings.rating})`,
        ratingCount: sql<number>`COUNT(${ratings.rating})`,
      })
      .from(ratings)
      .where(eq(ratings.resourceId, resourceId));

    await db
      .update(resources)
      .set({
        averageRating: stats.avgRating ? stats.avgRating.toString() : "0",
        ratingCount: stats.ratingCount || 0,
        updatedAt: new Date(),
      })
      .where(eq(resources.id, resourceId));
  }

  // Tag operations
  async getTag(id: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag || undefined;
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.name, name));
    return tag || undefined;
  }

  async getTags(): Promise<Tag[]> {
    return db.select().from(tags);
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db
      .insert(tags)
      .values({
        ...insertTag,
        createdAt: new Date(),
      })
      .returning();
    return tag;
  }

  async getOrCreateTag(name: string): Promise<Tag> {
    const existingTag = await this.getTagByName(name);
    if (existingTag) return existingTag;
    
    return this.createTag({ name });
  }

  // Resource-Tag operations
  async addTagToResource(resourceId: string, tagId: string): Promise<void> {
    await db
      .insert(resourceTags)
      .values({
        resourceId,
        tagId,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  }

  async removeTagFromResource(resourceId: string, tagId: string): Promise<void> {
    await db
      .delete(resourceTags)
      .where(and(eq(resourceTags.resourceId, resourceId), eq(resourceTags.tagId, tagId)));
  }

  async getTagsForResource(resourceId: string): Promise<Tag[]> {
    const result = await db
      .select({ tag: tags })
      .from(resourceTags)
      .innerJoin(tags, eq(resourceTags.tagId, tags.id))
      .where(eq(resourceTags.resourceId, resourceId));
    
    return result.map(row => row.tag);
  }

  // Favorite operations
  async getFavorite(userId: string, resourceId: string): Promise<Favorite | undefined> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.resourceId, resourceId)));
    return favorite || undefined;
  }

  async getUserFavorites(userId: string): Promise<Resource[]> {
    const result = await db
      .select({ resource: resources })
      .from(favorites)
      .innerJoin(resources, eq(favorites.resourceId, resources.id))
      .where(and(eq(favorites.userId, userId), eq(resources.isActive, true)));
    
    return result.map(row => row.resource);
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({
        ...insertFavorite,
        createdAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, resourceId: string): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.resourceId, resourceId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Stats operations
  async getDashboardStats(): Promise<{
    totalResources: number;
    totalDownloads: number;
    averageRating: number;
    activeUsers: number;
  }> {
    const [resourceStats] = await db
      .select({
        totalResources: sql<number>`COUNT(*)`,
        totalDownloads: sql<number>`SUM(${resources.downloadCount})`,
        averageRating: sql<number>`AVG(${resources.averageRating})`,
      })
      .from(resources)
      .where(eq(resources.isActive, true));

    const [userStats] = await db
      .select({
        activeUsers: sql<number>`COUNT(DISTINCT ${resources.uploadedById})`,
      })
      .from(resources)
      .where(eq(resources.isActive, true));

    return {
      totalResources: resourceStats.totalResources || 0,
      totalDownloads: resourceStats.totalDownloads || 0,
      averageRating: resourceStats.averageRating || 0,
      activeUsers: userStats.activeUsers || 0,
    };
  }

  async getUserStats(userId: string): Promise<{
    uploadedCount: number;
    totalDownloads: number;
    averageRating: number;
  }> {
    const [stats] = await db
      .select({
        uploadedCount: sql<number>`COUNT(*)`,
        totalDownloads: sql<number>`SUM(${resources.downloadCount})`,
        averageRating: sql<number>`AVG(${resources.averageRating})`,
      })
      .from(resources)
      .where(and(eq(resources.uploadedById, userId), eq(resources.isActive, true)));

    return {
      uploadedCount: stats.uploadedCount || 0,
      totalDownloads: stats.totalDownloads || 0,
      averageRating: stats.averageRating || 0,
    };
  }
}

export const storage = new DatabaseStorage();
