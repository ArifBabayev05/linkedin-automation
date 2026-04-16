import { google } from 'googleapis';
import type { GeneratedPost } from './types.js';

const SHEET_NAME = 'Posts';
const HEADER_ROW = [
  'Date',
  'Source',
  'Title',
  'URL',
  'LinkedIn Post',
  'Status',
  'Published Date',
];

function getAuth() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentialsJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON təyin olunmayıb');
  }

  const credentials = JSON.parse(credentialsJson);

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

/**
 * Əvvəl emal olunmuş URL-lərin siyahısını çəkir (dedup üçün).
 */
export async function getProcessedUrls(): Promise<Set<string>> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!D:D`, // URL sütunu
    });

    const rows = response.data.values || [];
    // İlk sətir header-dir, onu skip et
    const urls = rows.slice(1).map((row) => row[0]).filter(Boolean);
    return new Set(urls);
  } catch (err: any) {
    // Sheet yoxdursa yarat
    if (err.code === 400 || err.message?.includes('Unable to parse range')) {
      await initializeSheet();
      return new Set();
    }
    throw err;
  }
}

/**
 * Sheet hələ qurulmayıbsa, header-ları əlavə edir.
 */
async function initializeSheet(): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  // Əvvəlcə tab-ı yarat (əgər yoxdursa)
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
      },
    });
  } catch {
    // Artıq mövcuddur, problem deyil
  }

  // Header yaz
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A1:G1`,
    valueInputOption: 'RAW',
    requestBody: { values: [HEADER_ROW] },
  });
}

/**
 * Yeni generasiya olunmuş postları sheet-ə əlavə edir.
 */
export async function appendPosts(posts: GeneratedPost[]): Promise<void> {
  if (posts.length === 0) return;

  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  const rows = posts.map((p) => [
    new Date().toISOString().split('T')[0],
    p.article.source,
    p.article.title,
    p.article.url,
    p.linkedinPost,
    'Draft', // Status: Draft → sən redaktə edib "Posted" edəcəksən
    p.article.publishedAt.toISOString().split('T')[0],
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:G`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });
}
