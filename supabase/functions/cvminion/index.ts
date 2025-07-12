import { OpenAI } from "jsr:@openai/openai";
import { zodResponseFormat } from "npm:openai/helpers/zod";
import { z } from "npm:zod";

interface Skill {
  name: string;
  level: string;
}

interface Language {
  name: string;
  level: string;
}

interface Project {
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
}

interface Certification {
  name: string;
  organization: string | null;
}

interface Experience {
  position: string;
  company: string;
  company_description: string;
  start_date: string;
  end_date: string;
  location: string;
  key_achievements: string[];
  responsibilities: string[];
}

interface Education {
  degree: string;
  field: string;
  institution: string;
  start_date: string;
  end_date: string;
  relevant_coursework?: string[];
  other_details?: string[];
}

interface Resume {
  full_name: string;
  phone_number: string;
  address: string;
  email: string;
  website: string;
  linkedin: string;
  summary: string;
  experience: Experience[];
  skills: Skill[];
  education: Education[];
  languages: Language[];
  projects: Project[];
  certifications: Certification[];
}

interface ATSScore {
  overall_score: number;
  keyword_match_score: number;
  format_score: number;
  content_quality_score: number;
  missing_keywords: string[];
  improvement_suggestions: string[];
}

const client = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});
const model = Deno.env.get("MODEL_NAME") || "o4-mini";

const ResumeSchema = z.object({
  full_name: z.string(),
  phone_number: z.string(),
  address: z.string(),
  email: z.string(),
  website: z.string(),
  linkedin: z.string(),
  summary: z.string(),
  experience: z.array(z.object({
    position: z.string(),
    company: z.string(),
    company_description: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    location: z.string(),
    key_achievements: z.array(z.string()),
    responsibilities: z.array(z.string()),
  })),
  skills: z.array(z.object({
    name: z.string(),
    level: z.string(),
  })),
  education: z.array(z.object({
    degree: z.string(),
    field: z.string(),
    institution: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    relevant_coursework: z.array(z.string()),
    other_details: z.array(z.string()),
  })),
  languages: z.array(z.object({
    name: z.string(),
    level: z.string(),
  })),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string(),
    start_date: z.string(),
    end_date: z.string(),
  })),
  certifications: z.array(z.object({
    name: z.string(),
    organization: z.string(),
  })),
});

const ATSResponseSchema = z.object({
  overall_score: z.number(),
  keyword_match_score: z.number(),
  format_score: z.number(),
  content_quality_score: z.number(),
  missing_keywords: z.array(z.string()),
  improvement_suggestions: z.array(z.string()),
});

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  dateStr = dateStr.trim();
  if (dateStr.toLowerCase() === "present") return "Present";
  if (dateStr.length === 4 && /^\d+$/.test(dateStr)) return `01/${dateStr}`;
  return dateStr;
}

function formatResume(data: Record<string, any>): Resume {
  return {
    full_name: data.full_name || "",
    phone_number: data.phone_number || "",
    address: data.address || "",
    email: data.email || "",
    website: data.website || "",
    linkedin: data.linkedin || "",
    summary: data.summary || "",
    experience: (data.experience || []).map((exp: Experience) => ({
      position: exp.position || "",
      company: exp.company || "",
      company_description: exp.company_description || "",
      start_date: formatDate(exp.start_date || exp.start_date || ""),
      end_date: formatDate(exp.end_date || exp.end_date || "Present"),
      location: exp.location || "",
      key_achievements: exp.key_achievements || [],
      responsibilities: exp.responsibilities || [],
    })),
    skills: (data.skills || []).map((skill: Skill) => ({
      name: skill.name || "",
      level: skill.level || "Intermediate",
    })),
    education: (data.education || []).map((edu: Education) => ({
      degree: edu.degree || "",
      field: edu.field || "",
      institution: edu.institution || "",
      start_date: formatDate(edu.start_date || edu.start_date || ""),
      end_date: formatDate(edu.end_date || edu.end_date || "Present"),
      relevant_coursework: edu.relevant_coursework || [],
      other_details: edu.other_details || [],
    })),
    languages: (data.languages || []).map((lang: Language) => ({
      name: lang.name || "",
      level: lang.level || "Intermediate",
    })),
    projects: (data.projects || []).map((project: Project) => ({
      title: project.title || "",
      description: project.description || "",
      start_date: formatDate(project.start_date || project.start_date || ""),
      end_date: formatDate(project.end_date || project.end_date || "Present"),
    })),
    certifications: (data.certifications || []).map((cert: Certification) => ({
      name: cert.name || "",
      organization: cert.organization || "",
    })),
  };
}

function convertToATSScore(data: Record<string, any>): ATSScore {
  return {
    overall_score: data.overall_score || 0,
    keyword_match_score: data.keyword_match_score || 0,
    format_score: data.format_score || 0,
    content_quality_score: data.content_quality_score || 0,
    missing_keywords: data.missing_keywords || [],
    improvement_suggestions: data.improvement_suggestions || [],
  };
}

async function tailorResume(
  resume: Resume,
  job_description: string,
): Promise<Resume> {
  const example_enhancement = `
    Original: "Developed automation and deployment monitoring tools using Go"
    Enhanced: "Developed automation and deployment monitoring tools using Go, focusing on container fleet management and infrastructure components"
    
    Original: "Led the adoption of Backstage for the developers"
    Enhanced: "Led the adoption of Backstage for developers, improving system debugging capabilities and code review processes"
    `;

  const prompt =
    `You are a professional resume writer expert at tailoring resumes to specific job descriptions.
Your task is to enhance the descriptions and wording ONLY - do not add, remove, or change any positions, companies, dates, or core information.

Job Description:
${job_description}

Resume to Enhance:
${JSON.stringify(resume)}

CRITICAL RULES - VIOLATION WILL RESULT IN REJECTION:
        1. PRESERVE EXACTLY:
           - All company names
           - All job titles
           - All dates exactly as provided
           - Number of experiences
           - Original structure of the resume
        
        2. ONLY ALLOWED CHANGES:
           - Enhance descriptions to use relevant keywords from job description
           - Reword responsibilities to highlight relevant aspects
           - Add a relevant summary based on existing information
           - Format dates consistently
           - Make sure to add new skills if they can be inferred from the job description, experience, or other information
        
        3. ABSOLUTELY FORBIDDEN:
           - DO NOT add new jobs
           - DO NOT change job titles
           - DO NOT modify company names
           - DO NOT add education if not provided
           - DO NOT create fictional achievements
           - DO NOT include any markdown formatting, backticks, or additional text.

        Here's how to enhance content while preserving information:
        ${example_enhancement}

        FINAL CHECKS:
        1. Verify all original positions are preserved
        2. Confirm no new jobs or experiences were added
        3. Ensure all dates match the original exactly
        4. Validate that only descriptions were enhanced
        5. Check that all original skills are maintained
        6. Verify education and languages arrays are included (empty if not provided)

        """

        `;

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a professional resume writer expert at tailoring resumes to specific job descriptions.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.6,
    response_format: zodResponseFormat(ResumeSchema, "resume"),
  });

  try {
    const content = response.choices[0].message.content?.trim();
    if (!content) throw new Error("Empty response from OpenAI");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    throw new Error("Failed to parse OpenAI response as JSON");
  }
}

async function generateATSScore(
  resume: Resume,
  job_description: string,
): Promise<ATSScore> {
  const prompt =
    `Analyze the following resume against the job description and provide an ATS compatibility score.

Job Description:
${job_description}

Resume:
${JSON.stringify(resume)}
`

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are an ATS system expert at analyzing resumes. Always return valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    response_format: zodResponseFormat(ATSResponseSchema, "ats_score"),
  });

  try {
    const content = response.choices[0].message.content?.trim();
    if (!content) throw new Error("Empty response from OpenAI");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    throw new Error("Failed to parse OpenAI response as JSON");
  }
}

// async function improveResumeWithATSFeedback(
//   resume: Resume,
//   job_description: string,
//   ats_score: ATSScore,
// ): Promise<Resume> {
//   const prompt =
//     `Please improve the following resume based on the ATS feedback provided.
// Focus specifically on addressing the missing keywords and implementing the improvement suggestions.

// Job Description:
// ${job_description}

// Current Resume:
// ${JSON.stringify(resume)}

// ATS Feedback:
// - Overall Score: ${ats_score.overall_score}
// - Keyword Match Score: ${ats_score.keyword_match_score}
// - Format Score: ${ats_score.format_score}
// - Content Quality Score: ${ats_score.content_quality_score}
// - Missing Keywords: ${ats_score.missing_keywords}
// - Improvement Suggestions: ${ats_score.improvement_suggestions}

// IMPORTANT: Return ONLY a valid JSON object with the improved resume in the exact same format as the input resume.
// DO NOT include any markdown formatting, backticks, or additional text.`;

//   const response = await client.chat.completions.create({
//     model,
//     messages: [
//       {
//         role: "system",
//         content:
//           "You are a professional resume writer expert at optimizing resumes based on ATS feedback. Always return valid JSON.",
//       },
//       { role: "user", content: prompt },
//     ],
//     temperature: 0.5,
//     response_format: { type: "json_object" },
//   });

//   try {
//     const content = response.choices[0].message.content?.trim();
//     if (!content) throw new Error("Empty response from OpenAI");
//     return JSON.parse(content);
//   } catch (error) {
//     console.error("Error parsing OpenAI response:", error);
//     throw new Error("Failed to parse OpenAI response as JSON");
//   }
// }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const {
      resume,
      job_description,
      // perform_second_pass = false,
    } = await req.json();
    const completeResume = formatResume(resume);

    // First pass: Tailor the resume
    const tailoredResume = await tailorResume(
      completeResume,
      job_description,
    );

    // Generate ATS score
    const atsScore = await generateATSScore(
      tailoredResume,
      job_description,
    );

    // // Second pass: Improve based on ATS feedback if requested
    // if (perform_second_pass && atsScore.overall_score < 90) {
    //   const improvedResume = await improveResumeWithATSFeedback(
    //     tailoredResume,
    //     job_description,
    //     atsScore,
    //   );

    //   const finalAtsScore = await generateATSScore(
    //     improvedResume,
    //     job_description,
    //   );

    //   return new Response(
    //     JSON.stringify({
    //       status: "success",
    //       tailored_resume: improvedResume,
    //       ats_score: finalAtsScore,
    //     }),
    //     {
    //       headers: {
    //         "Content-Type": "application/json",
    //         "Access-Control-Allow-Origin": "*",
    //       },
    //     },
    //   );
    // }

    return new Response(
      JSON.stringify({
        status: "success",
        tailored_resume: tailoredResume,
        ats_score: atsScore,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "error",
        detail: error instanceof Error
          ? error.message
          : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
