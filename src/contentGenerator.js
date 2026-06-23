/**
 * Calls the Groq API to generate slide content for a selected topic.
 * @param {Object} topicObj - { type: 'news' | 'concept', seed: string }
 * @returns {Promise<Object>} The generated slides JSON object.
 */
export async function generateSlides(topicObj) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined in environment variables.');
  }

  const prompt = `Topic type: ${topicObj.type}
Topic seed/details: 
${topicObj.seed}`;

  console.log(`[GENERATOR] Querying Groq API for topic seed: "${topicObj.seed.substring(0, 60)}..."`);

  try {
    return await callGroqAPI(apiKey, prompt);
  } catch (error) {
    console.warn('[GENERATOR] First attempt failed or returned invalid format. Retrying with a stricter format reminder...', error);
    const retryPrompt = `${prompt}\n\nCRITICAL RETRY WARNING: Your previous response was invalid. Return ONLY a single raw valid JSON object. Do not wrap in markdown fences. Do not output preamble or conversational filler.`;
    return await callGroqAPI(apiKey, retryPrompt);
  }
}

/**
 * Handles the actual network request and response parsing.
 */
async function callGroqAPI(apiKey, userPrompt) {
  const systemPrompt = `You are an elite tech copywriter. Write a highly engaging, visual, and concise Instagram-style carousel slides deck (6 to 8 slides) explaining the user's topic.
You must output a single JSON object matching this schema exactly:
{
  "topic": "Short catchy topic title (max 5 words)",
  "instagram_caption": "A compelling, high-conversion Instagram post caption for this slides deck. Include a hook, bulleted summary, emojis, and 5-8 relevant trending tech/AI hashtags (e.g. #programming #artificialintelligence). Keep it structured and clean.",
  "slides": [
    {
      "type": "title",
      "heading": "Catchy Hook Title (max 8 words)",
      "subheading": "Compelling sub-hook to swipe (max 12 words)"
    },
    // Generate between 4 and 6 body slides
    {
      "type": "body",
      "heading": "Slide Title/Subheading (max 6 words)",
      "bullets": [
        "Key punchy fact or takeaway (max 15 words)",
        "Secondary context or actionable tip (max 15 words)"
      ]
    },
    {
      "type": "cta",
      "heading": "Actionable closing CTA (e.g. Follow for daily tech drops)",
      "subheading": "Swipe ← or Save this post"
    }
  ]
}

Constraints:
1. Output MUST be between 6 and 8 slides total (1 title, 4 to 6 body slides, and 1 CTA slide).
2. Each body slide must have EXACTLY 2 bullet points for visual layout consistency.
3. Keep sentences short, punchy, and clear. Avoid blocks of text.
4. Output ONLY valid JSON. Use JSON mode. Do not write markdown, do not write code blocks.`;

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
  if (!parsed.topic || !Array.isArray(parsed.slides) || parsed.slides.length < 4) {
    throw new Error('JSON response format is invalid or has insufficient slides.');
  }

  console.log(`[GENERATOR] Successfully generated content for "${parsed.topic}" containing ${parsed.slides.length} slides.`);
  return parsed;
}
