import OpenAI from "openai";
import { ProfessionalProfile, Expertise, JobPosting } from "@shared/schema";

interface SkillRecommendation {
  skill: string;
  relevance: number; // 0-10 scale
  description: string;
  resources: Array<{
    title: string;
    type: string;
    url?: string;
  }>;
  estimatedTimeToMaster: string; // e.g., "2-3 months"
  marketDemand: string; // e.g., "High", "Medium", "Low"
  relatedJobs: string[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSkillRecommendations(
  profile: ProfessionalProfile,
  expertise: Expertise[],
  relevantJobs?: JobPosting[]
): Promise<SkillRecommendation[]> {
  try {
    // Construct prompt with user's profile information
    const expertiseNames = expertise.map(e => e.name).join(", ");
    const jobTitles = relevantJobs ? relevantJobs.map(j => j.title).join(", ") : "";
    const jobDescriptions = relevantJobs ? relevantJobs.map(j => j.description).join("\n") : "";

    const prompt = `Based on the following L&D professional's profile, recommend 5 specific skills they should develop next to advance their career:

Professional Bio: ${profile.bio || "No bio provided"}
Experience: ${profile.yearsExperience || 0} years
Current Expertise: ${expertiseNames || "No expertise specified"}
Interests: ${profile.interests || "No interests specified"}
Industry Focus: ${profile.industryFocus || "No industry focus specified"}

${relevantJobs && relevantJobs.length > 0 ? `Relevant job opportunities they might be interested in:
Job Titles: ${jobTitles}
Job Descriptions: ${jobDescriptions}` : ""}

For each recommended skill, provide:
1. The skill name
2. Relevance score (1-10)
3. A brief description of the skill
4. 2-3 learning resources (courses, books, etc.)
5. Estimated time to master
6. Current market demand
7. Related job roles

Output in JSON format only, as an array of objects with the properties: skill, relevance, description, resources (array of objects with title, type, and optional url), estimatedTimeToMaster, marketDemand, and relatedJobs (array of strings).`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return generateFallbackRecommendations(expertise);
    }

    try {
      const parsedResponse = JSON.parse(content);
      return parsedResponse.recommendations || [];
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return generateFallbackRecommendations(expertise);
    }
  } catch (error) {
    console.error("Error generating skill recommendations:", error);
    return generateFallbackRecommendations(expertise);
  }
}

// Generate fallback recommendations when the API call fails
function generateFallbackRecommendations(expertise: Expertise[]): SkillRecommendation[] {
  // Create a set of existing expertise to avoid recommending skills the user already has
  const existingExpertise = new Set(expertise.map(e => e.name.toLowerCase()));

  // Base set of L&D skills that are commonly valuable
  const commonLDSkills = [
    {
      skill: "Instructional Design",
      relevance: 9,
      description: "The systematic design of learning materials and experiences to enhance knowledge acquisition.",
      resources: [
        { title: "Instructional Design for ELearning", type: "Book" },
        { title: "Learning Experience Design Certificate", type: "Course", url: "https://www.learning-experience-design.com/certification" }
      ],
      estimatedTimeToMaster: "3-6 months",
      marketDemand: "High",
      relatedJobs: ["Learning Designer", "Instructional Design Specialist", "Curriculum Developer"]
    },
    {
      skill: "Learning Analytics",
      relevance: 8,
      description: "Using data analysis to improve learning outcomes and educational effectiveness.",
      resources: [
        { title: "Learning Analytics Explained", type: "Book" },
        { title: "Data-Driven L&D", type: "Online Course" }
      ],
      estimatedTimeToMaster: "3-4 months",
      marketDemand: "High",
      relatedJobs: ["Learning Analytics Specialist", "L&D Data Analyst", "Training Effectiveness Manager"]
    },
    {
      skill: "Educational Technology",
      relevance: 8,
      description: "Leveraging technology to enhance learning experiences and outcomes.",
      resources: [
        { title: "EdTech Essentials", type: "Course" },
        { title: "Integrating Technology in Learning", type: "Workshop" }
      ],
      estimatedTimeToMaster: "2-3 months",
      marketDemand: "High",
      relatedJobs: ["EdTech Specialist", "Digital Learning Manager", "LMS Administrator"]
    },
    {
      skill: "Adult Learning Theory",
      relevance: 7,
      description: "Understanding how adults learn and applying these principles to training design.",
      resources: [
        { title: "The Adult Learning Theory", type: "Book" },
        { title: "Applying Adult Learning Principles", type: "Course" }
      ],
      estimatedTimeToMaster: "2-3 months",
      marketDemand: "Medium",
      relatedJobs: ["Adult Education Specialist", "Corporate Trainer", "Learning Experience Designer"]
    },
    {
      skill: "Microlearning Design",
      relevance: 8,
      description: "Creating short, focused learning units for just-in-time training.",
      resources: [
        { title: "Microlearning: Short and Sweet", type: "Book" },
        { title: "Designing Effective Microlearning", type: "Webinar" }
      ],
      estimatedTimeToMaster: "1-2 months",
      marketDemand: "High",
      relatedJobs: ["Microlearning Designer", "Mobile Learning Specialist", "Digital Content Creator"]
    },
    {
      skill: "Gamification",
      relevance: 7,
      description: "Applying game design elements to learning to increase engagement and motivation.",
      resources: [
        { title: "Gamification by Design", type: "Book" },
        { title: "Gamification in Learning", type: "Course" }
      ],
      estimatedTimeToMaster: "2-4 months",
      marketDemand: "Medium",
      relatedJobs: ["Gamification Specialist", "Learning Game Designer", "Engagement Strategist"]
    },
    {
      skill: "Learning Experience Design (LXD)",
      relevance: 9,
      description: "Designing learning experiences that are effective, engaging, and enjoyable.",
      resources: [
        { title: "LXD: From Instructional Design to Experience Design", type: "Book" },
        { title: "Learning Experience Design Certificate", type: "Certification" }
      ],
      estimatedTimeToMaster: "4-6 months",
      marketDemand: "High",
      relatedJobs: ["Learning Experience Designer", "UX Designer for Learning", "Digital Learning Architect"]
    },
    {
      skill: "Virtual Facilitation",
      relevance: 8,
      description: "Effectively leading and facilitating learning in virtual environments.",
      resources: [
        { title: "Virtual Training Basics", type: "Book" },
        { title: "Master Virtual Facilitation", type: "Workshop" }
      ],
      estimatedTimeToMaster: "2-3 months",
      marketDemand: "High",
      relatedJobs: ["Virtual Facilitator", "Online Learning Moderator", "Remote Training Specialist"]
    }
  ];

  // Filter out skills the user already has
  const filteredSkills = commonLDSkills.filter(
    skill => !existingExpertise.has(skill.skill.toLowerCase())
  );

  // Return 5 skills or fewer if not enough remain after filtering
  return filteredSkills.slice(0, 5);
}