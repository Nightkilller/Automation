/**
 * Calls the Groq API to generate slide content for a selected daily tech roundup.
 * @param {Object} topicObj - { type: 'roundup', seeds: string[] }
 * @returns {Promise<Object>} The generated slides JSON object.
 */
export async function generateSlides(topicObj) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined in environment variables.');
  }

  // Format the 6 selected seeds for the prompt
  const seedsList = (topicObj.seeds || [])
    .map((seed, idx) => `Seed ${idx + 1}: ${seed}`)
    .join('\n\n');

  const prompt = `Here are the 6 distinct tech updates for today's roundup:\n\n${seedsList}`;

  console.log('[GENERATOR] Querying Groq API to generate a 6-topic daily tech roundup carousel...');

  try {
    return await callGroqAPI(apiKey, prompt);
  } catch (error) {
    console.warn('[GENERATOR] First attempt failed. Retrying with a stricter format reminder...', error);
    const retryPrompt = `${prompt}\n\nCRITICAL RETRY WARNING: Return ONLY a single raw valid JSON object. Start directly with { and end with }. Do not write markdown code blocks. Make sure there are exactly 8 slides (1 title, 6 body, 1 cta).`;
    return await callGroqAPI(apiKey, retryPrompt);
  }
}

/**
 * Handles the actual network request and response parsing.
 */
async function callGroqAPI(apiKey, userPrompt) {
  const systemPrompt = `You are an elite tech copywriter. Write a highly engaging, visual, and informative Instagram-style daily tech updates roundup slides deck (exactly 8 slides).
You are given 6 distinct tech news or concept seeds.

You must output a single JSON object matching this schema exactly:
{
  "topic": "Catchy daily roundup title (e.g. Daily Tech Drops - June 23)",
  "instagram_caption": "A compelling, high-conversion Instagram post caption for this slides deck. Structure it with a short catchy hook, a brief numbered list summarizing each of the 6 news updates in 1 sentence, and 5-8 relevant trending hashtags (e.g. #tech #artificialintelligence #programming). Keep it clean, professional, and easy to read.",
  "slides": [
    {
      "type": "title",
      "heading": "Today's Tech & AI Drops",
      "subheading": "6 critical updates you need to know today (Swipe →)"
    },
    // Generate exactly 6 body slides, where Slide 2 covers Seed 1, Slide 3 covers Seed 2, ..., Slide 7 covers Seed 6.
    {
      "type": "body",
      "heading": "Catchy Title for Seed 1 (max 6 words)",
      "category": "ai", // Must choose one from: ai, coding, security, hardware, cloud, mobile, business, general
      "description": "A well-written, informative, and engaging narrative paragraph explaining this update in detail (about 40-50 words). Make it interesting, detailed, and clear so readers fully understand the topic and find it highly informative."
    },
    {
      "type": "cta",
      "heading": "Follow for daily tech drops",
      "subheading": "Swipe ← or Save this post"
    }
  ]
}

Constraints:
1. Output MUST contain exactly 8 slides (1 title slide, 6 body slides, and 1 CTA slide).
2. Each of the 6 body slides must correspond to one of the 6 user-provided seeds in sequential order (Slide 2 -> Seed 1, Slide 3 -> Seed 2, etc.).
3. The category MUST be strictly selected from the allowed list: ai, coding, security, hardware, cloud, mobile, business, general.
4. The description MUST be a complete, cohesive paragraph of 40-50 words (no bullet points, no lists).
5. Output ONLY valid JSON. Use JSON mode. Do not write markdown, do not write code blocks.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' } // Tells Groq to output JSON
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API returned HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error('Groq API returned an empty response content.');
  }

  // Clean raw output in case LLM outputs markdown fences despite instructions
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '');
  }
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  // Validate minimal schema constraints
  if (!parsed.topic || !Array.isArray(parsed.slides) || parsed.slides.length < 5) {
    throw new Error('JSON response format is invalid or has insufficient slides.');
  }

  console.log(`[GENERATOR] Successfully generated roundup content for "${parsed.topic}" containing ${parsed.slides.length} slides.`);
  return parsed;
}
