import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtractedResumeData {
  personalInfo: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    title?: string;
    summary?: string;
  };
  experience: Array<{
    company: string;
    position: string;
    start_date: string;
    end_date: string | null;
    company_description: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    start_date: string;
    end_date: string | null;
    description?: string;
  }>;
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>;
  languages: Array<{
    name: string;
    level: 'elementary' | 'limited_working' | 'professional_working' | 'full_professional' | 'native';
  }>;
  projects: Array<{
    title: string;
    start_date: string | null;
    end_date: string | null;
  }>;
  certifications: Array<{
    name: string;
    organization: string | null;
  }>;
  confidence: {
    overall: number;
    personalInfo: number;
    experience: number;
    education: number;
    skills: number;
    languages: number;
    projects: number;
    certifications: number;
  };
  warnings: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('User not authenticated')
    }

    const { resumeText } = await req.json()

    if (!resumeText || typeof resumeText !== 'string') {
      throw new Error('Missing or invalid resumeText')
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Improved extraction with latest OpenAI best practices
    const extractedData = await extractResumeWithOpenAI(resumeText, openaiApiKey)

    return new Response(
      JSON.stringify(extractedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in ai-resume-extract function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback: true 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

async function extractResumeWithOpenAI(resumeText: string, apiKey: string): Promise<ExtractedResumeData> {
  // Truncate if too long
  const maxLength = 12000 // Increased limit for better extraction
  const truncatedText = resumeText.length > maxLength 
    ? resumeText.substring(0, maxLength) + '...'
    : resumeText

  const systemPrompt = `You are an expert resume parser with deep understanding of professional documents. Your task is to extract structured data from resumes with maximum accuracy and attention to detail.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON that matches the exact schema provided
2. Extract ALL information present - do not miss any details
3. For missing information, use null (not empty strings)
4. Pay special attention to names, job titles, companies, and dates
5. Ensure all dates are in YYYY-MM-DD format
6. Be thorough with work experience and skills extraction

EXTRACTION PRIORITIES:
- Personal information (name, contact details, job title)
- Complete work history with accurate dates and descriptions
- All skills mentioned (technical and soft skills)
- Education background
- Projects and certifications if present`

  const userPrompt = `Extract ALL data from this resume into the following JSON schema. Be extremely thorough and accurate:

{
  "personalInfo": {
    "fullName": "string or null",
    "email": "string or null", 
    "phone": "string or null",
    "address": "string or null",
    "website": "string or null",
    "linkedin": "string or null",
    "github": "string or null",
    "title": "string or null",
    "summary": "string or null"
  },
  "experience": [
    {
      "company": "string",
      "position": "string", 
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD or null for current",
      "company_description": "string",
      "highlights": ["array of key achievements and responsibilities"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string", 
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD or null",
      "description": "string or null"
    }
  ],
  "skills": [
    {
      "name": "string",
      "level": "beginner|intermediate|advanced|expert"
    }
  ],
  "languages": [
    {
      "name": "string", 
      "level": "elementary|limited_working|professional_working|full_professional|native"
    }
  ],
  "projects": [
    {
      "title": "string",
      "start_date": "YYYY-MM-DD or null",
      "end_date": "YYYY-MM-DD or null"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "organization": "string or null"
    }
  ],
  "confidence": {
    "overall": 85,
    "personalInfo": 95,
    "experience": 90, 
    "education": 85,
    "skills": 75,
    "languages": 80,
    "projects": 70,
    "certifications": 85
  },
  "warnings": ["array of any extraction issues or uncertainties"]
}

RESUME TEXT:
${truncatedText}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Latest and most cost-effective model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 4000, // Increased for comprehensive extraction
      response_format: { type: "json_object" } // Ensure JSON response
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content received from OpenAI')
  }

  try {
    const extractedData = JSON.parse(content)
    
    // Validate and enhance the extracted data
    return validateAndEnhanceData(extractedData)
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', parseError)
    throw new Error('Failed to parse AI response as JSON')
  }
}

function validateAndEnhanceData(data: any): ExtractedResumeData {
  // Ensure all required fields exist with proper defaults
  const result: ExtractedResumeData = {
    personalInfo: data.personalInfo || {},
    experience: Array.isArray(data.experience) ? data.experience : [],
    education: Array.isArray(data.education) ? data.education : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    languages: Array.isArray(data.languages) ? data.languages : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    confidence: {
      overall: data.confidence?.overall || 75,
      personalInfo: data.confidence?.personalInfo || 80,
      experience: data.confidence?.experience || 75,
      education: data.confidence?.education || 75,
      skills: data.confidence?.skills || 70,
      languages: data.confidence?.languages || 65,
      projects: data.confidence?.projects || 60,
      certifications: data.confidence?.certifications || 70,
    },
    warnings: Array.isArray(data.warnings) ? data.warnings : []
  }

  // Validate and clean email
  if (result.personalInfo.email && !isValidEmail(result.personalInfo.email)) {
    result.warnings.push('Invalid email format detected')
    result.personalInfo.email = null
  }

  // Validate dates and clean data
  result.experience = result.experience.filter(exp => exp.company && exp.position)
  result.education = result.education.filter(edu => edu.institution && edu.degree)
  result.skills = result.skills.filter(skill => skill.name)
  result.languages = result.languages.filter(lang => lang.name)
  result.projects = result.projects.filter(proj => proj.title)
  result.certifications = result.certifications.filter(cert => cert.name)

  return result
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}