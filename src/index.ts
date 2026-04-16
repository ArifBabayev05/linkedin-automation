import 'dotenv/config';
import { SOURCES } from './config.js';
import { fetchAllArticles, fetchFullContent } from './scraper.js';
import { generateLinkedInPost } from './ai.js';

import {
  sendEmailNotification,
  buildEmailSuccessContent,
  buildEmailErrorContent,
} from './email.js';
import type { GeneratedPost } from './types.js';

const DAYS_LOOKBACK = Number(process.env.DAYS_LOOKBACK || 4);
const MAX_POSTS = Number(process.env.MAX_POSTS_PER_RUN || 10);

async function main() {
  console.log('🚀 LinkedIn post automation başladı');
  console.log(`   Lookback: ${DAYS_LOOKBACK} gün | Max posts: ${MAX_POSTS}\n`);

  // 2. Bütün saytlardan məqalələri çək
  console.log('🌐 Saytlardan məqalələr çəkilir...');
  const allArticles = await fetchAllArticles(SOURCES, DAYS_LOOKBACK);
  console.log(`\n📊 Toplam ${allArticles.length} məqalə tapıldı`);

  // 4. Ən yenilərini götür, maksimum MAX_POSTS
  const sortedArticles = allArticles
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, MAX_POSTS);

  console.log(`   ${sortedArticles.length} məqalə emal olunacaq\n`);

  if (sortedArticles.length === 0) {
    console.log('ℹ️  Yeni məqalə yoxdur, çıxılır.');
    const { subject, html } = buildEmailSuccessContent([]);
    await sendEmailNotification(subject, html);
    return;
  }

  // 5. Hər məqalə üçün full content + post generasiya
  console.log('✍️  LinkedIn postları generasiya olunur...');
  const generatedPosts: GeneratedPost[] = [];

  for (const article of sortedArticles) {
    try {
      console.log(`   → ${article.title.slice(0, 60)}...`);
      article.fullContent = await fetchFullContent(article);
      const linkedinPost = await generateLinkedInPost(article);

      generatedPosts.push({
        article,
        linkedinPost,
        generatedAt: new Date(),
      });
      console.log(`     ✓ Post yazıldı (${linkedinPost.length} simvol)`);
    } catch (err) {
      console.error(`     ✗ Xəta: ${(err as Error).message}`);
    }
  }

  console.log(`\n✅ ${generatedPosts.length} post uğurla generasiya olundu`);



  // 7. Telegram bildiriş
  console.log('📢 Telegram bildiriş göndərilir...');
  const { subject, html } = buildEmailSuccessContent(generatedPosts);
  await sendEmailNotification(subject, html);
  console.log('   ✓ Göndərildi\n');

  console.log('🎉 Tamamlandı!');
}

main().catch(async (err) => {
  console.error('\n💥 FATAL XƏTA:', err);

  try {
    const { subject, html } = buildEmailErrorContent(err as Error);
    await sendEmailNotification(subject, html);
  } catch {
    // Telegram da uğursuz olsa, susurq
  }

  process.exit(1);
});
