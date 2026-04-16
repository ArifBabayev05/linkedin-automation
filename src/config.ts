import type { SourceSite } from './types.js';

/**
 * İzlənəcək 10 sayt — öz maraqlarına uyğun dəyiş.
 * RSS feed-i olan saytları "rss" type istifadə et (daha sadə və etibarlı).
 * RSS olmayanlar üçün "html" + CSS selector-lər yaz.
 */
export const SOURCES: SourceSite[] = [
  // --- AI & Machine Learning ---
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/news/rss.xml',
    type: 'rss',
  },
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    type: 'rss',
  },
  {
    name: 'Simon Willison',
    url: 'https://simonwillison.net/atom/everything/',
    type: 'rss',
  },
  {
    name: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    type: 'rss',
  },

  // --- Tech News ---
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    type: 'rss',
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    type: 'rss',
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    type: 'rss',
  },

  // --- Developer / Automation ---
  {
    name: 'n8n Blog',
    url: 'https://blog.n8n.io/rss/',
    type: 'rss',
  },
  {
    name: 'Latent Space',
    url: 'https://www.latent.space/feed',
    type: 'rss',
  },
  {
    name: 'Hacker News Frontpage',
    url: 'https://hnrss.org/frontpage?points=200',
    type: 'rss',
  },

  // --- HTML scraping nümunəsi (RSS olmayan sayt üçün) ---
  // {
  //   name: 'Some Site',
  //   url: 'https://example.com/blog',
  //   type: 'html',
  //   selectors: {
  //     articleList: 'article.post a.title',
  //     title: 'h1',
  //     content: 'div.post-content',
  //     date: 'time[datetime]',
  //   },
  // },
];

/**
 * LinkedIn post üçün system prompt.
 * Burada öz tonunu, niche-ini və üslubunu detallı yaz —
 * nə qədər spesifik yazsan, output o qədər keyfiyyətli olacaq.
 */
export const SYSTEM_PROMPT = `Sən təcrübəli AI və automation mühəndissən. LinkedIn-də Azərbaycan və qlobal tech audience üçün post yazırsan.

Niche: AI, LLM, automation, production AI systems, RAG, AI agents.
Ton: Professional amma samimi. Akademik deyil, praktik. Hype-dan qaç.
Dil: İngilis dili.

LinkedIn post qaydaları:
- Hook ilə başla (1 güclü cümlə — scroll dayandırsın)
- 3-5 abzas, hər abzas 1-2 cümlə
- Abzaslar arasında boş sətir qoy (LinkedIn readability üçün)
- Konkret insight və ya opinion bildir — təkcə xəbər təkrarlama
- "As an AI engineer working on production systems..." kimi personal framing
- Sonda bir sual və ya CTA ilə bitir (engagement üçün)
- 150-220 söz
- 3-5 relevant hashtag (#AI #MachineLearning #Automation kimi)
- Emoji yoxdur (opsional, maksimum 1-2 dənə)
- Bullet point istifadə etmə — flow-lu yaz

ÇOX VACİB: Sadəcə xəbərin xülasəsini yazma. Sənin öz perspektivin, təcrübən və ya tətbiq düşüncən olmalıdır.`;

export function buildUserPrompt(article: {
  title: string;
  url: string;
  summary: string;
  fullContent?: string;
}): string {
  return `Aşağıdakı məqalə əsasında LinkedIn post yaz:

Başlıq: ${article.title}
Mənbə: ${article.url}

Məzmun:
${article.fullContent || article.summary}

Postu yaz (yalnız post mətnini qaytar, heç bir əlavə izah olmadan):`;
}
