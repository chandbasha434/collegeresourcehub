import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertResourceSchema, 
  insertRatingSchema, 
  insertFavoriteSchema,
  insertTagSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req: any, file, cb) => {
        const userId = req.user?.claims?.sub;
        const userUploadDir = path.join(uploadDir, userId || 'anonymous');
        if (!fs.existsSync(userUploadDir)) {
          fs.mkdirSync(userUploadDir, { recursive: true });
        }
        cb(null, userUploadDir);
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, `${timestamp}-${sanitizedName}`);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Allow PDF, Word docs, and images
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg', 
        'image/png'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, Word documents, and images are allowed.'));
      }
    }
  });

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

  // POST /api/resources - Create new resource with file upload (protected)
  app.post('/api/resources', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Parse tags if provided
      let tags: string[] = [];
      if (req.body.tags) {
        try {
          tags = JSON.parse(req.body.tags);
        } catch (e) {
          console.warn("Failed to parse tags:", e);
        }
      }
      
      // Prepare resource data
      const resourceData = insertResourceSchema.parse({
        title: req.body.title,
        description: req.body.description || null,
        subject: req.body.subject,
        semester: req.body.semester || null,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        filePath: req.file.path,
        uploadedById: userId
      });
      
      const resource = await storage.createResource(resourceData);
      
      // Handle tags if provided
      if (tags.length > 0) {
        try {
          for (const tagName of tags) {
            // Create or find the tag
            let tag = await storage.getTagByName(tagName);
            if (!tag) {
              const newTag = insertTagSchema.parse({ name: tagName });
              tag = await storage.createTag(newTag);
            }
            
            // Associate tag with resource
            await storage.addTagToResource(resource.id, tag.id);
          }
        } catch (tagError) {
          console.warn("Failed to process some tags:", tagError);
          // Don't fail the whole request for tag errors
        }
      }
      
      res.status(201).json(resource);
    } catch (error) {
      console.error("Error creating resource:", error);
      
      // Clean up uploaded file if resource creation failed
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error("Failed to cleanup uploaded file:", cleanupError);
        }
      }
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      }
      
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
