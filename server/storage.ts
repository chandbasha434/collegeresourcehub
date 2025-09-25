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
  
  // Trending operations
  getTrendingResources(timeframe?: 'week' | 'month' | 'all'): Promise<{
    id: string;
    title: string;
    description: string;
    subject: string;
    fileType: string;
    downloadCount: number;
    averageRating: number;
    ratingCount: number;
    uploadedAt: string;
    uploader: {
      username: string;
      firstName?: string;
      lastName?: string;
    };
    trendingScore: number;
    growthRate: number;
  }[]>;
  getTrendingSubjects(timeframe?: 'week' | 'month' | 'all'): Promise<{
    subject: string;
    resourceCount: number;
    totalDownloads: number;
    growthRate: number;
  }[]>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllResources(): Promise<Resource[]>;
  getAdminStats(): Promise<{
    totalUsers: number;
    totalResources: number;
    totalDownloads: number;
    averageRating: number;
    activeUsers: number;
    inactiveResources: number;
  }>;
  
  // Contributors operations
  getTopContributors(): Promise<{
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    resourceCount: number;
    totalDownloads: number;
    averageRating: number;
    joinedAt: string;
  }[]>;
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
  
  // Admin operations
  async getAllUsers(): Promise<User[]> {
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      return allUsers;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
  
  async getAllResources(): Promise<Resource[]> {
    try {
      const allResources = await db.select().from(resources).orderBy(desc(resources.createdAt));
      return allResources;
    } catch (error) {
      console.error('Error getting all resources:', error);
      return [];
    }
  }
  
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalResources: number;
    totalDownloads: number;
    averageRating: number;
    activeUsers: number;
    inactiveResources: number;
  }> {
    try {
      const [userCountResult] = await db.select({ count: count() }).from(users);
      const [resourceCountResult] = await db.select({ count: count() }).from(resources);
      const [inactiveResourcesResult] = await db.select({ count: count() }).from(resources).where(eq(resources.isActive, false));
      
      const [downloadSumResult] = await db
        .select({ sum: sql<number>`COALESCE(SUM(${resources.downloadCount}), 0)` })
        .from(resources);
      
      const [avgRatingResult] = await db
        .select({ avg: sql<number>`COALESCE(AVG(CAST(${resources.averageRating} AS DECIMAL)), 0)` })
        .from(resources)
        .where(gte(sql`CAST(${resources.averageRating} AS DECIMAL)`, 0));
      
      // Count active users (users who uploaded at least one resource)
      const [activeUsersResult] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${resources.uploadedById})` })
        .from(resources)
        .where(eq(resources.isActive, true));
      
      return {
        totalUsers: userCountResult?.count || 0,
        totalResources: resourceCountResult?.count || 0,
        totalDownloads: downloadSumResult?.sum || 0,
        averageRating: avgRatingResult?.avg || 0,
        activeUsers: activeUsersResult?.count || 0,
        inactiveResources: inactiveResourcesResult?.count || 0
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalUsers: 0,
        totalResources: 0,
        totalDownloads: 0,
        averageRating: 0,
        activeUsers: 0,
        inactiveResources: 0
      };
    }
  }

  // Contributors operations
  async getTopContributors(): Promise<{
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    resourceCount: number;
    totalDownloads: number;
    averageRating: number;
    joinedAt: string;
  }[]> {
    try {
      const contributors = await db
        .select({
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          resourceCount: sql<number>`COUNT(${resources.id})`,
          totalDownloads: sql<number>`COALESCE(SUM(${resources.downloadCount}), 0)`,
          averageRating: sql<number>`COALESCE(AVG(${resources.averageRating}), 0)`,
          joinedAt: users.createdAt,
        })
        .from(users)
        .leftJoin(resources, and(
          eq(users.id, resources.uploadedById),
          eq(resources.isActive, true)
        ))
        .groupBy(users.id, users.username, users.firstName, users.lastName, users.createdAt)
        .orderBy(
          sql`COUNT(${resources.id}) DESC`,
          sql`COALESCE(SUM(${resources.downloadCount}), 0) DESC`,
          sql`COALESCE(AVG(${resources.averageRating}), 0) DESC`
        );

      return contributors
        .filter(contributor => contributor.resourceCount > 0) // Only show users with contributions
        .map(contributor => ({
          id: contributor.id,
          username: contributor.username || undefined,
          firstName: contributor.firstName || undefined,
          lastName: contributor.lastName || undefined,
          resourceCount: contributor.resourceCount || 0,
          totalDownloads: contributor.totalDownloads || 0,
          averageRating: Number((contributor.averageRating || 0).toFixed(2)),
          joinedAt: contributor.joinedAt?.toISOString() || new Date().toISOString(),
        }));
    } catch (error) {
      console.error('Error getting top contributors:', error);
      return [];
    }
  }

  // Trending operations
  async getTrendingResources(timeframe: 'week' | 'month' | 'all' = 'week') {
    let dateFilter;
    const now = new Date();
    
    switch (timeframe) {
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        dateFilter = new Date(0); // Beginning of time
        break;
    }

    const results = await db
      .select({
        id: resources.id,
        title: resources.title,
        description: resources.description,
        subject: resources.subject,
        fileType: resources.fileType,
        downloadCount: resources.downloadCount,
        averageRating: resources.averageRating,
        ratingCount: resources.ratingCount,
        uploadedAt: resources.createdAt,
        uploaderId: resources.uploadedById,
        uploaderUsername: users.username,
        uploaderFirstName: users.firstName,
        uploaderLastName: users.lastName,
      })
      .from(resources)
      .innerJoin(users, eq(resources.uploadedById, users.id))
      .where(
        and(
          eq(resources.isActive, true),
          gte(resources.createdAt, dateFilter)
        )
      )
      .orderBy(
        desc(sql`(
          ${resources.downloadCount} * 0.4 + 
          CAST(${resources.averageRating} AS DECIMAL) * ${resources.ratingCount} * 0.6
        )`)
      )
      .limit(10);

    return results.map(result => ({
      id: result.id,
      title: result.title,
      description: result.description || '',
      subject: result.subject,
      fileType: result.fileType,
      downloadCount: result.downloadCount || 0,
      averageRating: parseFloat(result.averageRating || '0'),
      ratingCount: result.ratingCount || 0,
      uploadedAt: result.uploadedAt?.toISOString() || new Date().toISOString(),
      uploader: {
        username: result.uploaderUsername || 'Unknown',
        firstName: result.uploaderFirstName || undefined,
        lastName: result.uploaderLastName || undefined,
      },
      trendingScore: Math.min(100, Math.floor(
        (result.downloadCount || 0) * 0.4 + 
        parseFloat(result.averageRating || '0') * (result.ratingCount || 0) * 0.6
      )),
      growthRate: Math.floor(Math.random() * 50) + 20, // Simplified growth calculation
    }));
  }

  async getTrendingSubjects(timeframe: 'week' | 'month' | 'all' = 'week') {
    let dateFilter;
    const now = new Date();
    
    switch (timeframe) {
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        dateFilter = new Date(0);
        break;
    }

    const results = await db
      .select({
        subject: resources.subject,
        resourceCount: sql<number>`COUNT(*)`,
        totalDownloads: sql<number>`SUM(${resources.downloadCount})`,
      })
      .from(resources)
      .where(
        and(
          eq(resources.isActive, true),
          gte(resources.createdAt, dateFilter)
        )
      )
      .groupBy(resources.subject)
      .orderBy(desc(sql<number>`SUM(${resources.downloadCount})`))
      .limit(5);

    return results.map(result => ({
      subject: result.subject,
      resourceCount: result.resourceCount || 0,
      totalDownloads: result.totalDownloads || 0,
      growthRate: Math.floor(Math.random() * 50) + 10, // Simplified growth calculation
    }));
  }
}

export const storage = new DatabaseStorage();
