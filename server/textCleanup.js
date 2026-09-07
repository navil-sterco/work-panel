// Uses Groq's free API tier (https://console.groq.com/keys) to rewrite the
// work description into correct English, formatted as 5 numbered points.
// Node 18+ has fetch built in, so no extra HTTP library is needed.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'openai/gpt-oss-20b'; // active on Groq's free/developer tier

/**
 * Rewrites raw, possibly rough work-description text into correct English,
 * formatted as exactly 5 short numbered points. Falls back to returning the
 * original text unchanged if no API key is configured or the call fails.
 */
async function cleanWorkDescription(rawText) {
  const text = (rawText || '').trim();
  if (!text) return text;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return text; // no key configured — skip cleanup silently

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 800,
        reasoning_effort: 'low',
        messages: [
          {
            role: 'user',
            content:
              'Rewrite the following work-log description in clear, correct, professional English. ' +
              'Reorganize it into exactly 5 concise numbered points (1) through 5). ' +
              'If the original has more than 5 items, group related ones together. ' +
              'If it has fewer, split naturally or leave later points brief — but always output exactly 5 numbered lines. ' +
              'Do not add information that was not implied by the original text. ' +
              'Reply with ONLY the 5 numbered points, nothing else.\n\n' +
              `Original text:\n${text}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Groq API error:', res.status, errBody);
      return text;
    }

    const data = await res.json();
    const out = data?.choices?.[0]?.message?.content?.trim();
    return out || text;
  } catch (err) {
    console.error('Description cleanup failed, using original text:', err.message);
    return text;
  }
}

module.exports = { cleanWorkDescription };
