export interface SourceSite {
  name: string;
  url: string;
  type: 'rss' | 'html';
  // HTML scraping üçün selector-lər (type === 'html' olduqda)
  selectors?: {
    articleList: string;      // məqalə link-lərini tapmaq üçün
    title?: string;
    content?: string;
    date?: string;
  };
}

export interface Article {
  source: string;
  title: string;
  url: string;
  publishedAt: Date;
  summary: string;
  fullContent?: string;
}

export interface GeneratedPost {
  article: Article;
  linkedinPost: string;
  generatedAt: Date;
}
