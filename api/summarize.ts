import { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
// import { Ratelimit } from '@upstash/ratelimit';
import Groq from "groq-sdk";
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';


const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// const ratelimit = new Ratelimit({
//   redis: redis,
//   limiter: Ratelimit.slidingWindow(5, "60 s"), 
// });

const handler = async (req: VercelRequest, res: VercelResponse) => {

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).send('Use POST');

  const identifier = req.headers['x-forwarded-for'] || "anonymous";
  // const { success } = await ratelimit.limit(identifier as string);
  // if (!success) return res.status(429).json({ error: "Slow down! Try again in a minute." });

  const { relativePath } = req.body;
  if (!relativePath) {
      return res.status(400).json({ error: 'Path is required' });
    }

  const cacheKey = `summary:${relativePath}`;
  
  try {

    const cachedSummary = await redis.get(cacheKey);
    if (cachedSummary) {
      return res.status(200).json({ answer: cachedSummary, cached: true });
    }

    const fullPath = path.join(process.cwd(), 'docs', `${relativePath}.md`);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: `File not found at ${fullPath}` });
    }

    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const { content } = matter(fileContent);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert technical editor. 
            Provide a concise summary of the following article in Markdown.
            
            Rules:
            1. Start with a brief header "### Article Summary".
            2. Use a bulleted list. 
            3. IMPORTANT: Every bullet point MUST be on a new line.
            4. Bold the key term at the start of each bullet (e.g., * **Term**: Description).
            5. Focus on core technical concepts and ignore administrative filler.`
        },
        {
          role: "user",
          content: content, 
        },
      ],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.5,
      max_tokens: 800,
    });

    const summary = chatCompletion.choices[0]?.message?.content || "No summary generated.";

    await redis.set(cacheKey, summary, { ex: 604800 });

    return res.status(200).json({ summary });
  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).json({ error: "Jimmy is currently resting. Try later!" });
  }
}

export default handler