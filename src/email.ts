import nodemailer from 'nodemailer';
import type { GeneratedPost } from './types.js';

/**
 * Gmail vasitəsilə bildiriş göndərir.
 */
export async function sendEmailNotification(subject: string, htmlContent: string): Promise<void> {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const to = process.env.EMAIL_TO || user;

  if (!user || !pass) {
    console.warn('⚠ Email credentials yoxdur (EMAIL_USER, EMAIL_PASS), bildiriş göndərilmədi');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const mailOptions = {
    from: `"LinkedIn Automation" <${user}>`,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
}

export function buildEmailSuccessContent(posts: GeneratedPost[], sheetId: string): { subject: string, html: string } {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;
  
  let postsHtml = '';
  for (const p of posts) {
    postsHtml += `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="margin-top: 0;">${p.article.title}</h3>
        <p><strong>Mənbə:</strong> <a href="${p.article.url}">${p.article.url}</a></p>
        <div style="background: #f9f9f9; padding: 10px; border-left: 4px solid #0077b5; white-space: pre-wrap;">
          ${p.linkedinPost}
        </div>
      </div>
    `;
  }

  const subject = `✅ ${posts.length} yeni LinkedIn postu hazırdır`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2>LinkedIn Automation Nəticələri</h2>
      <p>${posts.length} yeni post generasiya olundu və Google Sheets-ə əlavə edildi.</p>
      <p><a href="${sheetUrl}" style="background: #0077b5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Google Sheets-ə bax</a></p>
      <hr />
      ${postsHtml}
    </div>
  `;

  return { subject, html };
}

export function buildEmailErrorContent(error: Error): { subject: string, html: string } {
  return {
    subject: '❌ LinkedIn Automation Xətası',
    html: `
      <div style="font-family: sans-serif; color: #d32f2f;">
        <h2>Xəta baş verdi</h2>
        <p>Proses zamanı xəta yarandı:</p>
        <pre style="background: #f5f5f5; padding: 10px;">${error.message}</pre>
        <p>${error.stack}</p>
      </div>
    `
  };
}
