import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  decimal,
  boolean,
  primaryKey,
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - Updated for Replit Auth compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(), // Required by Replit Auth, nullable
  firstName: varchar("first_name"), // Required by Replit Auth, nullable
  lastName: varchar("last_name"), // Required by Replit Auth, nullable  
  profileImageUrl: varchar("profile_image_url"), // Required by Replit Auth, nullable
  // Additional fields for our application
  username: text("username").unique(),
  fullName: text("full_name"),
  major: text("major"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(), // Required by Replit Auth
});

// Resources table
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  semester: text("semester"),
  fileType: text("file_type").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  uploadedById: varchar("uploaded_by_id").references(() => users.id).notNull(),
  downloadCount: integer("download_count").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  ratingCount: integer("rating_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ratings table
export const ratings = pgTable("ratings", {
  resourceId: varchar("resource_id").references(() => resources.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Ensure one rating per user per resource
  pk: primaryKey({ columns: [table.resourceId, table.userId] }),
}));

// Tags table
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Resource-Tags junction table
export const resourceTags = pgTable("resource_tags", {
  resourceId: varchar("resource_id").references(() => resources.id).notNull(),
  tagId: varchar("tag_id").references(() => tags.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.resourceId, table.tagId] }),
}));

// Favorites table
export const favorites = pgTable("favorites", {
  userId: varchar("user_id").references(() => users.id).notNull(),
  resourceId: varchar("resource_id").references(() => resources.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Ensure one favorite per user per resource
  pk: primaryKey({ columns: [table.userId, table.resourceId] }),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  resources: many(resources),
  ratings: many(ratings),
  favorites: many(favorites),
}));

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  uploadedBy: one(users, {
    fields: [resources.uploadedById],
    references: [users.id],
  }),
  ratings: many(ratings),
  resourceTags: many(resourceTags),
  favorites: many(favorites),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  resource: one(resources, {
    fields: [ratings.resourceId],
    references: [resources.id],
  }),
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  resourceTags: many(resourceTags),
}));

export const resourceTagsRelations = relations(resourceTags, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceTags.resourceId],
    references: [resources.id],
  }),
  tag: one(tags, {
    fields: [resourceTags.tagId],
    references: [tags.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  resource: one(resources, {
    fields: [favorites.resourceId],
    references: [resources.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  major: true,
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  title: true,
  description: true,
  subject: true,
  semester: true,
  fileType: true,
  fileName: true,
  fileSize: true,
  filePath: true,
  uploadedById: true,
});

export const insertRatingSchema = createInsertSchema(ratings).pick({
  resourceId: true,
  userId: true,
  rating: true,
  review: true,
});

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  resourceId: true,
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert; // Required by Replit Auth

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Extended types with relations
export type ResourceWithDetails = Omit<Resource, "averageRating" | "ratingCount"> & {
  uploadedBy: User;
  ratings: Rating[];
  resourceTags: (typeof resourceTags.$inferSelect & { tag: Tag })[];
  averageRating: number;
  ratingCount: number;
};

export type UserWithStats = User & {
  resourceCount: number;
  totalDownloads: number;
  averageRating: number;
};
