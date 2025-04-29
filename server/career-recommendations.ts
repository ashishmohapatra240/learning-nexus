
import OpenAI from 'openai';
import type { ProfessionalProfile, Expertise } from '@shared/schema';

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI();
  } else {
    console.warn("OpenAI API key is missing. Career recommendation features will be disabled.");
  }
} catch (error) {
  console.warn("OpenAI client initialization failed. Career recommendation features will be disabled.");
}

interface CareerRecommendation {
  role: string;
  description: string;
  requiredSkills: string[];
  courses: Array<{
    name: string;
    provider: string;
    description: string;
  }>;
  marketDemand: string;
  estimatedSalary: string;
}

export async function generateCareerRecommendations(
  profile: ProfessionalProfile,
  expertise: Expertise[]
): Promise<CareerRecommendation[]> {
  // If OpenAI is not available, return static recommendations based on expertise
  if (!openai) {
    console.log("Using fallback career recommendations as OpenAI is not available");
    return generateFallbackRecommendations(expertise);
  }
  
  try {
    const prompt = `Given an L&D professional with the following profile:
Title: ${profile.title}
Bio: ${profile.bio}
Expertise: ${expertise.map(e => e.name).join(', ')}

Provide 3 career path recommendations including:
- Suitable role
- Role description
- Required skills
- Recommended courses for upskilling
- Market demand
- Estimated salary range

Format as structured data.`;

    // We've already checked if openai is null above, but TypeScript still complains
    // Using the non-null assertion operator to inform TypeScript that openai is definitely not null here
    const response = await openai!.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a career advisor specializing in Learning & Development careers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    // Using optional chaining and nullish coalescing to handle potential null values safely
    const content = response.choices[0]?.message?.content || '{"careers": []}';
    const recommendations = JSON.parse(content);
    return recommendations.careers;
  } catch (error) {
    console.error("Error generating career recommendations:", error);
    return generateFallbackRecommendations(expertise);
  }
}

// Fallback recommendations when OpenAI is not available
function generateFallbackRecommendations(expertise: Expertise[]): CareerRecommendation[] {
  // Common L&D roles
  const commonRoles: CareerRecommendation[] = [
    {
      role: "Learning Experience Designer",
      description: "Design engaging and effective learning experiences across various platforms and modalities to meet organizational and learner needs.",
      requiredSkills: ["Instructional Design", "LMS Management", "Content Creation", "Learning Assessment"],
      courses: [
        {
          name: "Learning Experience Design Certificate",
          provider: "Association for Talent Development",
          description: "Comprehensive course covering modern learning design principles"
        },
        {
          name: "User Experience for Learning Design",
          provider: "Coursera",
          description: "Applies UX principles to learning experiences"
        }
      ],
      marketDemand: "High demand as organizations focus on digital learning experiences",
      estimatedSalary: "$70,000 - $95,000 USD annually"
    },
    {
      role: "Corporate Training Manager",
      description: "Oversee training programs, manage learning budgets, and align learning initiatives with business objectives.",
      requiredSkills: ["Program Management", "Stakeholder Management", "Budget Planning", "Team Leadership"],
      courses: [
        {
          name: "Training Management Professional",
          provider: "Training Industry",
          description: "Certification for training department management"
        },
        {
          name: "Strategic Leadership in L&D",
          provider: "LinkedIn Learning",
          description: "Focus on aligning L&D with business needs"
        }
      ],
      marketDemand: "Stable demand across industries for experienced managers",
      estimatedSalary: "$85,000 - $120,000 USD annually"
    },
    {
      role: "Learning Consultant",
      description: "Provide expert guidance to organizations on learning strategy, program design, and performance improvement initiatives.",
      requiredSkills: ["Needs Analysis", "Performance Consulting", "Project Management", "Presentation Skills"],
      courses: [
        {
          name: "Performance Consulting Masterclass",
          provider: "Learning and Performance Institute",
          description: "Advanced consulting skills for L&D professionals"
        },
        {
          name: "ROI Methodology Certification",
          provider: "ROI Institute",
          description: "Measuring and demonstrating learning impact"
        }
      ],
      marketDemand: "Growing demand as organizations seek strategic L&D guidance",
      estimatedSalary: "$90,000 - $150,000 USD annually"
    }
  ];
  
  return commonRoles;
}
