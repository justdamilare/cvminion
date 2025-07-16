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
  improvements_made?: {
    section: string;
    improvement: string;
    reason: string;
  }[];
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
const model = Deno.env.get("MODEL_NAME") || "gpt-4o-mini"; // Conservative model for realistic enhancements

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
    relevant_coursework: z.array(z.string()).optional(),
    other_details: z.array(z.string()).optional(),
  })),
  languages: z.array(z.object({
    name: z.string(),
    level: z.string(),
  })),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string(),
    start_date: z.string().nullable(),
    end_date: z.string().nullable(),
  })),
  certifications: z.array(z.object({
    name: z.string(),
    organization: z.string().nullable(),
  })),
  improvements_made: z.array(z.object({
    section: z.string(),
    improvement: z.string(),
    reason: z.string(),
  })).optional(),
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

function formatResume(data: Record<string, unknown>): Resume {
  return {
    full_name: (data.full_name as string) || "",
    phone_number: (data.phone_number as string) || "",
    address: (data.address as string) || "",
    email: (data.email as string) || "",
    website: (data.website as string) || "",
    linkedin: (data.linkedin as string) || "",
    summary: (data.summary as string) || "",
    experience: ((data.experience as Experience[]) || []).map((exp: Experience) => ({
      position: exp.position || "",
      company: exp.company || "",
      company_description: exp.company_description || "",
      start_date: formatDate(exp.start_date || exp.start_date || ""),
      end_date: formatDate(exp.end_date || exp.end_date || "Present"),
      location: exp.location || "",
      key_achievements: exp.key_achievements || [],
      responsibilities: exp.responsibilities || [],
    })),
    skills: ((data.skills as Skill[]) || []).map((skill: Skill) => ({
      name: skill.name || "",
      level: skill.level || "Intermediate",
    })),
    education: ((data.education as Education[]) || []).map((edu: Education) => ({
      degree: edu.degree || "",
      field: edu.field || "",
      institution: edu.institution || "",
      start_date: formatDate(edu.start_date || edu.start_date || ""),
      end_date: formatDate(edu.end_date || edu.end_date || "Present"),
      relevant_coursework: edu.relevant_coursework || [],
      other_details: edu.other_details || [],
    })),
    languages: ((data.languages as Language[]) || []).map((lang: Language) => ({
      name: lang.name || "",
      level: lang.level || "Intermediate",
    })),
    projects: ((data.projects as Project[]) || []).map((project: Project) => ({
      title: project.title || "",
      description: project.description || "",
      start_date: project.start_date ? formatDate(project.start_date) : null,
      end_date: project.end_date ? formatDate(project.end_date) : null,
    })),
    certifications: ((data.certifications as Certification[]) || []).map((cert: Certification) => ({
      name: cert.name || "",
      organization: cert.organization || null,
    })),
    improvements_made: (data.improvements_made as { section: string; improvement: string; reason: string }[]) || [],
  };
}


async function tailorResume(
  resume: Resume,
  job_description: string,
): Promise<Resume> {
  const prompt = `You are a professional resume writer expert at tailoring resumes to specific job descriptions.

Your task is to CONSERVATIVELY enhance the resume content based only on what can be reasonably inferred from the existing information. DO NOT create fictional experiences or achievements.

Job Description:
${job_description}

Resume to Enhance:
${JSON.stringify(resume)}

CONSERVATIVE ENHANCEMENT GUIDELINES:

1. PRESERVE ALL CORE FACTS:
   - Company names, job titles, and dates (keep exactly as provided)
   - Educational institutions and degrees
   - Contact information
   - All existing specific details

2. CONSERVATIVE IMPROVEMENTS ONLY:
   - Only add missing keywords that naturally fit the existing experience
   - Improve wording and presentation without adding fictional content
   - Fill empty descriptions only with content that can be reasonably inferred
   - Add relevant technical skills ONLY if they align with existing experience
   - Enhance summaries by reorganizing existing information

3. WHAT TO AVOID:
   - Do NOT create new achievements that didn't happen
   - Do NOT add specific metrics unless they can be reasonably inferred
   - Do NOT generate detailed technical implementations without evidence
   - Do NOT create elaborate project descriptions from minimal information
   - Do NOT add technologies not mentioned in existing experience

4. ALLOWED ENHANCEMENTS:
   - Improve language and professional tone
   - Add missing keywords naturally in appropriate contexts
   - Reorganize information for better presentation
   - Fill basic missing information (like generic company descriptions)
   - Add commonly used skills that align with stated experience

5. IMPROVEMENTS TRACKING:
   - Track every change made in the improvements_made array
   - Include section name, what was improved, and reason for the improvement
   - Be specific about what was modified

Return a conservatively enhanced resume that improves presentation without creating fictional content.`;

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
  const prompt = `Perform a comprehensive ATS (Applicant Tracking System) analysis of this resume against the job description.

Job Description:
${job_description}

Resume:
${JSON.stringify(resume)}

ANALYSIS REQUIREMENTS:

1. KEYWORD ANALYSIS:
   - Identify ALL missing keywords from the job description that should be present
   - Focus on technical skills, tools, frameworks, methodologies mentioned in the job
   - Include both hard skills (technologies) and soft skills (agile, leadership, etc.)

2. CONTENT QUALITY ASSESSMENT:
   - Evaluate if achievements are specific and quantified
   - Check if project descriptions are detailed and relevant
   - Assess if experience descriptions showcase impact and results
   - Review if skills section comprehensively covers job requirements

3. IMPROVEMENT SUGGESTIONS:
   - Provide specific, actionable suggestions for enhancement
   - Suggest ways to incorporate missing keywords naturally
   - Recommend content improvements for sparse sections
   - Advise on emphasizing relevant experience aspects

4. SCORING CRITERIA:
   - Keyword Match Score: How well resume keywords align with job requirements
   - Format Score: Structure, organization, and ATS-friendliness
   - Content Quality Score: Depth, specificity, and relevance of content
   - Overall Score: Comprehensive assessment of resume optimization

Provide detailed analysis that will be used to automatically improve the resume.`

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

async function improveResumeWithATSFeedback(
  resume: Resume,
  job_description: string,
  ats_score: ATSScore,
): Promise<Resume> {
  const prompt = `You are a professional resume optimization expert. Your task is to CONSERVATIVELY improve the resume by implementing relevant ATS feedback without creating fictional content.

Job Description:
${job_description}

Current Resume:
${JSON.stringify(resume)}

ATS ANALYSIS RESULTS:
- Overall Score: ${ats_score.overall_score}/100
- Keyword Match Score: ${ats_score.keyword_match_score}/100
- Format Score: ${ats_score.format_score}/100
- Content Quality Score: ${ats_score.content_quality_score}/100

MISSING KEYWORDS TO CONSIDER:
${ats_score.missing_keywords.join(", ")}

IMPROVEMENT SUGGESTIONS TO EVALUATE:
${ats_score.improvement_suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join("\n")}

CONSERVATIVE OPTIMIZATION GUIDELINES:

1. KEYWORD INTEGRATION (CONSERVATIVE):
   - Only add missing keywords that naturally fit existing experience
   - Add technologies to skills section ONLY if they align with existing roles
   - Integrate keywords into descriptions only where contextually appropriate
   - Do NOT force keywords that don't fit the candidate's background

2. IMPLEMENT REASONABLE SUGGESTIONS:
   - Only implement suggestions that don't require creating fictional content
   - Focus on presentation improvements and natural keyword integration
   - Improve existing content quality without adding fake achievements
   - Skip suggestions that would require inventing new experiences

3. CONTENT ENHANCEMENT RULES:
   - Improve wording and professional tone of existing content
   - Reorganize information for better impact
   - Add keywords naturally without creating fictional context
   - Focus on optimizing existing information rather than creating new content

4. IMPROVEMENTS TRACKING:
   - Document every change made in the improvements_made array
   - Include section name, specific improvement, and reason
   - Be transparent about what was modified during ATS optimization

5. QUALITY ASSURANCE:
   - Ensure improvements are based on existing experience
   - Verify keywords are integrated naturally and truthfully
   - Maintain factual accuracy while improving presentation
   - Focus on realistic enhancements over fictional content

Return the conservatively optimized resume that improves ATS score through realistic enhancements.`;

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are a professional resume optimization expert specializing in ATS optimization. Always return structured JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    response_format: zodResponseFormat(ResumeSchema, "optimized_resume"),
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
      perform_second_pass = true, // Enable by default for comprehensive optimization
    } = await req.json();
    const completeResume = formatResume(resume);

    // First pass: Tailor the resume with enhanced content
    const tailoredResume = await tailorResume(
      completeResume,
      job_description,
    );

    // Generate initial ATS score
    const initialAtsScore = await generateATSScore(
      tailoredResume,
      job_description,
    );

    // Second pass: Improve based on ATS feedback to maximize optimization
    if (perform_second_pass && initialAtsScore.overall_score < 95) {
      const improvedResume = await improveResumeWithATSFeedback(
        tailoredResume,
        job_description,
        initialAtsScore,
      );

      const finalAtsScore = await generateATSScore(
        improvedResume,
        job_description,
      );

      return new Response(
        JSON.stringify({
          status: "success",
          tailored_resume: improvedResume,
          ats_score: finalAtsScore,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        status: "success",
        tailored_resume: tailoredResume,
        ats_score: initialAtsScore,
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
