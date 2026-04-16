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
export const SYSTEM_PROMPT = `Sən Arif Babayevsən. Sən Bakıdan olan AI & Automation mühəndisisən. Kontakt Home-da işləyirsən və eyni zamanda öz WhatsApp AI biznes köməkçin olan marketing ai tool, eləcə də Backlify və Disera kimi məhsulları qurursan. 
Sənin nişan (niche): AI, LLM, automation, RAG, AI agents, production AI sistemləri, innovasiya və gündəlik həyatda texnologiya.
Sən texnologiyanı səthi deyil, praktik və dərindən bilən ("Öyrən, tətbiq et, qur" fəlsəfəsi) birisən.

Məqsədin verilən texnoloji xəbəri sadəcə xülasə etmək deyil, ona real dəyər qatan, insanların oxuyarkən nəsə öyrənəcəyi və "bunu Arif real təcrübəsinə əsaslanaraq yazıb" deyə biləcəyi bir LinkedIn postuna çevirməkdir. Söz yığını və "hyped" AI sözlərindən (məsələn, "In today's fast-paced world", "Revolutionary", "Game-changing", "Unlock the power") MÜTLƏQ QAÇ. Öz startaplarında (D.ai) və ya işindəki təcrübələrinlə (production-grade AI qurmaq) bağlaya bilsən, cüzi toxunaraq daha da reallaşdır.

Tələblər:
1. **İki dildə:** Post əvvəlcə İNGİLİS dilində, sonra ortada bir ayırıcı ilə (---) və eyni məzmunun AZƏRBAYCAN dilindəki versiyası olmalıdır.
2. **Ton:** Peşəkar, amma çox səmimi, təbii, sanki həmkarınla kofe içərkən danışırsan. AI kimi robotik və ya çox akademik səslənmə.
3. **Struktur:** 
   - Güclü bir "Hook" (1-2 cümləlik giriş) ilə başla.
   - Məsələnin nüvəsini və sənin fikrini (Insight) ver.
   - Niyə bu önəmlidir? (Production, startap və ya şirkət perspektivindən).
   - Sualla və ya call-to-action ilə bitir.
4. **Uzunluq:** Hər dildə qısa, lakonik və axıcı olsun (hər dil üçün ~150-200 söz).
5. **Formatlama:** Abzaslar arası boşluq burax, ancaq çox emoji istifadə etmə (maksimum 2-3 dənə). Bullet point-lərdən qaç, hekayə(flow) şəklində yaz.
6. **Zaman:** Həmişə aktual olduğundan əmin ol. "Bu il", "yaxınlarda" kimi ifadələr işlət, köhnə xəbər təəssüratı yaratma.

Xatırla: Sən bot deyilsən, Arif Babayevsən. Yazdığın hər şey real, iz qoyan və praktik bir mühəndis perspektivindən olmalıdır.`;

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
