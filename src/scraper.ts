import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { subDays } from 'date-fns';
import type { SourceSite, Article } from './types.js';

const rssParser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; LinkedInPostBot/1.0)',
  },
});

const httpClient = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
});

/**
 * RSS feed-dən məqalələri çəkir.
 */
async function scrapeRSS(site: SourceSite, since: Date): Promise<Article[]> {
  const feed = await rssParser.parseURL(site.url);

  return (feed.items || [])
    .filter((item) => {
      if (!item.link || !item.title) return false;
      const pubDate = item.isoDate ? new Date(item.isoDate) : null;
      return pubDate && pubDate >= since;
    })
    .map((item) => ({
      source: site.name,
      title: item.title!.trim(),
      url: item.link!,
      publishedAt: new Date(item.isoDate!),
      summary: (item.contentSnippet || item.content || '').slice(0, 500),
    }));
}

/**
 * HTML sayt üçün scraping (RSS olmayan saytlar).
 * Sadə implementation — JavaScript-heavy saytlar üçün Playwright lazım olacaq.
 */
async function scrapeHTML(site: SourceSite, since: Date): Promise<Article[]> {
  if (!site.selectors) {
    throw new Error(`${site.name} üçün selectors təyin olunmayıb`);
  }

  const { data } = await httpClient.get(site.url);
  const $ = cheerio.load(data);
  const articles: Article[] = [];

  $(site.selectors.articleList).each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    const title = $el.text().trim() || $el.attr('title') || '';

    if (!href || !title) return;

    const fullUrl = new URL(href, site.url).toString();

    articles.push({
      source: site.name,
      title,
      url: fullUrl,
      publishedAt: new Date(), // HTML-də dəqiq tarix bilinmir → cari tarix
      summary: '',
    });
  });

  // HTML scraping-də tarix yoxdur, ona görə hamısını qaytarırıq
  // (sonra dedup və fetchFullContent-də filtr gedəcək)
  return articles.slice(0, 5); // saytdan maksimum 5 yeni məqalə
}

/**
 * Məqalənin tam məzmununu çəkir (LLM-ə daha çox kontekst vermək üçün).
 */
export async function fetchFullContent(article: Article): Promise<string> {
  try {
    const { data } = await httpClient.get(article.url);
    const $ = cheerio.load(data);

    // Script, style, nav, footer sil
    $('script, style, nav, footer, header, aside, .comments, .sidebar').remove();

    // Əsas məzmun selectors-larını sınayırıq
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.entry-content',
    ];

    let content = '';
    for (const selector of contentSelectors) {
      const text = $(selector).text().trim();
      if (text.length > content.length) content = text;
    }

    // Fallback: body-dən götür
    if (content.length < 200) {
      content = $('body').text().trim();
    }

    // Təmizlə: çox boşluq və newline-ları sıxlaşdır
    content = content.replace(/\s+/g, ' ').trim();

    // LLM context limiti üçün 4000 simvola kəs
    return content.slice(0, 4000);
  } catch (err) {
    console.warn(`  ⚠ ${article.url} content fetch xətası:`, (err as Error).message);
    return article.summary;
  }
}

/**
 * Bütün saytlardan məqalələri paralel çəkir.
 */
export async function fetchAllArticles(
  sources: SourceSite[],
  daysLookback: number,
): Promise<Article[]> {
  const since = subDays(new Date(), daysLookback);

  const results = await Promise.allSettled(
    sources.map(async (site) => {
      console.log(`→ ${site.name} yoxlanılır...`);
      const articles =
        site.type === 'rss' ? await scrapeRSS(site, since) : await scrapeHTML(site, since);
      console.log(`  ✓ ${articles.length} məqalə tapıldı`);
      return articles;
    }),
  );

  const allArticles: Article[] = [];
  results.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    } else {
      console.error(`✗ ${sources[idx].name} uğursuz:`, result.reason.message);
    }
  });

  return allArticles;
}
