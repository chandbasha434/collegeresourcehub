import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertResourceSchema, 
  insertRatingSchema, 
  insertFavoriteSchema,
  insertTagSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Validate that user claims exist and have required fields
      if (!req.user || !req.user.claims || !req.user.claims.sub) {
        console.error("Invalid user session - missing claims");
        return res.status(401).json({ message: "Invalid session" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.error("User not found in database:", userId);
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Protected route example - can be used for testing auth
  app.get("/api/protected", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    res.json({ 
      message: "This is a protected route", 
      userId,
      user: req.user.claims 
    });
  });

  // Resource CRUD Routes
  
  // GET /api/resources - Get filtered resources
  app.get('/api/resources', async (req, res) => {
    try {
      const {
        limit,
        offset,
        subject,
        semester,
        minRating,
        search,
        sortBy,
        userId
      } = req.query;
      
      const resources = await storage.getResources({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        subject: subject as string,
        semester: semester as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        search: search as string,
        sortBy: sortBy as 'newest' | 'oldest' | 'rating' | 'downloads' | 'relevance',
        userId: userId as string
      });
      
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // GET /api/resources/:id - Get resource with details
  app.get('/api/resources/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const resource = await storage.getResourceWithDetails(id);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(resource);
    } catch (error) {
      console.error("Error fetching resource:", error);
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });

  // POST /api/resources - Create new resource (protected)
  app.post('/api/resources', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resourceData = insertResourceSchema.parse({
        ...req.body,
        uploadedById: userId
      });
      
      // For now, mock file handling - in production you'd handle file upload here
      const mockFileData = {
        fileName: req.body.fileName || 'mock-file.pdf',
        fileSize: req.body.fileSize || 1024000, // 1MB
        fileType: req.body.fileType || 'application/pdf',
        filePath: `/uploads/${userId}/${Date.now()}-${req.body.fileName || 'mock-file.pdf'}`
      };
      
      const resource = await storage.createResource({
        ...resourceData,
        ...mockFileData
      });
      
      res.status(201).json(resource);
    } catch (error) {
      console.error("Error creating resource:", error);
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  // PUT /api/resources/:id - Update resource (protected, owner only)
  app.put('/api/resources/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Check if resource exists and user owns it
      const existingResource = await storage.getResource(id);
      if (!existingResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      if (existingResource.uploadedById !== userId) {
        return res.status(403).json({ message: "Not authorized to update this resource" });
      }
      
      const updates = {
        title: req.body.title,
        description: req.body.description,
        subject: req.body.subject,
        semester: req.body.semester
      };
      
      const updatedResource = await storage.updateResource(id, updates);
      res.json(updatedResource);
    } catch (error) {
      console.error("Error updating resource:", error);
      res.status(500).json({ message: "Failed to update resource" });
    }
  });

  // DELETE /api/resources/:id - Delete resource (protected, owner only)
  app.delete('/api/resources/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Check if resource exists and user owns it
      const existingResource = await storage.getResource(id);
      if (!existingResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      if (existingResource.uploadedById !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this resource" });
      }
      
      const success = await storage.deleteResource(id);
      if (success) {
        res.json({ message: "Resource deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete resource" });
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      res.status(500).json({ message: "Failed to delete resource" });
    }
  });

  // POST /api/resources/:id/download - Increment download count
  app.post('/api/resources/:id/download', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if resource exists
      const resource = await storage.getResource(id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      await storage.incrementDownloadCount(id);
      res.json({ message: "Download count updated" });
    } catch (error) {
      console.error("Error updating download count:", error);
      res.status(500).json({ message: "Failed to update download count" });
    }
  });

  // Rating Routes

  // GET /api/resources/:id/ratings - Get ratings for resource
  app.get('/api/resources/:id/ratings', async (req, res) => {
    try {
      const { id } = req.params;
      const ratings = await storage.getRatingsForResource(id);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  // POST /api/resources/:id/ratings - Create/update rating (protected)
  app.post('/api/resources/:id/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const ratingData = insertRatingSchema.parse({
        ...req.body,
        resourceId: id,
        userId
      });
      
      const rating = await storage.createOrUpdateRating(ratingData);
      res.json(rating);
    } catch (error) {
      console.error("Error creating/updating rating:", error);
      res.status(500).json({ message: "Failed to create/update rating" });
    }
  });

  // DELETE /api/resources/:id/ratings - Delete user's rating (protected)
  app.delete('/api/resources/:id/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const success = await storage.deleteRating(id, userId);
      if (success) {
        res.json({ message: "Rating deleted successfully" });
      } else {
        res.status(404).json({ message: "Rating not found" });
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      res.status(500).json({ message: "Failed to delete rating" });
    }
  });

  // Favorite Routes

  // GET /api/users/me/favorites - Get user's favorites (protected)
  app.get('/api/users/me/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // POST /api/resources/:id/favorites - Add to favorites (protected)
  app.post('/api/resources/:id/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const favoriteData = insertFavoriteSchema.parse({
        userId,
        resourceId: id
      });
      
      const favorite = await storage.addFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  // DELETE /api/resources/:id/favorites - Remove from favorites (protected)
  app.delete('/api/resources/:id/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const success = await storage.removeFavorite(userId, id);
      if (success) {
        res.json({ message: "Favorite removed successfully" });
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Tag Routes

  // GET /api/tags - Get all tags
  app.get('/api/tags', async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  // GET /api/resources/:id/tags - Get tags for resource
  app.get('/api/resources/:id/tags', async (req, res) => {
    try {
      const { id } = req.params;
      const tags = await storage.getTagsForResource(id);
      res.json(tags);
    } catch (error) {
      console.error("Error fetching resource tags:", error);
      res.status(500).json({ message: "Failed to fetch resource tags" });
    }
  });

  // POST /api/resources/:id/tags - Add tag to resource (protected, owner only)
  app.post('/api/resources/:id/tags', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { tagName } = req.body;
      
      // Check if resource exists and user owns it
      const existingResource = await storage.getResource(id);
      if (!existingResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      if (existingResource.uploadedById !== userId) {
        return res.status(403).json({ message: "Not authorized to modify this resource" });
      }
      
      // Get or create tag
      const tag = await storage.getOrCreateTag(tagName);
      
      // Add tag to resource
      await storage.addTagToResource(id, tag.id);
      
      res.json(tag);
    } catch (error) {
      console.error("Error adding tag to resource:", error);
      res.status(500).json({ message: "Failed to add tag to resource" });
    }
  });

  // DELETE /api/resources/:id/tags/:tagId - Remove tag from resource (protected, owner only)
  app.delete('/api/resources/:id/tags/:tagId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id, tagId } = req.params;
      
      // Check if resource exists and user owns it
      const existingResource = await storage.getResource(id);
      if (!existingResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      if (existingResource.uploadedById !== userId) {
        return res.status(403).json({ message: "Not authorized to modify this resource" });
      }
      
      await storage.removeTagFromResource(id, tagId);
      res.json({ message: "Tag removed from resource" });
    } catch (error) {
      console.error("Error removing tag from resource:", error);
      res.status(500).json({ message: "Failed to remove tag from resource" });
    }
  });

  // Stats Routes

  // GET /api/stats - Get dashboard stats
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // GET /api/users/me/stats - Get user stats (protected)
  app.get('/api/users/me/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
