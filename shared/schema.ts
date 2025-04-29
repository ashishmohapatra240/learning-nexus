import { pgTable, text, serial, integer, timestamp, boolean, unique, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table (for both L&D pros and companies)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  userType: text("user_type").notNull(), // "professional", "company", or "admin"
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionTier: text("subscription_tier"), // "free", "basic", "premium"
  subscriptionStatus: text("subscription_status"), // "active", "trialing", "past_due", "canceled"
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpiry: timestamp("email_verification_expiry"),
  profilePhotoUrl: text("profile_photo_url"),
  googleId: text("google_id"),
  linkedinId: text("linkedin_id"),
  // New fields for admin user management
  blocked: boolean("blocked").default(false),
  blockReason: text("block_reason"),
  lastActiveAt: timestamp("last_active_at"),
  deleted: boolean("deleted").default(false),
  deletedAt: timestamp("deleted_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Professional Profiles
export const professionalProfiles = pgTable("professional_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  firstName: text("first_name"), // Added first name field
  lastName: text("last_name"), // Added last name field
  title: text("title"),
  bio: text("bio"),
  location: text("location"),
  videoIntroUrl: text("video_intro_url"),
  ratePerHour: integer("rate_per_hour"),
  profileImageUrl: text("profile_image_url"),
  profileImagePath: text("profile_image_path"), // For uploaded files
  galleryImages: jsonb("gallery_images"), // Array of image paths for portfolio/gallery
  featured: boolean("featured").default(false),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  yearsExperience: integer("years_experience").default(0),
  interests: text("interests"),
  industryFocus: text("industry_focus"),
  services: text("services"), // Services offered 
  availability: text("availability"), // Contact availability information
  email: text("contact_email"), // Professional contact email
  phone: text("contact_phone"), // Professional contact phone
  workExperience: jsonb("work_experience"), // Work experience as JSON array
  testimonials: jsonb("testimonials"), // Client testimonials as JSON array
  verified: boolean("verified").default(false), // Whether profile has been verified by admin
});

export const insertProfessionalProfileSchema = createInsertSchema(professionalProfiles).omit({
  id: true,
});

// Professional Expertise
export const expertise = pgTable("expertise", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertExpertiseSchema = createInsertSchema(expertise).omit({
  id: true,
});

// Professional-Expertise Relationship
export const professionalExpertise = pgTable("professional_expertise", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionalProfiles.id),
  expertiseId: integer("expertise_id").notNull().references(() => expertise.id),
}, (table) => {
  return {
    unq: unique().on(table.professionalId, table.expertiseId),
  }
});

export const insertProfessionalExpertiseSchema = createInsertSchema(professionalExpertise).omit({
  id: true,
});

// Certifications
export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionalProfiles.id),
  name: text("name").notNull(),
  issuer: text("issuer").notNull(),
  year: integer("year").notNull(),
});

export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
});

// Company Profiles
export const companyProfiles = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  industry: text("industry").notNull(),
  description: text("description").notNull(),
  website: text("website"),
  logoUrl: text("logo_url"),
  logoImagePath: text("logo_image_path"), // For uploaded files
  size: text("size").notNull(), // "small", "medium", "large", "enterprise"
  location: text("location").notNull(),
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
});

export const insertCompanyProfileSchema = createInsertSchema(companyProfiles).omit({
  id: true,
});

// Job Postings
export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companyProfiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  jobType: text("job_type").notNull(), // "full-time", "part-time", "contract", "freelance"
  minCompensation: integer("min_compensation"),
  maxCompensation: integer("max_compensation"),
  compensationUnit: text("compensation_unit"), // "hourly", "project", "yearly"
  duration: text("duration"), // For contracts
  requirements: text("requirements").notNull(),
  remote: boolean("remote").default(false),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  status: text("status").notNull().default("open"), // "open", "closed", "filled"
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
});

// Job Applications
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobPostings.id),
  professionalId: integer("professional_id").notNull().references(() => professionalProfiles.id),
  coverLetter: text("cover_letter").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "reviewed", "accepted", "rejected"
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.jobId, table.professionalId),
  }
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
});

// Resource Categories
export const resourceCategories = pgTable("resource_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const insertResourceCategorySchema = createInsertSchema(resourceCategories).omit({
  id: true,
});

// Resources
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),  // This field will store the URL for now
  contentUrl: text("content_url"),     // URL for external content
  filePath: text("file_path"),         // Path to the uploaded file
  resourceType: text("resource_type").notNull(), // "article", "template", "video", "webinar"
  categoryId: integer("category_id").references(() => resourceCategories.id),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

// Forum Posts
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
});

// Forum Comments
export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => forumPosts.id),
  authorId: integer("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertForumCommentSchema = createInsertSchema(forumComments).omit({
  id: true,
  createdAt: true,
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  read: true,
});

// Consultations
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionalProfiles.id),
  companyId: integer("company_id").notNull().references(() => companyProfiles.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("scheduled"), // "scheduled", "completed", "cancelled"
  notes: text("notes"),
  rate: integer("rate").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type InsertProfessionalProfile = z.infer<typeof insertProfessionalProfileSchema>;

export type Expertise = typeof expertise.$inferSelect;
export type InsertExpertise = z.infer<typeof insertExpertiseSchema>;

export type ProfessionalExpertise = typeof professionalExpertise.$inferSelect;
export type InsertProfessionalExpertise = z.infer<typeof insertProfessionalExpertiseSchema>;

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;

export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;

export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;

export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;

export type ResourceCategory = typeof resourceCategories.$inferSelect;
export type InsertResourceCategory = z.infer<typeof insertResourceCategorySchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

export type ForumComment = typeof forumComments.$inferSelect;
export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;

// Skill Recommendations
export const skillRecommendations = pgTable("skill_recommendations", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionalProfiles.id),
  recommendations: jsonb("recommendations").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSkillRecommendationSchema = createInsertSchema(skillRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SkillRecommendation = typeof skillRecommendations.$inferSelect;
export type InsertSkillRecommendation = z.infer<typeof insertSkillRecommendationSchema>;

// Page Content Management
export const pageContents = pgTable("page_contents", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // Identifies the page or content section
  title: text("title").notNull(),
  content: text("content").notNull(),
  lastEditedBy: integer("last_edited_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPageContentSchema = createInsertSchema(pageContents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PageContent = typeof pageContents.$inferSelect;
export type InsertPageContent = z.infer<typeof insertPageContentSchema>;

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionalProfiles.id),
  companyId: integer("company_id").notNull().references(() => companyProfiles.id),
  consultationId: integer("consultation_id").references(() => consultations.id),
  rating: integer("rating").notNull(), // 1-5 star rating
  comment: text("comment"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Notifications
export const notificationTypes = pgTable("notification_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const insertNotificationTypeSchema = createInsertSchema(notificationTypes).omit({
  id: true,
});

export type NotificationType = typeof notificationTypes.$inferSelect;
export type InsertNotificationType = z.infer<typeof insertNotificationTypeSchema>;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  typeId: integer("type_id").notNull().references(() => notificationTypes.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  read: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Import the AdminRole enum from our admin types
import { AdminRole } from "../server/admin/types/admin.types";

// Admin Users
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().$type<AdminRole>(), // Using the AdminRole enum
  customPermissions: jsonb("custom_permissions"), // Array of permission strings
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  twoFactorSecret: text("two_factor_secret"),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

// Admin Refresh Tokens
export const adminRefreshTokens = pgTable("admin_refresh_tokens", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => adminUsers.id),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});

export const insertAdminRefreshTokenSchema = createInsertSchema(adminRefreshTokens).omit({
  id: true,
  createdAt: true,
});

// Admin Action Logs
export const adminActionLogs = pgTable("admin_action_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => adminUsers.id),
  adminUsername: text("admin_username").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAdminActionLogSchema = createInsertSchema(adminActionLogs).omit({
  id: true,
});

// Admin Activity Logs
export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => adminUsers.id),
  method: text("method").notNull(),
  path: text("path").notNull(),
  statusCode: integer("status_code"),
  executionTime: integer("execution_time"), // in milliseconds
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLogs).omit({
  id: true,
});

// Admin Login Attempts
export const adminLoginAttempts = pgTable("admin_login_attempts", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => adminUsers.id),
  success: boolean("success").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAdminLoginAttemptSchema = createInsertSchema(adminLoginAttempts).omit({
  id: true,
});

// Export admin types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type AdminRefreshToken = typeof adminRefreshTokens.$inferSelect;
export type InsertAdminRefreshToken = z.infer<typeof insertAdminRefreshTokenSchema>;

export type AdminActionLog = typeof adminActionLogs.$inferSelect;
export type InsertAdminActionLog = z.infer<typeof insertAdminActionLogSchema>;

export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;

export type AdminLoginAttempt = typeof adminLoginAttempts.$inferSelect;
export type InsertAdminLoginAttempt = z.infer<typeof insertAdminLoginAttemptSchema>;

// User Notification Preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  typeId: integer("type_id").notNull().references(() => notificationTypes.id),
  email: boolean("email").default(true).notNull(),
  inApp: boolean("in_app").default(true).notNull(),
}, (table) => {
  return {
    unq: unique().on(table.userId, table.typeId),
  }
});

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;