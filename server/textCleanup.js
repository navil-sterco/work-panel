// Uses Groq's free API tier (https://console.groq.com/keys) to rewrite the
// work description into correct English, formatted as numbered points.
// Node 18+ has fetch built in, so no extra HTTP library is needed.

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'openai/gpt-oss-20b'; // active on Groq's free/developer tier

/**
 * Rewrites raw, possibly rough work-description text into correct English,
 * formatted as exactly the requested number of short numbered points.
 */
async function cleanWorkDescription(rawText, numberOfLines = 5) {
  const text = (rawText || '').trim();
  if (!text) return text;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

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
              `Reorganize it into exactly ${numberOfLines} concise numbered points (1) through ${numberOfLines}). ` +
              `If the original has more than ${numberOfLines} items, group related ones together. ` +
              `If it has fewer, split naturally or leave later points brief — but always output exactly ${numberOfLines} numbered lines. ` +
              'Do not add information that was not implied by the original text. ' +
              `Reply with ONLY the ${numberOfLines} numbered points, nothing else.\n\n` +
              `Original text:\n${text}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Groq API error:', res.status, errBody);
      throw new Error(`Description cleanup provider returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const out = data?.choices?.[0]?.message?.content?.trim();
    if (!out) throw new Error('Description cleanup provider returned an empty result');
    const outputLines = out.split(/\r?\n/).filter((line) => line.trim());
    if (outputLines.length !== numberOfLines) {
      throw new Error(
        `Description cleanup returned ${outputLines.length} lines instead of ${numberOfLines}`,
      );
    }
    return out;
  } catch (err) {
    console.error('Description cleanup failed:', err.message);
    throw err;
  }
}

module.exports = { cleanWorkDescription };
