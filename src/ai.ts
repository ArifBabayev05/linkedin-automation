import { AzureOpenAI } from 'openai';
import { SYSTEM_PROMPT, buildUserPrompt } from './config.js';
import type { Article } from './types.js';

let _client: AzureOpenAI | null = null;

function getClient(): AzureOpenAI {
  if (_client) return _client;

  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

  // Debug: hansı env-lər var/yoxdur (value-ları yox!)
  if (!apiKey || !endpoint || !deployment) {
    console.error('❌ Azure OpenAI env vars:');
    console.error(`   AZURE_OPENAI_API_KEY:    ${apiKey ? '✓ set' : '✗ MISSING'}`);
    console.error(`   AZURE_OPENAI_ENDPOINT:   ${endpoint ? '✓ set' : '✗ MISSING'}`);
    console.error(`   AZURE_OPENAI_DEPLOYMENT: ${deployment ? '✓ set' : '✗ MISSING'}`);
    throw new Error('Azure OpenAI credentials natamamdır');
  }

  _client = new AzureOpenAI({
    apiKey,
    endpoint,
    apiVersion,
    deployment,
  });

  return _client;
}

/**
 * Bir məqalədən LinkedIn post generasiya edir.
 */
export async function generateLinkedInPost(article: Article): Promise<string> {
  const client = getClient();

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
    max_completion_tokens: 800,
  });

  const post = response.choices[0]?.message?.content?.trim();
  if (!post) throw new Error('LLM boş cavab qaytardı');

  return post;
}