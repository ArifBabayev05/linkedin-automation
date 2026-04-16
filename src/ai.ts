import { AzureOpenAI } from 'openai';
import { SYSTEM_PROMPT, buildUserPrompt } from './config.js';
import type { Article } from './types.js';

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-10-21',
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
});

/**
 * Bir məqalədən LinkedIn post generasiya edir.
 */
export async function generateLinkedInPost(article: Article): Promise<string> {
  const response = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT!,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildUserPrompt({
          title: article.title,
          url: article.url,
          summary: article.summary,
          fullContent: article.fullContent,
        }),
      },
    ],
    temperature: 0.7,
    max_tokens: 600,
  });

  const post = response.choices[0]?.message?.content?.trim();
  if (!post) throw new Error('LLM boş cavab qaytardı');

  return post;
}
