import type { Request, Response } from "express";
import { storage } from "./storage";
import { JobPosting, ProfessionalProfile } from "@shared/schema";

// Controller for AI matching endpoints

// Get matching jobs for a professional profile
export async function getMatchingJobsForProfessional(req: Request, res: Response) {
  try {
    const professionalId = parseInt(req.params.professionalId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    if (isNaN(professionalId)) {
      return res.status(400).json({ message: "Invalid professional ID" });
    }
    
    // Use the storage method to get matching jobs
    const matchingJobs = await storage.getMatchingJobsForProfessional(professionalId, limit);
    
    // Format the response with enhanced match details
    const formattedMatches = matchingJobs.map(match => ({
      job: match.job,
      matchScore: Math.round(match.score * 100), // Format as percentage
      matchStrength: getMatchStrengthLabel(match.score),
      matchReasons: generateMatchReasons(match.job, match.score)
    }));
    
    return res.json(formattedMatches);
  } catch (error) {
    console.error("Error in AI matching jobs for professional:", error);
    return res.status(500).json({ message: "Failed to retrieve matching jobs" });
  }
}

// Get matching professionals for a job posting
export async function getMatchingProfessionalsForJob(req: Request, res: Response) {
  try {
    const jobId = parseInt(req.params.jobId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    if (isNaN(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    
    // Use the storage method to get matching professionals
    const matchingProfessionals = await storage.getMatchingProfessionalsForJob(jobId, limit);
    
    // Format the response with enhanced match details
    const formattedMatches = matchingProfessionals.map(match => ({
      professional: match.professional,
      matchScore: Math.round(match.score * 100), // Format as percentage
      matchStrength: getMatchStrengthLabel(match.score),
      matchReasons: generateMatchReasons(match.professional, match.score)
    }));
    
    return res.json(formattedMatches);
  } catch (error) {
    console.error("Error in AI matching professionals for job:", error);
    return res.status(500).json({ message: "Failed to retrieve matching professionals" });
  }
}

// Helper function to convert score to a descriptive strength label
function getMatchStrengthLabel(score: number): string {
  if (score >= 0.8) return "Excellent Match";
  if (score >= 0.6) return "Strong Match";
  if (score >= 0.4) return "Good Match";
  if (score >= 0.2) return "Moderate Match";
  return "Basic Match";
}

// Helper function to generate human-readable match reasons 
// This will be enhanced later with more sophisticated AI analysis
function generateMatchReasons(entity: JobPosting | ProfessionalProfile, score: number): string[] {
  const reasons: string[] = [];
  
  // Basic reasons based on match score
  if (score >= 0.8) {
    reasons.push("Highly relevant skills and experience");
    reasons.push("Strong alignment with requirements");
  } else if (score >= 0.6) {
    reasons.push("Good skills match");
    reasons.push("Relevant experience");
  } else if (score >= 0.4) {
    reasons.push("Some matching skills");
    reasons.push("Partial alignment with requirements");
  } else {
    reasons.push("Basic match on key terms");
  }
  
  // If this is a job posting
  if ('description' in entity && 'requirements' in entity) {
    reasons.push("Based on job description and requirements");
  } 
  // If this is a professional profile
  else if ('bio' in entity && 'title' in entity) {
    reasons.push("Based on professional bio and expertise");
  }
  
  return reasons;
}