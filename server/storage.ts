import { db, useRealDatabase, pool, getDB } from "./db";
import { and, asc, desc, eq, or, isNull, not, sql, gt, gte, isNotNull } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { AdminRole, AdminPermission } from "./admin/types/admin.types";
import {
  users, User, InsertUser,
  professionalProfiles, ProfessionalProfile, InsertProfessionalProfile,
  expertise, Expertise, InsertExpertise,
  professionalExpertise, ProfessionalExpertise, InsertProfessionalExpertise,
  certifications, Certification, InsertCertification,
  companyProfiles, CompanyProfile, InsertCompanyProfile,
  jobPostings, JobPosting, InsertJobPosting,
  jobApplications, JobApplication, InsertJobApplication,
  resources, Resource, InsertResource,
  resourceCategories, ResourceCategory, InsertResourceCategory,
  forumPosts, ForumPost, InsertForumPost,
  forumComments, ForumComment, InsertForumComment,
  messages, Message, InsertMessage,
  consultations, Consultation, InsertConsultation,
  skillRecommendations, SkillRecommendation, InsertSkillRecommendation,
  pageContents, PageContent, InsertPageContent,
  reviews, Review, InsertReview,
  notifications, Notification, InsertNotification,
  notificationTypes, NotificationType, InsertNotificationType,
  notificationPreferences, NotificationPreference, InsertNotificationPreference,
  // Admin schema types
  adminUsers, AdminUser, InsertAdminUser,
  adminRefreshTokens, AdminRefreshToken, InsertAdminRefreshToken,
  adminActionLogs, AdminActionLog, InsertAdminActionLog,
  adminActivityLogs, AdminActivityLog, InsertAdminActivityLog,
  adminLoginAttempts, AdminLoginAttempt, InsertAdminLoginAttempt
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySocialProvider(provider: string, profileId: string): Promise<User | undefined>;
  linkSocialAccount(userId: number, provider: string, profileId: string): Promise<User | undefined>;
  createUserFromSocial(user: Partial<InsertUser> & { email: string; username: string; password: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Admin User operations
  getAdminUserById(id: number): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: number, userData: Partial<AdminUser>): Promise<AdminUser | undefined>;
  deleteAdminUser(id: number): Promise<boolean>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  
  // Admin Authentication operations
  saveAdminRefreshToken(adminId: number, token: string): Promise<boolean>;
  validateAdminRefreshToken(adminId: number, token: string): Promise<boolean>;
  rotateAdminRefreshToken(adminId: number, oldToken: string, newToken: string): Promise<boolean>;
  invalidateAdminRefreshToken(adminId: number, token: string): Promise<boolean>;
  invalidateAllAdminRefreshTokens(adminId: number): Promise<boolean>;
  updateAdminLastLogin(adminId: number): Promise<boolean>;
  logAdminLoginAttempt(loginAttempt: InsertAdminLoginAttempt): Promise<AdminLoginAttempt>;
  updateAdminPassword(adminId: number, newPassword: string): Promise<boolean>;
  
  // Admin Two-Factor Authentication operations
  saveAdminTOTPSecret(adminId: number, secret: string): Promise<boolean>;
  getAdminTOTPSecret(adminId: number): Promise<string | undefined>;
  enableAdminTwoFactor(adminId: number, secret: string): Promise<boolean>;
  disableAdminTwoFactor(adminId: number): Promise<boolean>;
  
  // Admin Logging operations
  createAdminActionLog(log: InsertAdminActionLog): Promise<AdminActionLog>;
  createAdminActivityLog(log: InsertAdminActivityLog): Promise<AdminActivityLog>;
  getAdminActionLogs(adminId: number, page?: number, pageSize?: number): Promise<{logs: AdminActionLog[], total: number}>;
  
  // User management from admin perspective
  getAllUsersWithPagination(options: {
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
    userType?: string;
    isActive?: boolean;
  }): Promise<{users: User[], total: number}>;
  getUserActivityLogs(userId: number, options: {page: number, pageSize: number}): Promise<{activityLogs: any[], total: number}>;
  resetUserPassword(userId: number, newPassword: string): Promise<boolean>;
  getUserStats(): Promise<{total: number, professionals: number, companies: number, active: number, inactive: number}>;
  getNewUsersCount(since: Date): Promise<number>;
  getActiveUsersCount(since: Date): Promise<number>;
  getUserSubscription(userId: number): Promise<any>;
  getUserTransactions(userId: number): Promise<any[]>;
  
  // Password and account recovery operations
  createResetToken(email: string): Promise<string | null>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  

  
  // Stripe operations
  updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined>;
  updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined>;
  updateUserSubscription(userId: number, tier: string, status: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  
  // AI Matching operations
  getMatchingJobsForProfessional(professionalId: number, limit?: number): Promise<Array<{job: JobPosting, score: number}>>;
  getMatchingProfessionalsForJob(jobId: number, limit?: number): Promise<Array<{professional: ProfessionalProfile, score: number}>>;
  saveJobMatch(jobId: number, professionalId: number, score: number): Promise<boolean>;
  
  // Professional Profile operations
  getProfessionalProfile(id: number): Promise<ProfessionalProfile | undefined>;
  getProfessionalProfileByUserId(userId: number): Promise<ProfessionalProfile | undefined>;
  getAllProfessionalProfiles(): Promise<ProfessionalProfile[]>;
  getFeaturedProfessionalProfiles(limit: number): Promise<ProfessionalProfile[]>;
  createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile>;
  updateProfessionalProfile(id: number, profile: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile | undefined>;
  deleteProfessionalProfile(id: number): Promise<boolean>;
  
  // Expertise operations
  getAllExpertise(): Promise<Expertise[]>;
  getExpertiseById(id: number): Promise<Expertise | undefined>;
  createExpertise(expertise: InsertExpertise): Promise<Expertise>;
  getProfessionalExpertise(professionalId: number): Promise<Expertise[]>;
  addProfessionalExpertise(professionalExpertise: InsertProfessionalExpertise): Promise<ProfessionalExpertise>;
  deleteProfessionalExpertise(id: number): Promise<boolean>;
  
  // Certification operations
  getCertification(id: number): Promise<Certification | undefined>;
  getProfessionalCertifications(professionalId: number): Promise<Certification[]>;
  createCertification(certification: InsertCertification): Promise<Certification>;
  deleteCertification(id: number): Promise<boolean>;
  
  // Company Profile operations
  getCompanyProfile(id: number): Promise<CompanyProfile | undefined>;
  getCompanyProfileByUserId(userId: number): Promise<CompanyProfile | undefined>;
  getAllCompanyProfiles(): Promise<CompanyProfile[]>;
  createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;
  updateCompanyProfile(id: number, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile | undefined>;
  
  // Job Posting operations
  getJobPosting(id: number): Promise<JobPosting | undefined>;
  getAllJobPostings(): Promise<JobPosting[]>;
  getLatestJobPostings(limit: number): Promise<JobPosting[]>;
  getCompanyJobPostings(companyId: number): Promise<JobPosting[]>;
  createJobPosting(job: InsertJobPosting): Promise<JobPosting>;
  updateJobPosting(id: number, job: Partial<InsertJobPosting>): Promise<JobPosting | undefined>;
  deleteJobPosting(id: number): Promise<boolean>;
  
  // Job Application operations
  getJobApplication(id: number): Promise<JobApplication | undefined>;
  getJobApplicationsByJob(jobId: number): Promise<JobApplication[]>;
  getJobApplicationsByProfessional(professionalId: number): Promise<JobApplication[]>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateJobApplicationStatus(id: number, status: string): Promise<JobApplication | undefined>;
  
  // Resource Category operations
  getResourceCategory(id: number): Promise<ResourceCategory | undefined>;
  getAllResourceCategories(): Promise<ResourceCategory[]>;
  createResourceCategory(category: InsertResourceCategory): Promise<ResourceCategory>;
  
  // Resource operations
  getResource(id: number): Promise<Resource | undefined>;
  getAllResources(): Promise<Resource[]>;
  getResourcesByCategory(categoryId: number): Promise<Resource[]>;
  getResourcesByAuthor(authorId: number): Promise<Resource[]>;
  searchResources(query?: string, type?: string, categoryId?: number): Promise<Resource[]>;
  getFeaturedResources(limit: number): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined>;
  setResourceFeatured(id: number, featured: boolean): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Forum operations
  getForumPost(id: number): Promise<ForumPost | undefined>;
  getAllForumPosts(): Promise<ForumPost[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getPostComments(postId: number): Promise<ForumComment[]>;
  createForumComment(comment: InsertForumComment): Promise<ForumComment>;
  
  // Message operations
  getUserMessages(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<boolean>;
  
  // Consultation operations
  getConsultation(id: number): Promise<Consultation | undefined>;
  getProfessionalConsultations(professionalId: number): Promise<Consultation[]>;
  getCompanyConsultations(companyId: number): Promise<Consultation[]>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultationStatus(id: number, status: string): Promise<Consultation | undefined>;
  
  // Skill Recommendation operations
  getSkillRecommendation(id: number): Promise<SkillRecommendation | undefined>;
  getSkillRecommendationsByProfessional(professionalId: number): Promise<SkillRecommendation | undefined>;
  createSkillRecommendation(recommendation: InsertSkillRecommendation): Promise<SkillRecommendation>;
  updateSkillRecommendation(id: number, recommendation: Partial<InsertSkillRecommendation>): Promise<SkillRecommendation | undefined>;

  // Page Content operations
  getPageContent(id: number): Promise<PageContent | undefined>;
  getPageContentBySlug(slug: string): Promise<PageContent | undefined>;
  getAllPageContents(): Promise<PageContent[]>;
  createPageContent(content: InsertPageContent): Promise<PageContent>;
  updatePageContent(id: number, content: Partial<InsertPageContent>): Promise<PageContent | undefined>;
  deletePageContent(id: number): Promise<boolean>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getProfessionalReviews(professionalId: number): Promise<Review[]>;
  getCompanyReviews(companyId: number): Promise<Review[]>;
  getConsultationReview(consultationId: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  updateProfessionalRating(professionalId: number): Promise<boolean>;
  
  // Notification operations
  getNotificationType(id: number): Promise<NotificationType | undefined>;
  getNotificationTypeByName(name: string): Promise<NotificationType | undefined>;
  getAllNotificationTypes(): Promise<NotificationType[]>;
  createNotificationType(type: InsertNotificationType): Promise<NotificationType>;
  
  getNotification(id: number): Promise<Notification | undefined>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  getUserUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllUserNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Notification Preferences operations
  getUserNotificationPreferences(userId: number): Promise<NotificationPreference[]>;
  getUserNotificationPreference(userId: number, typeId: number): Promise<NotificationPreference | undefined>;
  createOrUpdateNotificationPreference(preference: InsertNotificationPreference): Promise<NotificationPreference>;
}

export class MemStorage implements IStorage {
  // Collection storage
  users: Map<number, User>;
  professionalProfiles: Map<number, ProfessionalProfile>;
  expertises: Map<number, Expertise>;
  professionalExpertises: Map<number, ProfessionalExpertise>;
  certifications: Map<number, Certification>;
  companyProfiles: Map<number, CompanyProfile>;
  jobPostings: Map<number, JobPosting>;
  jobApplications: Map<number, JobApplication>;
  resources: Map<number, Resource>;
  resourceCategories: Map<number, ResourceCategory>;
  forumPosts: Map<number, ForumPost>;
  forumComments: Map<number, ForumComment>;
  messages: Map<number, Message>;
  consultations: Map<number, Consultation>;
  skillRecommendations: Map<number, SkillRecommendation>;
  pageContents: Map<number, PageContent>;
  jobMatches: Map<string, number>; // Format: "jobId-professionalId" -> score
  reviews: Map<number, Review>;
  notificationTypes: Map<number, NotificationType>;
  notifications: Map<number, Notification>;
  notificationPreferences: Map<number, NotificationPreference>;
  
  // Admin data structures
  private adminUsers: Map<number, AdminUser>;
  private adminRefreshTokens: Map<string, AdminRefreshToken>; // Using token as the key
  private adminActionLogs: Map<number, AdminActionLog>;
  private adminActivityLogs: Map<number, AdminActivityLog>;
  private adminLoginAttempts: Map<number, AdminLoginAttempt>;
  private adminTempTOTPSecrets: Map<number, string>; // Temporary storage for TOTP secrets
  
  // Auto-increment counters
  userId: number;
  profProfileId: number;
  expertiseId: number;
  profExpertiseId: number;
  certificationId: number;
  companyProfileId: number;
  jobPostingId: number;
  jobApplicationId: number;
  resourceId: number;
  resourceCategoryId: number;
  forumPostId: number;
  forumCommentId: number;
  messageId: number;
  consultationId: number;
  skillRecommendationId: number;
  pageContentId: number;
  reviewId: number;
  notificationTypeId: number;
  notificationId: number;
  notificationPreferenceId: number;
  
  // Admin auto-increment counters
  private adminUserId: number;
  private adminActionLogId: number;
  private adminActivityLogId: number;
  private adminLoginAttemptId: number;

  constructor() {
    this.users = new Map();
    this.professionalProfiles = new Map();
    this.expertises = new Map();
    this.professionalExpertises = new Map();
    this.certifications = new Map();
    this.companyProfiles = new Map();
    this.jobPostings = new Map();
    this.jobApplications = new Map();
    this.resources = new Map();
    this.resourceCategories = new Map();
    this.forumPosts = new Map();
    this.forumComments = new Map();
    this.messages = new Map();
    this.consultations = new Map();
    this.skillRecommendations = new Map();
    this.pageContents = new Map();
    this.jobMatches = new Map();
    this.reviews = new Map();
    this.notificationTypes = new Map();
    this.notifications = new Map();
    this.notificationPreferences = new Map();
    
    // Initialize admin data structures
    this.adminUsers = new Map();
    this.adminRefreshTokens = new Map();
    this.adminActionLogs = new Map();
    this.adminActivityLogs = new Map();
    this.adminLoginAttempts = new Map();
    this.adminTempTOTPSecrets = new Map();
    
    this.userId = 1;
    this.profProfileId = 1;
    this.expertiseId = 1;
    this.profExpertiseId = 1;
    this.certificationId = 1;
    this.companyProfileId = 1;
    this.jobPostingId = 1;
    this.jobApplicationId = 1;
    this.resourceId = 1;
    this.resourceCategoryId = 1;
    this.forumPostId = 1;
    this.forumCommentId = 1;
    this.messageId = 1;
    this.consultationId = 1;
    this.skillRecommendationId = 1;
    this.pageContentId = 1;
    this.reviewId = 1;
    this.notificationTypeId = 1;
    this.notificationId = 1;
    this.notificationPreferenceId = 1;
    this.adminUserId = 1;
    this.adminActionLogId = 1;
    this.adminActivityLogId = 1;
    this.adminLoginAttemptId = 1;
    
    // Initialize with some expertise areas
    this.initExpertise();
    
    // Initialize with some resource categories
    this.initResourceCategories();
  }
  
  private initExpertise() {
    const expertiseAreas = [
      "Leadership Development", 
      "Executive Coaching", 
      "Team Building", 
      "Instructional Design", 
      "eLearning", 
      "LMS Implementation",
      "Change Management",
      "Culture Development",
      "DEI Training",
      "Technical Training",
      "Sales Training",
      "Onboarding"
    ];
    
    expertiseAreas.forEach(name => {
      const id = this.expertiseId++;
      this.expertises.set(id, { id, name });
    });
  }
  
  private initResourceCategories() {
    const categories = [
      { name: "Leadership", description: "Resources focused on leadership development and skills" },
      { name: "Technical Skills", description: "Resources for technical skill development" },
      { name: "Soft Skills", description: "Resources for communication and interpersonal skills" },
      { name: "Compliance", description: "Resources related to compliance and regulatory training" },
      { name: "Best Practices", description: "Best practices in Learning & Development" }
    ];
    
    categories.forEach(cat => {
      const id = this.resourceCategoryId++;
      const category: ResourceCategory = {
        id,
        name: cat.name,
        description: cat.description
      };
      this.resourceCategories.set(id, category);
    });
  }
  
  // Resource Category operations
  async getResourceCategory(id: number): Promise<ResourceCategory | undefined> {
    return this.resourceCategories.get(id);
  }
  
  async getAllResourceCategories(): Promise<ResourceCategory[]> {
    return Array.from(this.resourceCategories.values());
  }
  
  async createResourceCategory(category: InsertResourceCategory): Promise<ResourceCategory> {
    const id = this.resourceCategoryId++;
    const newCategory: ResourceCategory = { 
      id, 
      name: category.name,
      description: category.description || null
    };
    this.resourceCategories.set(id, newCategory);
    return newCategory;
  }
  
  // AI Matching operations
  async getMatchingJobsForProfessional(professionalId: number, limit: number = 5): Promise<Array<{job: JobPosting, score: number}>> {
    const professional = await this.getProfessionalProfile(professionalId);
    if (!professional) {
      return [];
    }

    // Get all jobs and calculate match scores
    const jobs = await this.getAllJobPostings();
    const matches = jobs
      .filter(job => job.status === "open") // Only consider open jobs
      .map(job => {
        // Get stored match score if available
        const key = `${job.id}-${professionalId}`;
        let score = this.jobMatches.get(key);
        
        // If no stored score, calculate a basic match score
        if (score === undefined) {
          const profTitle = professional.title?.toLowerCase() || '';
          const profBio = professional.bio?.toLowerCase() || '';
          const profIndustry = professional.industryFocus?.toLowerCase() || '';
          
          const jobTitle = job.title.toLowerCase();
          const jobDescription = job.description.toLowerCase();
          const jobRequirements = job.requirements.toLowerCase();
          
          // Calculate text-based match score
          const titleMatch = profTitle && jobTitle.includes(profTitle) ? 0.3 : 0;
          const bioMatch = profBio && (jobDescription.includes(profBio) || jobRequirements.includes(profBio)) ? 0.2 : 0;
          const industryMatch = profIndustry && jobDescription.includes(profIndustry) ? 0.2 : 0;
          
          // Assign a moderate score for location match
          const locationMatch = professional.location && 
            professional.location === job.location ? 0.3 : 0;
          
          score = titleMatch + bioMatch + industryMatch + locationMatch;
          
          // Save the calculated score
          this.jobMatches.set(key, score);
        }
        
        return { job, score };
      });
    
    // Sort by score (descending) and apply limit
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  async getMatchingProfessionalsForJob(jobId: number, limit: number = 5): Promise<Array<{professional: ProfessionalProfile, score: number}>> {
    const job = await this.getJobPosting(jobId);
    if (!job) {
      return [];
    }
    
    // Get all professionals and calculate match scores
    const professionals = await this.getAllProfessionalProfiles();
    const matches = professionals.map(professional => {
      // Get stored match score if available
      const key = `${jobId}-${professional.id}`;
      let score = this.jobMatches.get(key);
      
      // If no stored score, calculate a basic match score
      if (score === undefined) {
        const profTitle = professional.title?.toLowerCase() || '';
        const profBio = professional.bio?.toLowerCase() || '';
        const profIndustry = professional.industryFocus?.toLowerCase() || '';
        
        const jobTitle = job.title.toLowerCase();
        const jobDescription = job.description.toLowerCase();
        const jobRequirements = job.requirements.toLowerCase();
        
        // Calculate text-based match score
        const titleMatch = profTitle && jobTitle.includes(profTitle) ? 0.3 : 0;
        const bioMatch = profBio && (jobDescription.includes(profBio) || jobRequirements.includes(profBio)) ? 0.2 : 0;
        const industryMatch = profIndustry && jobDescription.includes(profIndustry) ? 0.2 : 0;
        
        // Assign a moderate score for location match
        const locationMatch = professional.location && 
          professional.location === job.location ? 0.3 : 0;
        
        score = titleMatch + bioMatch + industryMatch + locationMatch;
        
        // Save the calculated score
        this.jobMatches.set(key, score);
      }
      
      return { professional, score };
    });
    
    // Sort by score (descending) and apply limit
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  async saveJobMatch(jobId: number, professionalId: number, score: number): Promise<boolean> {
    const key = `${jobId}-${professionalId}`;
    this.jobMatches.set(key, score);
    return true;
  }
  
  // Additional Resource operations
  async getResourcesByCategory(categoryId: number): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.categoryId === categoryId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getResourcesByAuthor(authorId: number): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.authorId === authorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async searchResources(query?: string, type?: string, categoryId?: number): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => {
        const matchesQuery = !query || 
          resource.title.toLowerCase().includes(query.toLowerCase()) ||
          resource.description.toLowerCase().includes(query.toLowerCase());
          
        const matchesType = !type || resource.resourceType === type;
        
        const matchesCategory = !categoryId || resource.categoryId === categoryId;
        
        return matchesQuery && matchesType && matchesCategory;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async setResourceFeatured(id: number, featured: boolean): Promise<Resource | undefined> {
    const resource = this.resources.get(id);
    if (!resource) return undefined;
    
    const updated = { ...resource, featured };
    this.resources.set(id, updated);
    return updated;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getUserBySocialProvider(provider: string, profileId: string): Promise<User | undefined> {
    const fieldName = `${provider}Id` as keyof User;
    return Array.from(this.users.values()).find(
      (user) => user[fieldName] === profileId
    );
  }
  
  async linkSocialAccount(userId: number, provider: string, profileId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const fieldName = `${provider}Id` as keyof User;
    const updatedUser = { ...user, [fieldName]: profileId };
    this.users.set(userId, updatedUser as User);
    return updatedUser as User;
  }
  
  async createUserFromSocial(user: Partial<InsertUser> & { email: string; username: string; password: string }): Promise<User> {
    // Check if username or email already exists
    const existingUsername = await this.getUserByUsername(user.username);
    if (existingUsername) {
      throw new Error("Username already exists");
    }
    
    const existingEmail = await this.getUserByEmail(user.email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }
    
    const id = this.userId++;
    const newUser: User = {
      id,
      username: user.username,
      password: user.password,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      userType: user.userType || "professional",
      isAdmin: user.isAdmin || false,
      createdAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: null,
      subscriptionStatus: null,
      resetToken: null,
      resetTokenExpiry: null,
      emailVerified: user.emailVerified || false,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
      profilePhotoUrl: user.profilePhotoUrl || null,
      googleId: user.googleId || null,
      linkedinId: user.linkedinId || null,
    };
    
    this.users.set(id, newUser);
    return newUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: null,
      subscriptionStatus: null,
      resetToken: null,
      resetTokenExpiry: null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Password and account recovery operations
  async createResetToken(email: string): Promise<string | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    // Generate a random token
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    // Set expiry to 1 hour from now
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    
    // Update user with token
    const updated = { 
      ...user, 
      resetToken: token,
      resetTokenExpiry: expiryDate 
    };
    
    this.users.set(user.id, updated);
    return token;
  }
  
  async getUserByResetToken(token: string): Promise<User | undefined> {
    const now = new Date();
    
    return Array.from(this.users.values()).find(
      (user) => user.resetToken === token && 
                user.resetTokenExpiry && 
                user.resetTokenExpiry > now
    );
  }
  
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserByResetToken(token);
    if (!user) return false;
    
    // Update user with new password and clear token
    const updated = { 
      ...user, 
      password: newPassword,
      resetToken: null,
      resetTokenExpiry: null
    };
    
    this.users.set(user.id, updated);
    return true;
  }
  
  // Professional Profile operations
  async getProfessionalProfile(id: number): Promise<ProfessionalProfile | undefined> {
    return this.professionalProfiles.get(id);
  }
  
  async getProfessionalProfileByUserId(userId: number): Promise<ProfessionalProfile | undefined> {
    return Array.from(this.professionalProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async getAllProfessionalProfiles(): Promise<ProfessionalProfile[]> {
    return Array.from(this.professionalProfiles.values());
  }
  
  async getFeaturedProfessionalProfiles(limit: number): Promise<ProfessionalProfile[]> {
    return Array.from(this.professionalProfiles.values())
      .filter(profile => profile.featured)
      .slice(0, limit);
  }
  
  async createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile> {
    const id = this.profProfileId++;
    
    // Explicitly construct the profile to match the schema exactly
    const newProfile: ProfessionalProfile = { 
      id,
      userId: profile.userId,
      firstName: profile.firstName || null,
      lastName: profile.lastName || null,
      email: profile.email || null,
      title: profile.title || null,
      bio: profile.bio || null,
      location: profile.location || null,
      videoIntroUrl: profile.videoIntroUrl || null,
      ratePerHour: profile.ratePerHour || null,
      profileImageUrl: profile.profileImageUrl || null,
      profileImagePath: profile.profileImagePath || null,
      galleryImages: profile.galleryImages || [],
      featured: profile.featured || false,
      verified: profile.verified || false,
      rating: profile.rating || 0,
      reviewCount: profile.reviewCount || 0,
      yearsExperience: profile.yearsExperience || 0,
      interests: profile.interests || null,
      industryFocus: profile.industryFocus || null
    };
    
    this.professionalProfiles.set(id, newProfile);
    return newProfile;
  }
  
  async updateProfessionalProfile(id: number, profile: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile | undefined> {
    const existing = this.professionalProfiles.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...profile };
    this.professionalProfiles.set(id, updated);
    return updated;
  }
  
  async deleteProfessionalProfile(id: number): Promise<boolean> {
    return this.professionalProfiles.delete(id);
  }
  
  // Expertise operations
  async getAllExpertise(): Promise<Expertise[]> {
    return Array.from(this.expertises.values());
  }
  
  async getExpertiseById(id: number): Promise<Expertise | undefined> {
    return this.expertises.get(id);
  }
  
  async createExpertise(insertExpertise: InsertExpertise): Promise<Expertise> {
    const id = this.expertiseId++;
    const expertise: Expertise = { ...insertExpertise, id };
    this.expertises.set(id, expertise);
    return expertise;
  }
  
  async getProfessionalExpertise(professionalId: number): Promise<Expertise[]> {
    const profExpertiseEntries = Array.from(this.professionalExpertises.values())
      .filter(pe => pe.professionalId === professionalId);
    
    return profExpertiseEntries.map(pe => this.expertises.get(pe.expertiseId)!)
      .filter(Boolean);
  }
  
  async addProfessionalExpertise(insertProfExpertise: InsertProfessionalExpertise): Promise<ProfessionalExpertise> {
    // Check if it already exists
    const exists = Array.from(this.professionalExpertises.values()).some(
      pe => pe.professionalId === insertProfExpertise.professionalId && 
            pe.expertiseId === insertProfExpertise.expertiseId
    );
    
    if (exists) {
      throw new Error("Professional already has this expertise");
    }
    
    const id = this.profExpertiseId++;
    const profExpertise: ProfessionalExpertise = { ...insertProfExpertise, id };
    this.professionalExpertises.set(id, profExpertise);
    return profExpertise;
  }
  
  // Delete professional expertise
  async deleteProfessionalExpertise(id: number): Promise<boolean> {
    if (!this.professionalExpertises.has(id)) {
      return false;
    }
    
    this.professionalExpertises.delete(id);
    return true;
  }
  
  // Certification operations
  async getCertification(id: number): Promise<Certification | undefined> {
    return this.certifications.get(id);
  }
  
  async getProfessionalCertifications(professionalId: number): Promise<Certification[]> {
    return Array.from(this.certifications.values())
      .filter(cert => cert.professionalId === professionalId);
  }
  
  async createCertification(insertCertification: InsertCertification): Promise<Certification> {
    const id = this.certificationId++;
    const certification: Certification = { ...insertCertification, id };
    this.certifications.set(id, certification);
    return certification;
  }
  
  async deleteCertification(id: number): Promise<boolean> {
    return this.certifications.delete(id);
  }
  
  // Company Profile operations
  async getCompanyProfile(id: number): Promise<CompanyProfile | undefined> {
    return this.companyProfiles.get(id);
  }
  
  async getCompanyProfileByUserId(userId: number): Promise<CompanyProfile | undefined> {
    return Array.from(this.companyProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async getAllCompanyProfiles(): Promise<CompanyProfile[]> {
    return Array.from(this.companyProfiles.values());
  }
  
  async createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
    const id = this.companyProfileId++;
    const newProfile: CompanyProfile = { 
      id,
      userId: profile.userId,
      companyName: profile.companyName,
      industry: profile.industry,
      description: profile.description,
      size: profile.size,
      location: profile.location,
      website: profile.website || null,
      logoUrl: profile.logoUrl || null,
      logoImagePath: profile.logoImagePath || null,
      featured: profile.featured || false,
      verified: profile.verified || false
    };
    this.companyProfiles.set(id, newProfile);
    return newProfile;
  }
  
  async updateCompanyProfile(id: number, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile | undefined> {
    const existing = this.companyProfiles.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...profile };
    this.companyProfiles.set(id, updated);
    return updated;
  }
  
  // Delete company profile
  async deleteCompanyProfile(id: number): Promise<boolean> {
    if (!this.companyProfiles.has(id)) {
      return false;
    }
    
    this.companyProfiles.delete(id);
    return true;
  }
  
  // Job Posting operations
  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    return this.jobPostings.get(id);
  }
  
  async getAllJobPostings(): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values());
  }
  
  async getLatestJobPostings(limit: number): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async getCompanyJobPostings(companyId: number): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values())
      .filter(job => job.companyId === companyId);
  }
  
  async createJobPosting(job: InsertJobPosting): Promise<JobPosting> {
    const id = this.jobPostingId++;
    const newJob: JobPosting = { 
      ...job, 
      id, 
      createdAt: new Date(),
      status: job.status || "open",
      featured: job.featured || false,
      minCompensation: job.minCompensation || null,
      maxCompensation: job.maxCompensation || null,
      duration: job.duration || null,
      expiresAt: job.expiresAt || null,
      compensationUnit: job.compensationUnit || null,
      remote: job.remote || false
    };
    this.jobPostings.set(id, newJob);
    return newJob;
  }
  
  async updateJobPosting(id: number, job: Partial<InsertJobPosting>): Promise<JobPosting | undefined> {
    const existing = this.jobPostings.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...job };
    this.jobPostings.set(id, updated);
    return updated;
  }
  
  async deleteJobPosting(id: number): Promise<boolean> {
    return this.jobPostings.delete(id);
  }
  
  // Job Application operations
  async getJobApplication(id: number): Promise<JobApplication | undefined> {
    return this.jobApplications.get(id);
  }
  
  async getJobApplicationsByJob(jobId: number): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values())
      .filter(app => app.jobId === jobId);
  }
  
  async getJobApplicationsByProfessional(professionalId: number): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values())
      .filter(app => app.professionalId === professionalId);
  }
  
  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    // Check if application already exists
    const exists = Array.from(this.jobApplications.values()).some(
      app => app.jobId === application.jobId && app.professionalId === application.professionalId
    );
    
    if (exists) {
      throw new Error("Professional has already applied to this job");
    }
    
    const id = this.jobApplicationId++;
    const newApplication: JobApplication = { 
      ...application, 
      id, 
      createdAt: new Date(),
      status: application.status || "pending"
    };
    this.jobApplications.set(id, newApplication);
    return newApplication;
  }
  
  async updateJobApplicationStatus(id: number, status: string): Promise<JobApplication | undefined> {
    const existing = this.jobApplications.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, status };
    this.jobApplications.set(id, updated);
    return updated;
  }
  
  // Delete job application
  async deleteJobApplication(id: number): Promise<boolean> {
    if (!this.jobApplications.has(id)) {
      return false;
    }
    
    this.jobApplications.delete(id);
    return true;
  }
  
  // Resource operations
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
  
  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }
  
  async getFeaturedResources(limit: number): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.featured)
      .slice(0, limit);
  }
  
  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.resourceId++;
    const newResource: Resource = { 
      ...resource, 
      id, 
      createdAt: new Date(),
      featured: resource.featured || false,
      imageUrl: resource.imageUrl || null,
      categoryId: resource.categoryId || null,
      contentUrl: resource.contentUrl || null,
      filePath: resource.filePath || null
    };
    this.resources.set(id, newResource);
    return newResource;
  }
  
  async updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined> {
    const existing = this.resources.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...resource };
    this.resources.set(id, updated);
    return updated;
  }
  
  async deleteResource(id: number): Promise<boolean> {
    return this.resources.delete(id);
  }
  
  // Forum operations
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.get(id);
  }
  
  async getAllForumPosts(): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const id = this.forumPostId++;
    const newPost: ForumPost = { 
      ...post, 
      id, 
      createdAt: new Date() 
    };
    this.forumPosts.set(id, newPost);
    return newPost;
  }
  
  async getPostComments(postId: number): Promise<ForumComment[]> {
    return Array.from(this.forumComments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createForumComment(comment: InsertForumComment): Promise<ForumComment> {
    const id = this.forumCommentId++;
    const newComment: ForumComment = { 
      ...comment, 
      id, 
      createdAt: new Date() 
    };
    this.forumComments.set(id, newComment);
    return newComment;
  }
  
  // Message operations
  async getUserMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.senderId === userId || msg.receiverId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => 
        (msg.senderId === user1Id && msg.receiverId === user2Id) ||
        (msg.senderId === user2Id && msg.receiverId === user1Id)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const newMessage: Message = { 
      ...message, 
      id, 
      read: false,
      createdAt: new Date() 
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async markMessageAsRead(id: number): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;
    
    message.read = true;
    this.messages.set(id, message);
    return true;
  }
  
  // Consultation operations
  async getConsultation(id: number): Promise<Consultation | undefined> {
    return this.consultations.get(id);
  }
  
  async getProfessionalConsultations(professionalId: number): Promise<Consultation[]> {
    return Array.from(this.consultations.values())
      .filter(consult => consult.professionalId === professionalId)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  async getCompanyConsultations(companyId: number): Promise<Consultation[]> {
    return Array.from(this.consultations.values())
      .filter(consult => consult.companyId === companyId)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const id = this.consultationId++;
    const newConsultation: Consultation = { 
      ...consultation, 
      id, 
      createdAt: new Date(),
      status: consultation.status || "scheduled",
      notes: consultation.notes || null
    };
    this.consultations.set(id, newConsultation);
    return newConsultation;
  }
  
  async updateConsultationStatus(id: number, status: string): Promise<Consultation | undefined> {
    const existing = this.consultations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, status };
    this.consultations.set(id, updated);
    return updated;
  }

  // Added user update method
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...userData };
    this.users.set(id, updated);
    return updated;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Stripe methods
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updated = { ...user, stripeCustomerId: customerId };
    this.users.set(userId, updated);
    return updated;
  }
  
  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updated = { ...user, stripeSubscriptionId: subscriptionId };
    this.users.set(userId, updated);
    return updated;
  }
  
  async updateUserSubscription(userId: number, tier: string, status: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updated = { 
      ...user, 
      subscriptionTier: tier, 
      subscriptionStatus: status 
    };
    this.users.set(userId, updated);
    return updated;
  }
  
  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.stripeCustomerId === customerId
    );
  }

  // Skill Recommendation operations
  async getSkillRecommendation(id: number): Promise<SkillRecommendation | undefined> {
    return this.skillRecommendations.get(id);
  }

  async getSkillRecommendationsByProfessional(professionalId: number): Promise<SkillRecommendation | undefined> {
    return Array.from(this.skillRecommendations.values()).find(
      (rec) => rec.professionalId === professionalId
    );
  }

  async createSkillRecommendation(recommendation: InsertSkillRecommendation): Promise<SkillRecommendation> {
    const id = this.skillRecommendationId++;
    const newRecommendation: SkillRecommendation = { 
      ...recommendation, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.skillRecommendations.set(id, newRecommendation);
    return newRecommendation;
  }

  async updateSkillRecommendation(id: number, recommendation: Partial<InsertSkillRecommendation>): Promise<SkillRecommendation | undefined> {
    const existing = this.skillRecommendations.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...recommendation,
      updatedAt: new Date()
    };
    this.skillRecommendations.set(id, updated);
    return updated;
  }

  // Page Content operations
  async getPageContent(id: number): Promise<PageContent | undefined> {
    return this.pageContents.get(id);
  }
  
  async getPageContentBySlug(slug: string): Promise<PageContent | undefined> {
    return Array.from(this.pageContents.values()).find(
      (content) => content.slug === slug
    );
  }
  
  async getAllPageContents(): Promise<PageContent[]> {
    return Array.from(this.pageContents.values());
  }
  
  async createPageContent(content: InsertPageContent): Promise<PageContent> {
    const id = this.pageContentId++;
    const newContent: PageContent = {
      ...content,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy: content.lastEditedBy || null
    };
    this.pageContents.set(id, newContent);
    return newContent;
  }
  
  async updatePageContent(id: number, content: Partial<InsertPageContent>): Promise<PageContent | undefined> {
    const existing = this.pageContents.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...content,
      updatedAt: new Date(),
      lastEditedBy: content.lastEditedBy !== undefined ? content.lastEditedBy : existing.lastEditedBy 
    };
    this.pageContents.set(id, updated);
    return updated;
  }
  
  async deletePageContent(id: number): Promise<boolean> {
    return this.pageContents.delete(id);
  }
  
  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getProfessionalReviews(professionalId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.professionalId === professionalId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getCompanyReviews(companyId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.companyId === companyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getConsultationReview(consultationId: number): Promise<Review | undefined> {
    return Array.from(this.reviews.values())
      .find(review => review.consultationId === consultationId);
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const newReview: Review = {
      ...review,
      id,
      createdAt: new Date()
    };
    this.reviews.set(id, newReview);
    
    // Update the professional's rating
    await this.updateProfessionalRating(review.professionalId);
    
    return newReview;
  }
  
  async updateReview(id: number, review: Partial<Review>): Promise<Review | undefined> {
    const existing = this.reviews.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...review };
    this.reviews.set(id, updated);
    
    // Update the professional's rating if the rating was changed
    if (review.rating) {
      await this.updateProfessionalRating(existing.professionalId);
    }
    
    return updated;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    const review = this.reviews.get(id);
    if (!review) return false;
    
    const result = this.reviews.delete(id);
    
    // Update the professional's rating
    if (result) {
      await this.updateProfessionalRating(review.professionalId);
    }
    
    return result;
  }
  
  async updateProfessionalRating(professionalId: number): Promise<boolean> {
    const professional = await this.getProfessionalProfile(professionalId);
    if (!professional) return false;
    
    const reviews = await this.getProfessionalReviews(professionalId);
    
    if (reviews.length === 0) {
      // Reset rating if no reviews
      const updated = {
        ...professional,
        rating: 0,
        reviewCount: 0
      };
      this.professionalProfiles.set(professionalId, updated);
      return true;
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round(totalRating / reviews.length);
    
    const updated = {
      ...professional,
      rating: averageRating,
      reviewCount: reviews.length
    };
    
    this.professionalProfiles.set(professionalId, updated);
    return true;
  }
  
  // Notification Type operations
  async getNotificationType(id: number): Promise<NotificationType | undefined> {
    return this.notificationTypes.get(id);
  }
  
  async getNotificationTypeByName(name: string): Promise<NotificationType | undefined> {
    return Array.from(this.notificationTypes.values())
      .find(type => type.name === name);
  }
  
  async getAllNotificationTypes(): Promise<NotificationType[]> {
    return Array.from(this.notificationTypes.values());
  }
  
  async createNotificationType(type: InsertNotificationType): Promise<NotificationType> {
    const id = this.notificationTypeId++;
    const newType: NotificationType = {
      ...type,
      id
    };
    this.notificationTypes.set(id, newType);
    return newType;
  }
  
  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }
  
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getUserUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const newNotification: Notification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    const updated = { ...notification, read: true };
    this.notifications.set(id, updated);
    return true;
  }
  
  async markAllUserNotificationsAsRead(userId: number): Promise<boolean> {
    const userNotifications = await this.getUserNotifications(userId);
    
    userNotifications.forEach(notification => {
      const updated = { ...notification, read: true };
      this.notifications.set(notification.id, updated);
    });
    
    return true;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
  
  // Notification Preferences operations
  async getUserNotificationPreferences(userId: number): Promise<NotificationPreference[]> {
    return Array.from(this.notificationPreferences.values())
      .filter(pref => pref.userId === userId);
  }
  
  async getUserNotificationPreference(userId: number, typeId: number): Promise<NotificationPreference | undefined> {
    return Array.from(this.notificationPreferences.values())
      .find(pref => pref.userId === userId && pref.typeId === typeId);
  }
  
  async createOrUpdateNotificationPreference(preference: InsertNotificationPreference): Promise<NotificationPreference> {
    // Check if preference already exists
    const existing = await this.getUserNotificationPreference(preference.userId, preference.typeId);
    
    if (existing) {
      // Update existing preference
      const updated = { 
        ...existing,
        email: preference.email !== undefined ? preference.email : existing.email,
        inApp: preference.inApp !== undefined ? preference.inApp : existing.inApp,
      };
      this.notificationPreferences.set(existing.id, updated);
      return updated;
    } else {
      // Create new preference
      const id = this.notificationPreferenceId++;
      const newPreference: NotificationPreference = {
        id,
        userId: preference.userId,
        typeId: preference.typeId,
        email: preference.email !== undefined ? preference.email : true,
        inApp: preference.inApp !== undefined ? preference.inApp : true,
      };
      this.notificationPreferences.set(id, newPreference);
      return newPreference;
    }
  }
  
  // Admin User operations
  async getAdminUserById(id: number): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }
  
  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(user => user.email === email);
  }
  
  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(user => user.username === username);
  }
  
  async createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser> {
    const id = this.adminUserId++;
    const now = new Date();
    
    const newAdminUser: AdminUser = {
      id,
      username: adminUser.username,
      email: adminUser.email,
      password: adminUser.password,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role as AdminRole, // Using AdminRole enum
      customPermissions: adminUser.customPermissions || [],
      lastLogin: null,
      createdAt: now,
      updatedAt: now,
      isActive: adminUser.isActive !== undefined ? adminUser.isActive : true,
      twoFactorEnabled: adminUser.twoFactorEnabled !== undefined ? adminUser.twoFactorEnabled : false,
      twoFactorSecret: adminUser.twoFactorSecret || null,
    };
    
    this.adminUsers.set(id, newAdminUser);
    return newAdminUser;
  }
  
  async updateAdminUser(id: number, userData: Partial<AdminUser>): Promise<AdminUser | undefined> {
    const user = this.adminUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser: AdminUser = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };
    
    this.adminUsers.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteAdminUser(id: number): Promise<boolean> {
    return this.adminUsers.delete(id);
  }
  
  async getAllAdminUsers(): Promise<AdminUser[]> {
    return Array.from(this.adminUsers.values());
  }
  
  // Admin Authentication operations
  async saveAdminRefreshToken(adminId: number, token: string): Promise<boolean> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const refreshToken: AdminRefreshToken = {
      id: this.adminLoginAttemptId++,
      adminId,
      token,
      expiresAt,
      createdAt: now,
      revokedAt: null
    };
    
    this.adminRefreshTokens.set(token, refreshToken);
    return true;
  }
  
  async validateAdminRefreshToken(adminId: number, token: string): Promise<boolean> {
    const refreshToken = this.adminRefreshTokens.get(token);
    if (!refreshToken) return false;
    
    const now = new Date();
    return (
      refreshToken.adminId === adminId &&
      refreshToken.revokedAt === null &&
      refreshToken.expiresAt > now
    );
  }
  
  async rotateAdminRefreshToken(adminId: number, oldToken: string, newToken: string): Promise<boolean> {
    const isValid = await this.validateAdminRefreshToken(adminId, oldToken);
    if (!isValid) return false;
    
    // Invalidate old token
    await this.invalidateAdminRefreshToken(adminId, oldToken);
    
    // Create new token
    return this.saveAdminRefreshToken(adminId, newToken);
  }
  
  async invalidateAdminRefreshToken(adminId: number, token: string): Promise<boolean> {
    const refreshToken = this.adminRefreshTokens.get(token);
    if (!refreshToken || refreshToken.adminId !== adminId) return false;
    
    const updatedToken = {
      ...refreshToken,
      revokedAt: new Date()
    };
    
    this.adminRefreshTokens.set(token, updatedToken);
    return true;
  }
  
  async invalidateAllAdminRefreshTokens(adminId: number): Promise<boolean> {
    let success = true;
    
    for (const [token, refreshToken] of this.adminRefreshTokens.entries()) {
      if (refreshToken.adminId === adminId && refreshToken.revokedAt === null) {
        const updated = {
          ...refreshToken,
          revokedAt: new Date()
        };
        this.adminRefreshTokens.set(token, updated);
      }
    }
    
    return success;
  }
  
  async updateAdminLastLogin(adminId: number): Promise<boolean> {
    const admin = await this.getAdminUserById(adminId);
    if (!admin) return false;
    
    const updated = {
      ...admin,
      lastLogin: new Date(),
      updatedAt: new Date()
    };
    
    this.adminUsers.set(adminId, updated);
    return true;
  }
  
  async logAdminLoginAttempt(loginAttempt: InsertAdminLoginAttempt): Promise<AdminLoginAttempt> {
    const id = this.adminLoginAttemptId++;
    const now = new Date();
    
    const newLoginAttempt: AdminLoginAttempt = {
      id,
      adminId: loginAttempt.adminId,
      success: loginAttempt.success,
      ipAddress: loginAttempt.ipAddress || null,
      userAgent: loginAttempt.userAgent || null,
      details: loginAttempt.details || null,
      timestamp: now
    };
    
    this.adminLoginAttempts.set(id, newLoginAttempt);
    return newLoginAttempt;
  }
  
  // Admin password management
  async updateAdminPassword(adminId: number, newPassword: string): Promise<boolean> {
    const admin = this.adminUsers.get(adminId);
    if (!admin) return false;
    
    const updatedAdmin = {
      ...admin,
      password: newPassword,
      updatedAt: new Date()
    };
    
    this.adminUsers.set(adminId, updatedAdmin);
    return true;
  }
  
  // Admin Two-Factor Authentication operations
  async saveAdminTOTPSecret(adminId: number, secret: string): Promise<boolean> {
    this.adminTempTOTPSecrets.set(adminId, secret);
    return true;
  }
  
  async getAdminTOTPSecret(adminId: number): Promise<string | undefined> {
    const admin = await this.getAdminUserById(adminId);
    
    // If 2FA is enabled, return the permanent secret
    if (admin?.twoFactorEnabled && admin.twoFactorSecret) {
      return admin.twoFactorSecret;
    }
    
    // Otherwise return the temporary secret if available
    return this.adminTempTOTPSecrets.get(adminId);
  }
  
  async enableAdminTwoFactor(adminId: number, secret: string): Promise<boolean> {
    const admin = await this.getAdminUserById(adminId);
    if (!admin) return false;
    
    const updated = {
      ...admin,
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      updatedAt: new Date()
    };
    
    this.adminUsers.set(adminId, updated);
    
    // Clear the temporary secret
    this.adminTempTOTPSecrets.delete(adminId);
    
    return true;
  }
  
  async disableAdminTwoFactor(adminId: number): Promise<boolean> {
    const admin = await this.getAdminUserById(adminId);
    if (!admin) return false;
    
    const updated = {
      ...admin,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      updatedAt: new Date()
    };
    
    this.adminUsers.set(adminId, updated);
    return true;
  }
  
  // Admin Logging operations
  async createAdminActionLog(log: InsertAdminActionLog): Promise<AdminActionLog> {
    const id = this.adminActionLogId++;
    
    const newLog: AdminActionLog = {
      id,
      adminId: log.adminId,
      adminUsername: log.adminUsername,
      action: log.action,
      entityType: log.entityType || null,
      entityId: log.entityId || null,
      details: log.details || null,
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
      timestamp: log.timestamp || new Date()
    };
    
    this.adminActionLogs.set(id, newLog);
    return newLog;
  }
  
  async createAdminActivityLog(log: InsertAdminActivityLog): Promise<AdminActivityLog> {
    const id = this.adminActivityLogId++;
    
    const newLog: AdminActivityLog = {
      id,
      adminId: log.adminId,
      method: log.method,
      path: log.path,
      statusCode: log.statusCode || null,
      executionTime: log.executionTime || null,
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
      timestamp: log.timestamp || new Date()
    };
    
    this.adminActivityLogs.set(id, newLog);
    return newLog;
  }
  
  async getAdminActionLogs(adminId: number, page: number = 1, pageSize: number = 20): Promise<{logs: AdminActionLog[], total: number}> {
    const allLogs = Array.from(this.adminActionLogs.values())
      .filter(log => log.adminId === adminId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      logs: allLogs.slice(start, end),
      total: allLogs.length
    };
  }
  
  // User management from admin perspective
  async getAllUsersWithPagination(options: {
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
    userType?: string;
    isActive?: boolean;
  }): Promise<{users: User[], total: number}> {
    const { page, pageSize, sortBy, sortOrder, search, userType, isActive } = options;
    
    let filteredUsers = Array.from(this.users.values()).filter(user => {
      let match = true;
      
      if (search) {
        const searchLower = search.toLowerCase();
        match = match && (
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower)
        );
      }
      
      if (userType) {
        match = match && user.userType === userType;
      }
      
      if (isActive !== undefined) {
        match = match && !user.blocked === isActive;
      }
      
      return match;
    });
    
    // Sort users
    filteredUsers.sort((a, b) => {
      const aValue = a[sortBy as keyof User];
      const bValue = b[sortBy as keyof User];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortOrder === 'asc' 
          ? (aValue ? 1 : 0) - (bValue ? 1 : 0) 
          : (bValue ? 1 : 0) - (aValue ? 1 : 0);
      }
      
      return 0;
    });
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      users: filteredUsers.slice(start, end),
      total: filteredUsers.length
    };
  }
  
  async getUserActivityLogs(userId: number, options: {page: number, pageSize: number}): Promise<{activityLogs: any[], total: number}> {
    // In a real implementation, we would query user activity from various tables
    // For this in-memory implementation, we'll return empty results
    return {
      activityLogs: [],
      total: 0
    };
  }
  
  async resetUserPassword(userId: number, newPassword: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    const updated = {
      ...user,
      password: newPassword
    };
    
    this.users.set(userId, updated);
    return true;
  }
  
  async getUserStats(): Promise<{total: number, professionals: number, companies: number, active: number, inactive: number}> {
    const users = Array.from(this.users.values());
    
    return {
      total: users.length,
      professionals: users.filter(u => u.userType === 'professional').length,
      companies: users.filter(u => u.userType === 'company').length,
      active: users.filter(u => !u.blocked).length,
      inactive: users.filter(u => u.blocked).length
    };
  }
  
  async getNewUsersCount(since: Date): Promise<number> {
    return Array.from(this.users.values())
      .filter(user => user.createdAt >= since)
      .length;
  }
  
  async getActiveUsersCount(since: Date): Promise<number> {
    return Array.from(this.users.values())
      .filter(user => user.lastActiveAt && user.lastActiveAt >= since)
      .length;
  }
  
  async getUserSubscription(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    if (!user.stripeSubscriptionId) return null;
    
    // In a real implementation, we would fetch subscription details from Stripe
    return {
      id: user.stripeSubscriptionId,
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      startDate: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  }
  
  async getUserTransactions(userId: number): Promise<any[]> {
    // In a real implementation, we would fetch transaction history from Stripe
    return [];
  }
}

export class DatabaseStorage implements IStorage {
  // Helper method to safely handle database table errors
  private async safeDbOperation<T>(operation: () => Promise<T>, fallback: T, errorPrefix: string = "Database error"): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      // If the error is about a missing table/relation, return the fallback value
      if (error.code === '42P01') { // undefined_table
        console.warn(`${errorPrefix}: table does not exist - ${error.message}`);
        return fallback;
      }
      
      // For other errors, log them but still return the fallback
      console.error(`${errorPrefix}:`, error);
      return fallback;
    }
  }
  // Admin User operations
  async getAdminUserById(id: number): Promise<AdminUser | undefined> {
    if (!db) return undefined;
    
    try {
      const [admin] = await db.select()
        .from(adminUsers)
        .where(eq(adminUsers.id, id)) || [];
      
      return admin;
    } catch (error: any) {
      // If the error is about a missing table, return undefined
      if (error.code === '42P01') { // undefined_table
        console.warn('Admin tables not yet migrated, running with in-memory storage for admin functions');
        return undefined;
      }
      throw error;
    }
  }
  
  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    if (!db) return undefined;
    
    const [admin] = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email)) || [];
    
    return admin;
  }
  
  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    if (!db) return undefined;
    
    const [admin] = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username)) || [];
    
    return admin;
  }
  
  async createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser> {
    if (!db) throw new Error("Database not available");
    
    const adminData = {
      username: adminUser.username,
      password: adminUser.password,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role as AdminRole,
      customPermissions: adminUser.customPermissions,
      isActive: adminUser.isActive !== undefined ? adminUser.isActive : true,
      twoFactorEnabled: adminUser.twoFactorEnabled !== undefined ? adminUser.twoFactorEnabled : false,
      twoFactorSecret: adminUser.twoFactorSecret,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [newAdmin] = await db.insert(adminUsers)
      .values(adminData)
      .returning() || [];
    
    return newAdmin;
  }
  
  async updateAdminUser(id: number, userData: Partial<AdminUser>): Promise<AdminUser | undefined> {
    if (!db) return undefined;
    
    const [updatedAdmin] = await db.update(adminUsers)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(adminUsers.id, id))
      .returning() || [];
    
    return updatedAdmin;
  }
  
  async deleteAdminUser(id: number): Promise<boolean> {
    if (!db) return false;
    
    const [deletedAdmin] = await db.delete(adminUsers)
      .where(eq(adminUsers.id, id))
      .returning() || [];
    
    return !!deletedAdmin;
  }
  
  async getAllAdminUsers(): Promise<AdminUser[]> {
    if (!db) return [];
    
    const admins = await db.select()
      .from(adminUsers) || [];
    
    return admins;
  }
  
  // Admin Authentication operations
  async saveAdminRefreshToken(adminId: number, token: string): Promise<boolean> {
    if (!db) return false;
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const [refreshToken] = await db.insert(adminRefreshTokens)
      .values({
        adminId,
        token,
        expiresAt,
        createdAt: now,
        revokedAt: null
      })
      .returning() || [];
    
    return !!refreshToken;
  }
  
  async validateAdminRefreshToken(adminId: number, token: string): Promise<boolean> {
    if (!db) return false;
    
    const [refreshToken] = await db.select()
      .from(adminRefreshTokens)
      .where(and(
        eq(adminRefreshTokens.adminId, adminId),
        eq(adminRefreshTokens.token, token),
        isNull(adminRefreshTokens.revokedAt),
        gt(adminRefreshTokens.expiresAt, new Date())
      )) || [];
    
    return !!refreshToken;
  }
  
  async rotateAdminRefreshToken(adminId: number, oldToken: string, newToken: string): Promise<boolean> {
    const isValid = await this.validateAdminRefreshToken(adminId, oldToken);
    if (!isValid || !db) return false;
    
    // Invalidate old token
    await this.invalidateAdminRefreshToken(adminId, oldToken);
    
    // Create new token
    return this.saveAdminRefreshToken(adminId, newToken);
  }
  
  async invalidateAdminRefreshToken(adminId: number, token: string): Promise<boolean> {
    if (!db) return false;
    
    const [updatedToken] = await db.update(adminRefreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(
        eq(adminRefreshTokens.adminId, adminId),
        eq(adminRefreshTokens.token, token)
      ))
      .returning() || [];
    
    return !!updatedToken;
  }
  
  async invalidateAllAdminRefreshTokens(adminId: number): Promise<boolean> {
    if (!db) return false;
    
    const result = await db.update(adminRefreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(
        eq(adminRefreshTokens.adminId, adminId),
        isNull(adminRefreshTokens.revokedAt)
      )) || [];
    
    return true;
  }
  
  async updateAdminLastLogin(adminId: number): Promise<boolean> {
    if (!db) return false;
    
    const [updatedAdmin] = await db.update(adminUsers)
      .set({ 
        lastLogin: new Date(),
        updatedAt: new Date()
      })
      .where(eq(adminUsers.id, adminId))
      .returning() || [];
    
    return !!updatedAdmin;
  }
  
  async logAdminLoginAttempt(loginAttempt: InsertAdminLoginAttempt): Promise<AdminLoginAttempt> {
    if (!db) throw new Error("Database not available");
    
    const attemptData = {
      adminId: loginAttempt.adminId,
      success: loginAttempt.success,
      ipAddress: loginAttempt.ipAddress || null,
      userAgent: loginAttempt.userAgent || null,
      details: loginAttempt.details || null,
      timestamp: new Date()
    };
    
    const [newLoginAttempt] = await db.insert(adminLoginAttempts)
      .values(attemptData)
      .returning() || [];
    
    return newLoginAttempt;
  }
  
  async updateAdminPassword(adminId: number, newPassword: string): Promise<boolean> {
    if (!db) return false;
    
    const [updatedAdmin] = await db.update(adminUsers)
      .set({ 
        password: newPassword,
        updatedAt: new Date()
      })
      .where(eq(adminUsers.id, adminId))
      .returning() || [];
    
    return !!updatedAdmin;
  }
  
  // Admin Two-Factor Authentication operations
  async saveAdminTOTPSecret(adminId: number, secret: string): Promise<boolean> {
    // For security, we'll store the temporary TOTP secret directly in the admin user record
    // with a flag indicating it's not yet verified
    if (!db) return false;
    
    const [updatedAdmin] = await db.update(adminUsers)
      .set({ 
        twoFactorSecret: secret,
        updatedAt: new Date()
      })
      .where(eq(adminUsers.id, adminId))
      .returning() || [];
    
    return !!updatedAdmin;
  }
  
  async getAdminTOTPSecret(adminId: number): Promise<string | undefined> {
    if (!db) return undefined;
    
    const [admin] = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.id, adminId)) || [];
    
    return admin?.twoFactorSecret || undefined;
  }
  
  async enableAdminTwoFactor(adminId: number, secret: string): Promise<boolean> {
    if (!db) return false;
    
    const [updatedAdmin] = await db.update(adminUsers)
      .set({ 
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        updatedAt: new Date()
      })
      .where(eq(adminUsers.id, adminId))
      .returning() || [];
    
    return !!updatedAdmin;
  }
  
  async disableAdminTwoFactor(adminId: number): Promise<boolean> {
    if (!db) return false;
    
    const [updatedAdmin] = await db.update(adminUsers)
      .set({ 
        twoFactorEnabled: false,
        twoFactorSecret: null,
        updatedAt: new Date()
      })
      .where(eq(adminUsers.id, adminId))
      .returning() || [];
    
    return !!updatedAdmin;
  }
  
  // Admin Logging operations
  async createAdminActionLog(log: InsertAdminActionLog): Promise<AdminActionLog> {
    if (!db) throw new Error("Database not available");
    
    const [newLog] = await db.insert(adminActionLogs)
      .values({
        ...log,
        timestamp: log.timestamp || new Date()
      })
      .returning() || [];
    
    return newLog;
  }
  
  async createAdminActivityLog(log: InsertAdminActivityLog): Promise<AdminActivityLog> {
    if (!db) throw new Error("Database not available");
    
    const [newLog] = await db.insert(adminActivityLogs)
      .values({
        ...log,
        timestamp: log.timestamp || new Date()
      })
      .returning() || [];
    
    return newLog;
  }
  
  async getAdminActionLogs(adminId: number, page: number = 1, pageSize: number = 20): Promise<{logs: AdminActionLog[], total: number}> {
    if (!db) return { logs: [], total: 0 };
    
    // First count total logs
    const [{ count }] = await db.select({ count: sql`count(*)` })
      .from(adminActionLogs)
      .where(eq(adminActionLogs.adminId, adminId)) || [{ count: 0 }];
    
    // Then get paginated logs
    const offset = (page - 1) * pageSize;
    const logs = await db.select()
      .from(adminActionLogs)
      .where(eq(adminActionLogs.adminId, adminId))
      .orderBy(desc(adminActionLogs.timestamp))
      .limit(pageSize)
      .offset(offset) || [];
    
    return {
      logs,
      total: Number(count)
    };
  }
  
  // User management from admin perspective
  async getAllUsersWithPagination(options: {
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
    userType?: string;
    isActive?: boolean;
  }): Promise<{users: User[], total: number}> {
    if (!db) return { users: [], total: 0 };
    
    const { page, pageSize, sortBy, sortOrder, search, userType, isActive } = options;
    const offset = (page - 1) * pageSize;
    const conditions: SQL<unknown>[] = [];
    
    // Apply search filter
    if (search) {
      const searchTerm = `%${search.toLowerCase()}%`;
      conditions.push(
        sql`(LOWER(${users.username}) LIKE ${searchTerm} OR 
             LOWER(${users.email}) LIKE ${searchTerm} OR 
             LOWER(${users.firstName}) LIKE ${searchTerm} OR 
             LOWER(${users.lastName}) LIKE ${searchTerm})`
      );
    }
    
    // Apply userType filter
    if (userType) {
      conditions.push(eq(users.userType, userType));
    }
    
    // Apply active status filter
    if (isActive !== undefined) {
      conditions.push(eq(users.blocked, !isActive));
    }
    
    // Build the WHERE clause
    const whereClause = conditions.length ? and(...conditions) : undefined;
    
    // First count total users
    const [{ count }] = await db.select({ count: sql`count(*)` })
      .from(users)
      .where(whereClause) || [{ count: 0 }];
    
    // Build the ORDER BY clause
    let orderByClause;
    const column = users[sortBy as keyof typeof users];
    
    if (column) {
      orderByClause = sortOrder === 'asc' ? asc(column) : desc(column);
    } else {
      // Default fallback
      orderByClause = sortOrder === 'asc' ? asc(users.id) : desc(users.id);
    }
    
    // Then get paginated users
    const userList = await db.select()
      .from(users)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset) || [];
    
    return {
      users: userList,
      total: Number(count)
    };
  }
  
  async getUserActivityLogs(userId: number, options: {page: number, pageSize: number}): Promise<{activityLogs: any[], total: number}> {
    // In a real implementation, we would collect activity from various tables
    // For now we'll return empty results
    return {
      activityLogs: [],
      total: 0
    };
  }
  
  async resetUserPassword(userId: number, newPassword: string): Promise<boolean> {
    if (!db) return false;
    
    const [updatedUser] = await db.update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId))
      .returning() || [];
    
    return !!updatedUser;
  }
  
  async getUserStats(): Promise<{total: number, professionals: number, companies: number, active: number, inactive: number}> {
    if (!db) return { total: 0, professionals: 0, companies: 0, active: 0, inactive: 0 };
    
    const [totalResult] = await db.select({ count: sql`count(*)` })
      .from(users) || [{ count: 0 }];
    
    const [professionalsResult] = await db.select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.userType, 'professional')) || [{ count: 0 }];
    
    const [companiesResult] = await db.select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.userType, 'company')) || [{ count: 0 }];
    
    const [activeResult] = await db.select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.blocked, false)) || [{ count: 0 }];
    
    const [inactiveResult] = await db.select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.blocked, true)) || [{ count: 0 }];
    
    return {
      total: Number(totalResult.count),
      professionals: Number(professionalsResult.count),
      companies: Number(companiesResult.count),
      active: Number(activeResult.count),
      inactive: Number(inactiveResult.count)
    };
  }
  
  async getNewUsersCount(since: Date): Promise<number> {
    if (!db) return 0;
    
    const [result] = await db.select({ count: sql`count(*)` })
      .from(users)
      .where(gte(users.createdAt, since)) || [{ count: 0 }];
    
    return Number(result.count);
  }
  
  async getActiveUsersCount(since: Date): Promise<number> {
    if (!db) return 0;
    
    const [result] = await db.select({ count: sql`count(*)` })
      .from(users)
      .where(and(
        isNotNull(users.lastActiveAt),
        gte(users.lastActiveAt, since)
      )) || [{ count: 0 }];
    
    return Number(result.count);
  }
  
  async getUserSubscription(userId: number): Promise<any> {
    if (!db) return null;
    
    const [user] = await db.select({
      id: users.id,
      stripeCustomerId: users.stripeCustomerId,
      stripeSubscriptionId: users.stripeSubscriptionId,
      subscriptionTier: users.subscriptionTier,
      subscriptionStatus: users.subscriptionStatus
    })
    .from(users)
    .where(eq(users.id, userId)) || [];
    
    if (!user || !user.stripeSubscriptionId) return null;
    
    // In a real implementation, we would fetch subscription details from Stripe
    return {
      id: user.stripeSubscriptionId,
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      startDate: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  }
  
  async getUserTransactions(userId: number): Promise<any[]> {
    // In a real implementation, we would fetch transaction history from Stripe
    return [];
  }
  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db?.select().from(reviews).where(eq(reviews.id, id)) || [];
    return review;
  }
  
  async getProfessionalReviews(professionalId: number): Promise<Review[]> {
    const results = await db?.select()
      .from(reviews)
      .where(eq(reviews.professionalId, professionalId))
      .orderBy(desc(reviews.createdAt)) || [];
    return results;
  }
  
  async getCompanyReviews(companyId: number): Promise<Review[]> {
    const results = await db?.select()
      .from(reviews)
      .where(eq(reviews.companyId, companyId))
      .orderBy(desc(reviews.createdAt)) || [];
    return results;
  }
  
  async getConsultationReview(consultationId: number): Promise<Review | undefined> {
    const [review] = await db?.select()
      .from(reviews)
      .where(eq(reviews.consultationId, consultationId)) || [];
    return review;
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db?.insert(reviews)
      .values(review)
      .returning() || [];
    
    // Update the professional's rating
    await this.updateProfessionalRating(review.professionalId);
    
    return newReview;
  }
  
  async updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined> {
    const [updatedReview] = await db?.update(reviews)
      .set(reviewData)
      .where(eq(reviews.id, id))
      .returning() || [];
    
    if (updatedReview && reviewData.rating !== undefined) {
      await this.updateProfessionalRating(updatedReview.professionalId);
    }
    
    return updatedReview;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    const [deletedReview] = await db?.delete(reviews)
      .where(eq(reviews.id, id))
      .returning() || [];
    
    if (deletedReview) {
      await this.updateProfessionalRating(deletedReview.professionalId);
      return true;
    }
    
    return false;
  }
  
  async updateProfessionalRating(professionalId: number): Promise<boolean> {
    // Get all reviews for this professional
    const professionalReviews = await this.getProfessionalReviews(professionalId);
    
    if (professionalReviews.length === 0) {
      // Reset rating if no reviews
      await db?.update(professionalProfiles)
        .set({
          rating: 0,
          reviewCount: 0
        })
        .where(eq(professionalProfiles.id, professionalId));
      return true;
    }
    
    // Calculate average rating
    const totalRating = professionalReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round(totalRating / professionalReviews.length);
    
    // Update the professional profile
    await db?.update(professionalProfiles)
      .set({
        rating: averageRating,
        reviewCount: professionalReviews.length
      })
      .where(eq(professionalProfiles.id, professionalId));
    
    return true;
  }

  // Notification operations
  async getNotificationType(id: number): Promise<NotificationType | undefined> {
    const [notificationType] = await getDB().select()
      .from(notificationTypes)
      .where(eq(notificationTypes.id, id));
    return notificationType;
  }
  
  async getNotificationTypeByName(name: string): Promise<NotificationType | undefined> {
    const [notificationType] = await getDB().select()
      .from(notificationTypes)
      .where(eq(notificationTypes.name, name));
    return notificationType;
  }
  
  async getAllNotificationTypes(): Promise<NotificationType[]> {
    const results = await getDB().select().from(notificationTypes);
    return results;
  }
  
  async createNotificationType(type: InsertNotificationType): Promise<NotificationType> {
    const [newType] = await getDB().insert(notificationTypes)
      .values(type)
      .returning();
    return newType;
  }
  
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await getDB().select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return notification;
  }
  
  async getUserNotifications(userId: number): Promise<Notification[]> {
    const results = await getDB().select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return results;
  }
  
  async getUserUnreadNotifications(userId: number): Promise<Notification[]> {
    try {
      const results = await getDB().select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        ))
        .orderBy(desc(notifications.createdAt));
      return results;
    } catch (err) {
      console.error("Error getting unread notifications:", err);
      return [];
    }
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await getDB().insert(notifications)
      .values({
        ...notification,
        read: false
      })
      .returning();
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<boolean> {
    const [updated] = await getDB().update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return !!updated;
  }
  
  async markAllUserNotificationsAsRead(userId: number): Promise<boolean> {
    await getDB().update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
    return true;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    const [deleted] = await getDB().delete(notifications)
      .where(eq(notifications.id, id))
      .returning();
    return !!deleted;
  }
  
  async getUserNotificationPreference(userId: number, typeId: number): Promise<NotificationPreference | undefined> {
    if (!useRealDatabase) {
      // Only for MemStorage class
      if (this instanceof MemStorage) {
        return Array.from(this.notificationPreferences.values())
          .find((p: NotificationPreference) => p.userId === userId && p.typeId === typeId);
      }
      return undefined;
    }

    try {
      // Database implementation with proper error handling
      const result = await getDB().select()
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.userId, userId),
            eq(notificationPreferences.typeId, typeId)
          )
        );
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error("Error getting user notification preference:", error);
      return undefined;
    }
  }
  
  async getUserNotificationPreferences(userId: number): Promise<NotificationPreference[]> {
    if (!useRealDatabase) {
      // Only for MemStorage class
      if (this instanceof MemStorage) {
        return Array.from(this.notificationPreferences.values())
          .filter((p: NotificationPreference) => p.userId === userId);
      }
      return [];
    }
    
    // Database implementation with proper error handling
    try {
      const preferences = await getDB().select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));
      return preferences;
    } catch (error) {
      console.error("Error getting user notification preferences:", error);
      return [];
    }
  }
  
  async createOrUpdateNotificationPreference(preference: InsertNotificationPreference): Promise<NotificationPreference> {
    // Check if preference already exists
    const existingPreference = await this.getUserNotificationPreference(
      preference.userId, 
      preference.typeId
    );
    
    if (!useRealDatabase) {
      // Only for MemStorage implementation
      if (this instanceof MemStorage) {
        if (existingPreference) {
          // Update existing preference
          const updated: NotificationPreference = {
            ...existingPreference,
            email: preference.email !== undefined ? preference.email : existingPreference.email,
            inApp: preference.inApp !== undefined ? preference.inApp : existingPreference.inApp
          };
          
          this.notificationPreferences.set(existingPreference.id, updated);
          return updated;
        } else {
          // Create new preference
          const id = this.notificationPreferenceId++;
          const newPreference: NotificationPreference = {
            id,
            userId: preference.userId,
            typeId: preference.typeId,
            email: preference.email !== undefined ? preference.email : true,
            inApp: preference.inApp !== undefined ? preference.inApp : true
          };
          
          this.notificationPreferences.set(id, newPreference);
          return newPreference;
        }
      }
      
      // If not MemStorage, create a mock notification preference
      return {
        id: 0,
        userId: preference.userId,
        typeId: preference.typeId,
        email: preference.email !== undefined ? preference.email : true,
        inApp: preference.inApp !== undefined ? preference.inApp : true
      };
    }
    
    // Database implementation
    try {
      if (existingPreference) {
        // Update existing preference
        const [updated] = await getDB().update(notificationPreferences)
          .set({
            email: preference.email !== undefined ? preference.email : existingPreference.email,
            inApp: preference.inApp !== undefined ? preference.inApp : existingPreference.inApp
          })
          .where(eq(notificationPreferences.id, existingPreference.id))
          .returning();
        return updated;
      } else {
        // Create new preference with proper default values
        const insertPreference = {
          ...preference,
          email: preference.email !== undefined ? preference.email : true,
          inApp: preference.inApp !== undefined ? preference.inApp : true
        };
        
        const [newPreference] = await getDB().insert(notificationPreferences)
          .values(insertPreference)
          .returning();
        return newPreference;
      }
    } catch (error) {
      console.error("Error creating/updating notification preference:", error);
      throw error;
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    if (!db) return undefined;
    
    try {
      // Get basic user fields that are guaranteed to exist
      const query = `
        SELECT 
          id, username, password, email, 
          first_name AS "firstName", last_name AS "lastName", user_type AS "userType", 
          is_admin AS "isAdmin", created_at AS "createdAt", 
          stripe_customer_id AS "stripeCustomerId", 
          stripe_subscription_id AS "stripeSubscriptionId",
          subscription_tier AS "subscriptionTier", 
          subscription_status AS "subscriptionStatus", 
          reset_token AS "resetToken", reset_token_expiry AS "resetTokenExpiry",
          email_verified AS "emailVerified", 
          email_verification_token AS "emailVerificationToken", 
          google_id AS "googleId", linkedin_id AS "linkedinId"
        FROM users 
        WHERE id = $1
      `;
      
      const result = await (pool?.query(query, [id]));
      if (!result?.rows || result.rows.length === 0) return undefined;
      
      // Convert returned data to User type
      const user: any = result.rows[0];
      
      // Add default values for potentially missing columns
      if (!('blocked' in user)) user.blocked = false;
      if (!('blockReason' in user)) user.blockReason = null;
      if (!('lastActiveAt' in user)) user.lastActiveAt = null;
      if (!('deleted' in user)) user.deleted = false; 
      if (!('deletedAt' in user)) user.deletedAt = null;
      
      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      
      // Fallback to a basic query when the column error occurs
      try {
        const [user] = await db.select({
          id: users.id,
          username: users.username,
          password: users.password,
          email: users.email, 
          firstName: users.firstName,
          lastName: users.lastName,
          userType: users.userType,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
          stripeCustomerId: users.stripeCustomerId,
          stripeSubscriptionId: users.stripeSubscriptionId
        }).from(users).where(eq(users.id, id));
        
        if (!user) return undefined;
        
        // Add missing fields with default values
        return {
          ...user,
          subscriptionTier: null,
          subscriptionStatus: null,
          resetToken: null,
          resetTokenExpiry: null,
          emailVerified: null,
          emailVerificationToken: null,
          googleId: null,
          linkedinId: null,
          blocked: false,
          blockReason: null,
          lastActiveAt: null,
          deleted: false,
          deletedAt: null
        } as User;
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return undefined;
      }
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) return undefined;
    
    try {
      // Get basic user fields that are guaranteed to exist
      const query = `
        SELECT 
          id, username, password, email, 
          first_name AS "firstName", last_name AS "lastName", user_type AS "userType", 
          is_admin AS "isAdmin", created_at AS "createdAt", 
          stripe_customer_id AS "stripeCustomerId", 
          stripe_subscription_id AS "stripeSubscriptionId",
          subscription_tier AS "subscriptionTier", 
          subscription_status AS "subscriptionStatus", 
          reset_token AS "resetToken", reset_token_expiry AS "resetTokenExpiry",
          email_verified AS "emailVerified", 
          email_verification_token AS "emailVerificationToken", 
          google_id AS "googleId", linkedin_id AS "linkedinId"
        FROM users 
        WHERE username = $1
      `;
      
      const result = await (pool?.query(query, [username]));
      if (!result?.rows || result.rows.length === 0) return undefined;
      
      // Convert returned data to User type
      const user: any = result.rows[0];
      
      // Add default values for potentially missing columns
      if (!('blocked' in user)) user.blocked = false;
      if (!('blockReason' in user)) user.blockReason = null;
      if (!('lastActiveAt' in user)) user.lastActiveAt = null;
      if (!('deleted' in user)) user.deleted = false; 
      if (!('deletedAt' in user)) user.deletedAt = null;
      
      return user;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      
      // Fallback to a basic query
      try {
        const [user] = await db.select({
          id: users.id,
          username: users.username,
          password: users.password,
          email: users.email, 
          firstName: users.firstName,
          lastName: users.lastName,
          userType: users.userType,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
          stripeCustomerId: users.stripeCustomerId,
          stripeSubscriptionId: users.stripeSubscriptionId
        }).from(users).where(eq(users.username, username));
        
        if (!user) return undefined;
        
        // Add missing fields with default values
        return {
          ...user,
          subscriptionTier: null,
          subscriptionStatus: null,
          resetToken: null,
          resetTokenExpiry: null,
          emailVerified: null,
          emailVerificationToken: null,
          googleId: null,
          linkedinId: null,
          blocked: false,
          blockReason: null,
          lastActiveAt: null,
          deleted: false,
          deletedAt: null
        } as User;
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return undefined;
      }
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) return undefined;
    
    try {
      // Get basic user fields that are guaranteed to exist
      const query = `
        SELECT 
          id, username, password, email, 
          first_name AS "firstName", last_name AS "lastName", user_type AS "userType", 
          is_admin AS "isAdmin", created_at AS "createdAt", 
          stripe_customer_id AS "stripeCustomerId", 
          stripe_subscription_id AS "stripeSubscriptionId",
          subscription_tier AS "subscriptionTier", 
          subscription_status AS "subscriptionStatus", 
          reset_token AS "resetToken", reset_token_expiry AS "resetTokenExpiry",
          email_verified AS "emailVerified", 
          email_verification_token AS "emailVerificationToken", 
          google_id AS "googleId", linkedin_id AS "linkedinId"
        FROM users 
        WHERE email = $1
      `;
      
      const result = await (pool?.query(query, [email]));
      if (!result?.rows || result.rows.length === 0) return undefined;
      
      // Convert returned data to User type
      const user: any = result.rows[0];
      
      // Add default values for potentially missing columns
      if (!('blocked' in user)) user.blocked = false;
      if (!('blockReason' in user)) user.blockReason = null;
      if (!('lastActiveAt' in user)) user.lastActiveAt = null;
      if (!('deleted' in user)) user.deleted = false; 
      if (!('deletedAt' in user)) user.deletedAt = null;
      
      return user;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      
      // Fallback to a basic query
      try {
        const [user] = await db.select({
          id: users.id,
          username: users.username,
          password: users.password,
          email: users.email, 
          firstName: users.firstName,
          lastName: users.lastName,
          userType: users.userType,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
          stripeCustomerId: users.stripeCustomerId,
          stripeSubscriptionId: users.stripeSubscriptionId
        }).from(users).where(eq(users.email, email));
        
        if (!user) return undefined;
        
        // Add missing fields with default values
        return {
          ...user,
          subscriptionTier: null,
          subscriptionStatus: null,
          resetToken: null,
          resetTokenExpiry: null,
          emailVerified: null,
          emailVerificationToken: null,
          googleId: null,
          linkedinId: null,
          blocked: false,
          blockReason: null,
          lastActiveAt: null,
          deleted: false,
          deletedAt: null
        } as User;
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return undefined;
      }
    }
  }
  
  async getUserBySocialProvider(provider: string, profileId: string): Promise<User | undefined> {
    if (!db) return undefined;
    
    try {
      const fieldName = `${provider}Id` as keyof typeof users;
      
      // Use raw SQL query to handle potential missing columns
      const query = `
        SELECT 
          id, username, password, email, 
          first_name AS "firstName", last_name AS "lastName", user_type AS "userType", 
          is_admin AS "isAdmin", created_at AS "createdAt", 
          stripe_customer_id AS "stripeCustomerId", 
          stripe_subscription_id AS "stripeSubscriptionId",
          subscription_tier AS "subscriptionTier", 
          subscription_status AS "subscriptionStatus", 
          reset_token AS "resetToken", reset_token_expiry AS "resetTokenExpiry",
          email_verified AS "emailVerified", 
          email_verification_token AS "emailVerificationToken", 
          google_id AS "googleId", linkedin_id AS "linkedinId"
        FROM users 
        WHERE ${provider}_id = $1
      `;
      
      const result = await pool?.query(query, [profileId]);
      if (!result?.rows || result.rows.length === 0) return undefined;
      
      // Convert returned data to User type
      const user: any = result.rows[0];
      
      // Add default values for potentially missing columns
      if (!('blocked' in user)) user.blocked = false;
      if (!('blockReason' in user)) user.blockReason = null;
      if (!('lastActiveAt' in user)) user.lastActiveAt = null;
      if (!('deleted' in user)) user.deleted = false; 
      if (!('deletedAt' in user)) user.deletedAt = null;
      
      return user;
    } catch (error) {
      console.error("Error fetching user by social provider:", error);
      
      // Fallback to standard ORM query if raw query fails
      try {
        const fieldName = `${provider}Id` as keyof typeof users;
        const [user] = await db.select({
          id: users.id,
          username: users.username,
          password: users.password,
          email: users.email, 
          firstName: users.firstName,
          lastName: users.lastName,
          userType: users.userType,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
          stripeCustomerId: users.stripeCustomerId,
          stripeSubscriptionId: users.stripeSubscriptionId,
          [fieldName]: users[fieldName] as any
        }).from(users).where(eq(users[fieldName] as any, profileId));
        
        if (!user) return undefined;
        
        // Add missing fields with default values
        return {
          ...user,
          subscriptionTier: null,
          subscriptionStatus: null,
          resetToken: null,
          resetTokenExpiry: null,
          emailVerified: null,
          emailVerificationToken: null,
          googleId: null,
          linkedinId: null,
          blocked: false,
          blockReason: null,
          lastActiveAt: null,
          deleted: false,
          deletedAt: null
        } as User;
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return undefined;
      }
    }
  }
  
  async linkSocialAccount(userId: number, provider: string, profileId: string): Promise<User | undefined> {
    if (!db) return undefined;
    
    try {
      const fieldName = `${provider}Id` as keyof typeof users;
      
      // First, make sure the user exists
      const existingUser = await this.getUser(userId);
      if (!existingUser) {
        console.error(`User with ID ${userId} not found for social linking`);
        return undefined;
      }
      
      // Use raw SQL for update to avoid column errors
      const query = `
        UPDATE users
        SET ${provider}_id = $1
        WHERE id = $2
        RETURNING id, username, email, 
                 first_name AS "firstName", last_name AS "lastName", user_type AS "userType", 
                 is_admin AS "isAdmin", created_at AS "createdAt", 
                 google_id AS "googleId", linkedin_id AS "linkedinId"
      `;
      
      const result = await pool?.query(query, [profileId, userId]);
      if (!result?.rows || result.rows.length === 0) return undefined;
      
      // Return updated user with default values for any missing fields
      const updatedUser = await this.getUser(userId);
      return updatedUser;
    } catch (error) {
      console.error(`Error linking ${provider} account:`, error);
      
      // Fallback to standard ORM update
      try {
        const fieldName = `${provider}Id` as keyof typeof users;
        const [updatedUser] = await db
          .update(users)
          .set({ [fieldName]: profileId })
          .where(eq(users.id, userId))
          .returning();
        
        return updatedUser;
      } catch (fallbackError) {
        console.error("Fallback update also failed:", fallbackError);
        return undefined;
      }
    }
  }
  
  async createUserFromSocial(user: Partial<InsertUser> & { email: string; username: string; password: string }): Promise<User> {
    if (!db) throw new Error("Database connection not available");
    
    // Insert the user
    const [newUser] = await db
      .insert(users)
      .values({
        username: user.username,
        password: user.password,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        userType: user.userType || "professional",
        isAdmin: user.isAdmin || false,
        emailVerified: user.emailVerified || false,
        profilePhotoUrl: user.profilePhotoUrl || null,
        googleId: user.googleId || null,
        linkedinId: user.linkedinId || null,
      })
      .returning();
    
    return newUser;
  }
  
  // Password and account recovery operations
  async createResetToken(email: string): Promise<string | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user) return null;
      
      // Generate a random token
      const token = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
      
      // Set expiry to 1 hour from now
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      
      // Update user with token
      await db.update(users)
        .set({
          resetToken: token,
          resetTokenExpiry: expiryDate
        })
        .where(eq(users.id, user.id));
      
      return token;
    } catch (error) {
      console.error("Error creating reset token:", error);
      return null;
    }
  }
  
  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      const now = new Date();
      const [user] = await db.select()
        .from(users)
        .where(
          and(
            eq(users.resetToken, token),
            sql`${users.resetTokenExpiry} > ${now}`
          )
        );
      
      return user;
    } catch (error) {
      console.error("Error getting user by reset token:", error);
      return undefined;
    }
  }
  
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.getUserByResetToken(token);
      if (!user) return false;
      
      // Update user with new password and clear token
      await db.update(users)
        .set({
          password: newPassword,
          resetToken: null,
          resetTokenExpiry: null
        })
        .where(eq(users.id, user.id));
      
      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      return false;
    }
  }

  // These methods are already defined above
  
  async getAllUsers(): Promise<User[]> {
    if (!db) return [];
    
    try {
      // Use raw SQL to ensure correct column mapping
      const query = `
        SELECT 
          id, username, password, email, 
          first_name AS "firstName", last_name AS "lastName", user_type AS "userType", 
          is_admin AS "isAdmin", created_at AS "createdAt", 
          stripe_customer_id AS "stripeCustomerId", 
          stripe_subscription_id AS "stripeSubscriptionId",
          subscription_tier AS "subscriptionTier", 
          subscription_status AS "subscriptionStatus", 
          reset_token AS "resetToken", reset_token_expiry AS "resetTokenExpiry",
          email_verified AS "emailVerified", 
          email_verification_token AS "emailVerificationToken", 
          google_id AS "googleId", linkedin_id AS "linkedinId"
        FROM users
      `;
      
      const result = await (pool?.query(query));
      if (!result?.rows) return [];
      
      return result.rows;
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      
      // Fallback to standard ORM query if raw query fails
      try {
        return await db.select().from(users);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return [];
      }
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    // Make sure isAdmin is set to false if not provided
    const userData = { 
      ...user,
      isAdmin: user.isAdmin || false
    };
    const [createdUser] = await db.insert(users).values(userData).returning();
    return createdUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    try {
      console.log(`Storage: Attempting to delete user with ID: ${id}`);
      
      // Start a transaction to handle related records
      return await db.transaction(async (tx) => {
        // Check for company profiles associated with this user
        const companyProfileResults = await tx
          .select({ id: companyProfiles.id })
          .from(companyProfiles)
          .where(eq(companyProfiles.userId, id));
          
        if (companyProfileResults.length > 0) {
          console.log(`Cannot delete user ${id}: Found ${companyProfileResults.length} associated company profiles`);
          throw new Error(`User is associated with company profiles. Please delete those first.`);
        }
        
        // Check for professional profiles associated with this user
        const professionalProfileResults = await tx
          .select({ id: professionalProfiles.id })
          .from(professionalProfiles)
          .where(eq(professionalProfiles.userId, id));
          
        if (professionalProfileResults.length > 0) {
          console.log(`Cannot delete user ${id}: Found ${professionalProfileResults.length} associated professional profiles`);
          throw new Error(`User is associated with professional profiles. Please delete those first.`);
        }
        
        // Check for job postings, resources, etc. associated with this user
        // Check for other dependencies as needed...
        
        // If no dependencies found, proceed with deletion
        const result = await tx
          .delete(users)
          .where(eq(users.id, id))
          .returning({ id: users.id });
          
        const success = result.length > 0;
        console.log(`User deletion ${success ? 'successful' : 'failed'} for ID: ${id}`);
        return success;
      });
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error; // Re-throw to handle in the route
    }
  }

  // Stripe operations
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    return this.updateUser(userId, { stripeCustomerId: customerId });
  }

  async updateStripeSubscriptionId(userId: number, subscriptionId: string): Promise<User | undefined> {
    return this.updateUser(userId, { stripeSubscriptionId: subscriptionId });
  }

  async updateUserSubscription(userId: number, tier: string, status: string): Promise<User | undefined> {
    return this.updateUser(userId, { subscriptionTier: tier, subscriptionStatus: status });
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId));
    return user;
  }

  // Professional Profile operations
  async getProfessionalProfile(id: number): Promise<ProfessionalProfile | undefined> {
    const [profile] = await db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.id, id));
    return profile;
  }

  async getProfessionalProfileByUserId(userId: number): Promise<ProfessionalProfile | undefined> {
    const [profile] = await db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, userId));
    return profile;
  }

  async getAllProfessionalProfiles(): Promise<ProfessionalProfile[]> {
    if (!db) {
      console.warn("Database not available, using empty result for getAllProfessionalProfiles");
      return [];
    }
    return db.select().from(professionalProfiles);
  }

  async getFeaturedProfessionalProfiles(limit: number): Promise<ProfessionalProfile[]> {
    if (!db) {
      console.warn("Database not available, using empty result for getFeaturedProfessionalProfiles");
      return [];
    }
    return db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.featured, true))
      .limit(limit);
  }

  async createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile> {
    const [createdProfile] = await db
      .insert(professionalProfiles)
      .values(profile)
      .returning();
    return createdProfile;
  }

  async updateProfessionalProfile(
    id: number,
    profile: Partial<InsertProfessionalProfile>
  ): Promise<ProfessionalProfile | undefined> {
    const [updatedProfile] = await db
      .update(professionalProfiles)
      .set(profile)
      .where(eq(professionalProfiles.id, id))
      .returning();
    return updatedProfile;
  }
  
  async deleteProfessionalProfile(id: number): Promise<boolean> {
    const result = await db
      .delete(professionalProfiles)
      .where(eq(professionalProfiles.id, id))
      .returning({ id: professionalProfiles.id });
    return result.length > 0;
  }

  // Expertise operations
  async getAllExpertise(): Promise<Expertise[]> {
    if (!db) {
      console.warn("Database not available, using empty result for getAllExpertise");
      return [];
    }
    return db.select().from(expertise);
  }

  async getExpertiseById(id: number): Promise<Expertise | undefined> {
    const [exp] = await db.select().from(expertise).where(eq(expertise.id, id));
    return exp;
  }

  async createExpertise(exp: InsertExpertise): Promise<Expertise> {
    const [createdExpertise] = await db.insert(expertise).values(exp).returning();
    return createdExpertise;
  }

  async getProfessionalExpertise(professionalId: number): Promise<Expertise[]> {
    const professionalExps = await db
      .select()
      .from(professionalExpertise)
      .where(eq(professionalExpertise.professionalId, professionalId));

    const expertiseIds = professionalExps.map((pe) => pe.expertiseId);
    if (expertiseIds.length === 0) return [];

    return db
      .select()
      .from(expertise)
      .where(
        or(...expertiseIds.map((id) => eq(expertise.id, id)))
      );
  }

  async addProfessionalExpertise(
    professionalExpertiseData: InsertProfessionalExpertise
  ): Promise<ProfessionalExpertise> {
    const [createdProfExpertise] = await db
      .insert(professionalExpertise)
      .values(professionalExpertiseData)
      .returning();
    return createdProfExpertise;
  }

  // Certification operations
  async getCertification(id: number): Promise<Certification | undefined> {
    const [certification] = await db
      .select()
      .from(certifications)
      .where(eq(certifications.id, id));
    return certification;
  }
  
  async getProfessionalCertifications(professionalId: number): Promise<Certification[]> {
    return db
      .select()
      .from(certifications)
      .where(eq(certifications.professionalId, professionalId));
  }

  async createCertification(certification: InsertCertification): Promise<Certification> {
    const [createdCertification] = await db
      .insert(certifications)
      .values(certification)
      .returning();
    return createdCertification;
  }

  async deleteCertification(id: number): Promise<boolean> {
    const result = await db
      .delete(certifications)
      .where(eq(certifications.id, id))
      .returning({ id: certifications.id });
    return result.length > 0;
  }

  // Company Profile operations
  async getCompanyProfile(id: number): Promise<CompanyProfile | undefined> {
    const [profile] = await db
      .select()
      .from(companyProfiles)
      .where(eq(companyProfiles.id, id));
    return profile;
  }

  async getCompanyProfileByUserId(userId: number): Promise<CompanyProfile | undefined> {
    const [profile] = await db
      .select()
      .from(companyProfiles)
      .where(eq(companyProfiles.userId, userId));
    return profile;
  }

  async getAllCompanyProfiles(): Promise<CompanyProfile[]> {
    if (!db) {
      console.warn("Database not available, using empty result for getAllCompanyProfiles");
      return [];
    }
    return db.select().from(companyProfiles);
  }

  async createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
    const [createdProfile] = await db
      .insert(companyProfiles)
      .values(profile)
      .returning();
    return createdProfile;
  }

  async updateCompanyProfile(
    id: number,
    profile: Partial<InsertCompanyProfile>
  ): Promise<CompanyProfile | undefined> {
    const [updatedProfile] = await db
      .update(companyProfiles)
      .set(profile)
      .where(eq(companyProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  // Job Posting operations
  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    const [jobPosting] = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, id));
    return jobPosting;
  }

  async getAllJobPostings(): Promise<JobPosting[]> {
    if (!db) {
      console.warn("Database not available, using empty result for getAllJobPostings");
      return [];
    }
    return db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.status, "open"))
      .orderBy(desc(jobPostings.createdAt));
  }

  async getLatestJobPostings(limit: number): Promise<JobPosting[]> {
    if (!db) {
      console.warn("Database not available, using empty result for getLatestJobPostings");
      return [];
    }
    return db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.status, "open"))
      .orderBy(desc(jobPostings.createdAt))
      .limit(limit);
  }

  async getCompanyJobPostings(companyId: number): Promise<JobPosting[]> {
    return db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.companyId, companyId))
      .orderBy(desc(jobPostings.createdAt));
  }

  async createJobPosting(job: InsertJobPosting): Promise<JobPosting> {
    const [createdJob] = await db.insert(jobPostings).values(job).returning();
    return createdJob;
  }

  async updateJobPosting(
    id: number,
    job: Partial<InsertJobPosting>
  ): Promise<JobPosting | undefined> {
    const [updatedJob] = await db
      .update(jobPostings)
      .set(job)
      .where(eq(jobPostings.id, id))
      .returning();
    return updatedJob;
  }

  async deleteJobPosting(id: number): Promise<boolean> {
    const result = await db
      .delete(jobPostings)
      .where(eq(jobPostings.id, id))
      .returning({ id: jobPostings.id });
    return result.length > 0;
  }

  // Job Application operations
  async getJobApplication(id: number): Promise<JobApplication | undefined> {
    const [jobApplication] = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.id, id));
    return jobApplication;
  }

  async getJobApplicationsByJob(jobId: number): Promise<JobApplication[]> {
    return db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.jobId, jobId))
      .orderBy(desc(jobApplications.createdAt));
  }

  async getJobApplicationsByProfessional(professionalId: number): Promise<JobApplication[]> {
    return db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.professionalId, professionalId))
      .orderBy(desc(jobApplications.createdAt));
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [createdApplication] = await db
      .insert(jobApplications)
      .values(application)
      .returning();
    return createdApplication;
  }

  async updateJobApplicationStatus(
    id: number,
    status: string
  ): Promise<JobApplication | undefined> {
    const [updatedApplication] = await db
      .update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, id))
      .returning();
    return updatedApplication;
  }

  // Resource operations
  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id));
    return resource;
  }

  async getAllResources(): Promise<Resource[]> {
    if (!db) {
      console.warn("Database not available, using empty result for getAllResources");
      return [];
    }
    return db.select().from(resources).orderBy(desc(resources.createdAt));
  }

  async getFeaturedResources(limit: number): Promise<Resource[]> {
    if (!db) {
      console.warn("Database not available, using empty result for getFeaturedResources");
      return [];
    }
    return db
      .select()
      .from(resources)
      .where(eq(resources.featured, true))
      .orderBy(desc(resources.createdAt))
      .limit(limit);
  }
  
  async getResourcesByCategory(categoryId: number): Promise<Resource[]> {
    return db
      .select()
      .from(resources)
      .where(eq(resources.categoryId, categoryId))
      .orderBy(desc(resources.createdAt));
  }
  
  async getResourcesByAuthor(authorId: number): Promise<Resource[]> {
    return db
      .select()
      .from(resources)
      .where(eq(resources.authorId, authorId))
      .orderBy(desc(resources.createdAt));
  }
  
  async searchResources(query?: string, type?: string, categoryId?: number): Promise<Resource[]> {
    // Start with base query conditions
    const conditions: SQL<unknown>[] = [];
    
    // Add search conditions if query provided
    if (query) {
      const searchTerm = `%${query.toLowerCase()}%`;
      // Create a single SQL condition for text search
      conditions.push(
        sql`(LOWER(${resources.title}) LIKE ${searchTerm} OR LOWER(${resources.description}) LIKE ${searchTerm})`
      );
    }
    
    // Add type filter if provided
    if (type) {
      conditions.push(eq(resources.resourceType, type));
    }
    
    // Add category filter if provided
    if (categoryId) {
      conditions.push(eq(resources.categoryId, categoryId));
    }
    
    // Execute query with all conditions
    let query_result;
    if (conditions.length > 0) {
      query_result = await db
        .select()
        .from(resources)
        .where(and(...conditions))
        .orderBy(desc(resources.createdAt));
    } else {
      // No conditions, get all resources
      query_result = await db
        .select()
        .from(resources)
        .orderBy(desc(resources.createdAt));
    }
    
    return query_result;
  }
  
  async getResourceCategory(id: number): Promise<ResourceCategory | undefined> {
    const [category] = await db
      .select()
      .from(resourceCategories)
      .where(eq(resourceCategories.id, id));
    return category;
  }
  
  async getAllResourceCategories(): Promise<ResourceCategory[]> {
    if (!db) {
      console.warn("Database not available, using empty result for getAllResourceCategories");
      return [];
    }
    return db.select().from(resourceCategories);
  }
  
  async createResourceCategory(category: InsertResourceCategory): Promise<ResourceCategory> {
    const [newCategory] = await db
      .insert(resourceCategories)
      .values(category)
      .returning();
    return newCategory;
  }
  
  async setResourceFeatured(id: number, featured: boolean): Promise<Resource | undefined> {
    const [updatedResource] = await db
      .update(resources)
      .set({ featured })
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [createdResource] = await db
      .insert(resources)
      .values(resource)
      .returning();
    return createdResource;
  }

  async updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined> {
    const [updatedResource] = await db
      .update(resources)
      .set(resource)
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }
  
  async deleteResource(id: number): Promise<boolean> {
    const result = await db
      .delete(resources)
      .where(eq(resources.id, id))
      .returning({ id: resources.id });
    return result.length > 0;
  }

  // Forum operations
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    const [post] = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.id, id));
    return post;
  }

  async getAllForumPosts(): Promise<ForumPost[]> {
    if (!db) {
      console.warn("Database not available, using empty result for getAllForumPosts");
      return [];
    }
    return db
      .select()
      .from(forumPosts)
      .orderBy(desc(forumPosts.createdAt));
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [createdPost] = await db.insert(forumPosts).values(post).returning();
    return createdPost;
  }

  async getPostComments(postId: number): Promise<ForumComment[]> {
    return db
      .select()
      .from(forumComments)
      .where(eq(forumComments.postId, postId))
      .orderBy(asc(forumComments.createdAt));
  }

  async createForumComment(comment: InsertForumComment): Promise<ForumComment> {
    const [createdComment] = await db
      .insert(forumComments)
      .values(comment)
      .returning();
    return createdComment;
  }

  // Message operations
  async getUserMessages(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user1Id),
            eq(messages.receiverId, user2Id)
          ),
          and(
            eq(messages.senderId, user2Id),
            eq(messages.receiverId, user1Id)
          )
        )
      )
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [createdMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return createdMessage;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, id))
      .returning({ id: messages.id });
    return result.length > 0;
  }

  // Consultation operations
  async getConsultation(id: number): Promise<Consultation | undefined> {
    const [consultation] = await db
      .select()
      .from(consultations)
      .where(eq(consultations.id, id));
    return consultation;
  }

  async getProfessionalConsultations(professionalId: number): Promise<Consultation[]> {
    return db
      .select()
      .from(consultations)
      .where(eq(consultations.professionalId, professionalId))
      .orderBy(desc(consultations.createdAt));
  }

  async getCompanyConsultations(companyId: number): Promise<Consultation[]> {
    return db
      .select()
      .from(consultations)
      .where(eq(consultations.companyId, companyId))
      .orderBy(desc(consultations.createdAt));
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const [createdConsultation] = await db
      .insert(consultations)
      .values(consultation)
      .returning();
    return createdConsultation;
  }

  async updateConsultationStatus(
    id: number,
    status: string
  ): Promise<Consultation | undefined> {
    const [updatedConsultation] = await db
      .update(consultations)
      .set({ status })
      .where(eq(consultations.id, id))
      .returning();
    return updatedConsultation;
  }

  // Skill Recommendation operations
  async getSkillRecommendation(id: number): Promise<SkillRecommendation | undefined> {
    const [recommendation] = await db
      .select()
      .from(skillRecommendations)
      .where(eq(skillRecommendations.id, id));
    return recommendation;
  }

  async getSkillRecommendationsByProfessional(professionalId: number): Promise<SkillRecommendation | undefined> {
    const [recommendation] = await db
      .select()
      .from(skillRecommendations)
      .where(eq(skillRecommendations.professionalId, professionalId));
    return recommendation;
  }

  async createSkillRecommendation(recommendation: InsertSkillRecommendation): Promise<SkillRecommendation> {
    const [createdRecommendation] = await db
      .insert(skillRecommendations)
      .values(recommendation)
      .returning();
    return createdRecommendation;
  }

  async updateSkillRecommendation(id: number, recommendation: Partial<InsertSkillRecommendation>): Promise<SkillRecommendation | undefined> {
    const [updatedRecommendation] = await db
      .update(skillRecommendations)
      .set({ ...recommendation, updatedAt: new Date() })
      .where(eq(skillRecommendations.id, id))
      .returning();
    return updatedRecommendation;
  }

  // Professional Expertise operations
  async deleteProfessionalExpertise(id: number): Promise<boolean> {
    try {
      console.log(`Storage: Attempting to delete professional expertise with ID: ${id}`);
      
      const result = await db
        .delete(professionalExpertise)
        .where(eq(professionalExpertise.id, id))
        .returning({ id: professionalExpertise.id });
        
      const success = result.length > 0;
      console.log(`Professional expertise deletion ${success ? 'successful' : 'failed'} for ID: ${id}`);
      return success;
    } catch (error) {
      console.error(`Error deleting professional expertise with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Job Application operations
  async deleteJobApplication(id: number): Promise<boolean> {
    try {
      console.log(`Storage: Attempting to delete job application with ID: ${id}`);
      
      const result = await db
        .delete(jobApplications)
        .where(eq(jobApplications.id, id))
        .returning({ id: jobApplications.id });
        
      const success = result.length > 0;
      console.log(`Job application deletion ${success ? 'successful' : 'failed'} for ID: ${id}`);
      return success;
    } catch (error) {
      console.error(`Error deleting job application with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Company Profile operations
  async deleteCompanyProfile(id: number): Promise<boolean> {
    try {
      console.log(`Storage: Attempting to delete company profile with ID: ${id}`);
      
      const result = await db
        .delete(companyProfiles)
        .where(eq(companyProfiles.id, id))
        .returning({ id: companyProfiles.id });
        
      const success = result.length > 0;
      console.log(`Company profile deletion ${success ? 'successful' : 'failed'} for ID: ${id}`);
      return success;
    } catch (error) {
      console.error(`Error deleting company profile with ID ${id}:`, error);
      throw error;
    }
  }

  // Page Content operations
  async getPageContent(id: number): Promise<PageContent | undefined> {
    const [content] = await db
      .select()
      .from(pageContents)
      .where(eq(pageContents.id, id));
    return content;
  }

  async getPageContentBySlug(slug: string): Promise<PageContent | undefined> {
    const [content] = await db
      .select()
      .from(pageContents)
      .where(eq(pageContents.slug, slug));
    return content;
  }

  async getAllPageContents(): Promise<PageContent[]> {
    if (!db) {
      console.warn("Database not available, using empty result for getAllPageContents");
      return [];
    }
    return db.select().from(pageContents).orderBy(desc(pageContents.updatedAt));
  }

  async createPageContent(content: InsertPageContent): Promise<PageContent> {
    const [created] = await db
      .insert(pageContents)
      .values({
        ...content,
        lastEditedBy: content.lastEditedBy || null
      })
      .returning();
    return created;
  }

  async updatePageContent(id: number, content: Partial<InsertPageContent>): Promise<PageContent | undefined> {
    const [updated] = await db
      .update(pageContents)
      .set({
        ...content,
        updatedAt: new Date(),
        lastEditedBy: content.lastEditedBy !== undefined ? content.lastEditedBy : null
      })
      .where(eq(pageContents.id, id))
      .returning();
    return updated;
  }

  async deletePageContent(id: number): Promise<boolean> {
    try {
      console.log(`Storage: Attempting to delete page content with ID: ${id}`);
      
      // First verify the record exists to avoid unnecessary delete operations
      const existing = await db
        .select({ id: pageContents.id })
        .from(pageContents)
        .where(eq(pageContents.id, id));
        
      if (existing.length === 0) {
        console.log(`Storage: Page content with ID ${id} not found, nothing to delete`);
        return false;
      }
      
      // If it exists, proceed with deletion
      const result = await db
        .delete(pageContents)
        .where(eq(pageContents.id, id))
        .returning({ id: pageContents.id });
        
      const success = result.length > 0;
      console.log(`Storage: Delete operation for page content ID ${id} result:`, success ? 'Success' : 'Failed');
      
      return success;
    } catch (error) {
      console.error(`Storage: Error deleting page content with ID ${id}:`, error);
      throw error; // Re-throw to allow proper error handling
    }
  }
  
  // AI Matching operations
  async getMatchingJobsForProfessional(professionalId: number, limit: number = 5): Promise<Array<{job: JobPosting, score: number}>> {
    try {
      // Get the professional profile
      const [professional] = await db.select().from(professionalProfiles)
        .where(eq(professionalProfiles.id, professionalId));
      
      if (!professional) {
        return [];
      }
      
      // Get all open job postings
      const jobs = await db.select().from(jobPostings)
        .where(eq(jobPostings.status, "open"));
      
      // Import AI services locally to avoid circular dependencies
      const { calculateProfileJobMatchScore } = await import('./ai-services');
      
      // Generate match scores using AI services
      const matchPromises = jobs.map(async (job) => {
        try {
          // Calculate match score using AI embeddings with fallback
          const score = await calculateProfileJobMatchScore(professional, job);
          return { job, score };
        } catch (error) {
          console.error(`Error matching job ${job.id} with professional ${professionalId}:`, error);
          // Return a very low score if there was an error
          return { job, score: 0.01 };
        }
      });
      
      // Resolve all match promises
      const matches = await Promise.all(matchPromises);
      
      // Sort by score (descending) and apply limit
      return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting matching jobs:", error);
      return [];
    }
  }
  
  async getMatchingProfessionalsForJob(jobId: number, limit: number = 5): Promise<Array<{professional: ProfessionalProfile, score: number}>> {
    try {
      // Get the job posting
      const [job] = await db.select().from(jobPostings)
        .where(eq(jobPostings.id, jobId));
      
      if (!job) {
        return [];
      }
      
      // Get all professional profiles
      const professionals = await db.select().from(professionalProfiles);
      
      // Import AI services locally to avoid circular dependencies
      const { calculateProfileJobMatchScore } = await import('./ai-services');
      
      // Generate match scores using AI services
      const matchPromises = professionals.map(async (professional) => {
        try {
          // Calculate match score using AI embeddings with fallback
          // We'll use the same function but invert the parameters order in the results
          const score = await calculateProfileJobMatchScore(professional, job);
          return { professional, score };
        } catch (error) {
          console.error(`Error matching professional ${professional.id} with job ${jobId}:`, error);
          // Return a very low score if there was an error
          return { professional, score: 0.01 };
        }
      });
      
      // Resolve all match promises
      const matches = await Promise.all(matchPromises);
      
      // Sort by score (descending) and apply limit
      return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting matching professionals:", error);
      return [];
    }
  }
  
  async saveJobMatch(jobId: number, professionalId: number, score: number): Promise<boolean> {
    try {
      // In a real implementation, we would add a job_matches table
      // For now, this is a placeholder function since we're calculating scores on the fly
      return true;
    } catch (error) {
      console.error("Error saving job match:", error);
      return false;
    }
  }
}

// Dynamically use MemStorage or DatabaseStorage based on database connection status
export const storage = useRealDatabase ? new DatabaseStorage() : new MemStorage();
