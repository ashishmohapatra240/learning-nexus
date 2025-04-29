import OpenAI from "openai";
import type { JobPosting, ProfessionalProfile } from "@shared/schema";

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simple deterministic hashing function for text to generate mock embeddings
function simpleHash(text: string, dimensions = 256): number[] {
  // Create a deterministic but simple embedding based on string content
  const embedding = new Array(dimensions).fill(0);
  
  if (!text || text.length === 0) return embedding;
  
  // Generate values based on character codes
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const position = i % dimensions;
    embedding[position] += charCode / 1000; // Scale down values
    
    // Add some cross-influence between dimensions
    const secondaryPos = (position + (charCode % 50)) % dimensions;
    embedding[secondaryPos] += charCode / 2000;
  }
  
  // Normalize the values to be between -1 and 1
  const maxVal = Math.max(...embedding.map(Math.abs));
  if (maxVal > 0) {
    for (let i = 0; i < dimensions; i++) {
      embedding[i] = embedding[i] / maxVal;
    }
  }
  
  return embedding;
}

// Generates text embeddings using OpenAI's embedding model
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not found - using fallback embedding method");
      return simpleHash(text);
    }

    if (!text || text.trim().length === 0) {
      console.warn("Cannot generate embedding for empty text");
      return simpleHash(""); // Return zero vector
    }

    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 256, // Smaller dimension for efficiency
      });
      
      return response.data[0].embedding;
    } catch (apiError: any) {
      // Handle rate limits and other API-specific errors
      if (apiError.status === 429) {
        console.warn("OpenAI API rate limit exceeded - using fallback embedding method");
        return simpleHash(text);
      }
      
      // Handle other API errors
      console.error("OpenAI API error:", apiError.message);
      return simpleHash(text);
    }
  } catch (error) {
    console.error("Error generating embedding:", error);
    return simpleHash(text); // Fallback to deterministic method
  }
}

// Extracts relevant details from a professional profile for embedding
export async function generateProfileEmbedding(profile: ProfessionalProfile): Promise<number[] | null> {
  try {
    // Create a combined text description from relevant profile fields
    const textToEmbed = [
      profile.title,
      profile.bio,
      profile.industryFocus,
      // Additional fields could be added here as the profile schema evolves
    ]
      .filter(Boolean)
      .join(" | ");

    // If no meaningful text could be extracted, use fallback
    if (!textToEmbed || textToEmbed.trim() === "") {
      console.warn("No meaningful text in profile for embedding, using fallback");
      return simpleHash(`profile-${profile.id}-${profile.userId}`);
    }

    return await generateEmbedding(textToEmbed);
  } catch (error) {
    console.error("Error generating profile embedding:", error);
    // Return a deterministic embedding based on profile ID
    return simpleHash(`profile-${profile.id}-${profile.userId}`);
  }
}

// Extracts relevant details from a job posting for embedding
export async function generateJobEmbedding(job: JobPosting): Promise<number[] | null> {
  try {
    // Create a combined text description from relevant job fields
    const textToEmbed = [
      job.title,
      job.description,
      job.requirements,
      job.jobType,
      job.location,
      // Additional fields could be added here as the job schema evolves
    ]
      .filter(Boolean)
      .join(" | ");

    // If no meaningful text could be extracted, use fallback
    if (!textToEmbed || textToEmbed.trim() === "") {
      console.warn("No meaningful text in job posting for embedding, using fallback");
      return simpleHash(`job-${job.id}-${job.companyId}`);
    }

    return await generateEmbedding(textToEmbed);
  } catch (error) {
    console.error("Error generating job embedding:", error);
    // Return a deterministic embedding based on job ID
    return simpleHash(`job-${job.id}-${job.companyId}`);
  }
}

// Calculate the cosine similarity between two embeddings
export function calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error("Embeddings must have the same dimensions");
  }
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    magnitude1 += embedding1[i] * embedding1[i];
    magnitude2 += embedding2[i] * embedding2[i];
  }
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  return dotProduct / (magnitude1 * magnitude2);
}

// Calculate a match score between a job and a professional profile
export async function calculateProfileJobMatchScore(
  profile: ProfessionalProfile, 
  job: JobPosting
): Promise<number> {
  try {
    // Generate embeddings for the profile and job
    const profileEmbedding = await generateProfileEmbedding(profile);
    const jobEmbedding = await generateJobEmbedding(job);
    
    // If embeddings could not be generated, fall back to a simpler method
    if (!profileEmbedding || !jobEmbedding) {
      return fallbackMatchScore(profile, job);
    }
    
    // Calculate cosine similarity between embeddings
    const similarity = calculateCosineSimilarity(profileEmbedding, jobEmbedding);
    
    // Normalize similarity to a 0-1 scale (cosine similarity ranges from -1 to 1)
    return (similarity + 1) / 2;
  } catch (error) {
    console.error("Error calculating match score:", error);
    return fallbackMatchScore(profile, job);
  }
}

// Fallback scoring method when AI is not available
function fallbackMatchScore(profile: ProfessionalProfile, job: JobPosting): number {
  let score = 0;
  
  // Title match
  if (profile.title && job.title) {
    const profileTitle = profile.title.toLowerCase();
    const jobTitle = job.title.toLowerCase();
    if (profileTitle.includes(jobTitle) || jobTitle.includes(profileTitle)) {
      score += 0.3;
    }
  }
  
  // Location match
  if (profile.location && job.location && profile.location === job.location) {
    score += 0.2;
  }
  
  // Remote work preference
  if (job.remote) {
    score += 0.1;
  }
  
  // Industry match
  if (profile.industryFocus && job.description) {
    const industry = profile.industryFocus.toLowerCase();
    const description = job.description.toLowerCase();
    if (description.includes(industry)) {
      score += 0.2;
    }
  }
  
  // Rate within compensation range
  if (profile.ratePerHour && job.minCompensation && job.maxCompensation) {
    if (profile.ratePerHour >= job.minCompensation && profile.ratePerHour <= job.maxCompensation) {
      score += 0.2;
    }
  }
  
  return Math.min(score, 1.0);
}