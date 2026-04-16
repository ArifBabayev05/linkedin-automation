# LinkedIn Post Automation

Həftədə 2 dəfə 10 saytdan son məqalələri çəkib, Azure OpenAI ilə LinkedIn post yazıb Google Sheets-ə qoyan avtomatik sistem. GitHub Actions üzərində işləyir — tamamilə pulsuz.

## Arxitektura

```
GitHub Actions (cron)
  → RSS / HTML scraping (10 sayt)
  → Dedup (Google Sheets-də olanları süz)
  → Azure OpenAI (LinkedIn post generasiya)
  → Google Sheets (draft-lar saxlanılır)
  → Telegram (bildiriş)
```

## Addım-addım quraşdırma

### 1. Repository yaradın

GitHub-da yeni **private** repo yaradın (məsələn `linkedin-automation`), sonra bu faylların hamısını push edin.

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/linkedin-automation.git
git push -u origin main
```

### 2. Azure OpenAI hazır olsun

Sən artıq Azure OpenAI-də deployment yaratmısansa, bunlar lazımdır:
- **API Key** (Azure Portal → OpenAI resource → Keys and Endpoint)
- **Endpoint** (məsələn: `https://your-resource.openai.azure.com`)
- **Deployment Name** (məsələn: `gpt-4o-mini` — bu ən ucuzu və keyfiyyətlisi)
- **API Version** (məsələn: `2024-10-21`)

Model tövsiyəsi: **gpt-4o-mini** — qiymət/keyfiyyət nisbəti ən yaxşısıdır. Ayda təxminən $0.50 tutacaq.

### 3. Google Sheets hazırlığı

**A) Sheet yaradın:**
1. [sheets.google.com](https://sheets.google.com) → yeni sheet yarat
2. URL-dən Sheet ID-ni götür: `https://docs.google.com/spreadsheets/d/[BU_HİSSƏ]/edit`

**B) Service Account yarat:**
1. [Google Cloud Console](https://console.cloud.google.com) → yeni project yarat
2. "APIs & Services" → "Enable APIs" → **Google Sheets API** axtar → Enable
3. "Credentials" → "Create Credentials" → "Service Account"
4. Service account yaradıldıqdan sonra → "Keys" tab → "Add Key" → JSON → yüklə
5. JSON faylın içindəki `client_email`-i kopyala

**C) Sheet-ə access ver:**
1. Yaratdığın sheet-i aç → "Share" düyməsi
2. Service account email-ini (`xxx@xxx.iam.gserviceaccount.com`) əlavə et, "Editor" hüququ ilə

### 4. Telegram bot yarat

1. Telegram-da **@BotFather** tap
2. `/newbot` yaz, bot adını və username ver
3. Sənə **bot token** verəcək — saxla
4. Bot-unla söhbət başlat (`/start` yaz)
5. Chat ID-ni tapmaq üçün: `https://api.telegram.org/bot<TOKEN>/getUpdates` ac, `"chat":{"id":...}` tap

### 5. GitHub Secrets əlavə et

GitHub-da repo-na get → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Bu secret-ləri əlavə et:

| Name | Value |
|------|-------|
| `AZURE_OPENAI_API_KEY` | Azure API key |
| `AZURE_OPENAI_ENDPOINT` | `https://your-resource.openai.azure.com` |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o-mini` |
| `AZURE_OPENAI_API_VERSION` | `2024-10-21` |
| `GOOGLE_SHEETS_ID` | Sheet URL-dən götürdüyün ID |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Service account JSON faylının **bütün məzmunu** (tək sətir kimi yapışdır) |
| `TELEGRAM_BOT_TOKEN` | BotFather verdiyi token |
| `TELEGRAM_CHAT_ID` | Sənin chat ID-n |

### 6. Local test et (opsional amma tövsiyə olunur)

```bash
npm install
cp .env.example .env
# .env-ə real dəyərlərini yaz
npm start
```

Uğurla işləyirsə, Google Sheets-də yeni post-ları görəcəksən.

### 7. İlk GitHub Actions run-ı

1. Repo → **Actions** tab
2. "Generate LinkedIn Posts" workflow-a klik et
3. **Run workflow** düyməsinə bas (manual trigger)
4. Logs-da nə baş verdiyini izlə

Uğurlu olarsa → Telegram-a bildiriş gələcək, Sheets-də post-lar görünəcək.

## Cədvəli dəyişmək

`.github/workflows/generate-posts.yml` faylında `cron` dəyişikliyi:

```yaml
# Həftədə 2 dəfə: bazar ertəsi və cümə axşamı, UTC 07:00 (Bakı 11:00)
- cron: '0 7 * * 1,4'

# Hər gün:      '0 7 * * *'
# Cümə günü:    '0 7 * * 5'
# 3 dəfə həftədə: '0 7 * * 1,3,5'
```

[crontab.guru](https://crontab.guru) — cron ifadələrini test etmək üçün.

## Sayt siyahısını dəyişmək

`src/config.ts` faylında `SOURCES` array-ini dəyiş. RSS feed-i olan saytlar daha sadədir, `type: 'rss'` kifayətdir.

RSS olmayan saytlar üçün `type: 'html'` + CSS selector-lər yaz (nümunə faylda kommentarlı şəkildə var).

## Prompt-u tənzimləmək

`src/config.ts`-də `SYSTEM_PROMPT` dəyişənini dəyiş. Nə qədər spesifik yazsan (sənin ton, niche, LinkedIn üslubu), output o qədər yaxşı olacaq.

## Aylıq xərc

- GitHub Actions: **$0** (public/private repo üçün pulsuz quota çoxdur)
- Azure OpenAI (gpt-4o-mini): **~$0.50–$1**
- Google Sheets + Telegram: **$0**
- **Toplam: ~$1/ay**

## Debugging

- **GitHub Actions uğursuz olur** → Actions tab → run-ı aç → logs bax
- **"Unable to parse range"** → Sheet-də `Posts` adlı tab yoxdur, ilk run avtomatik yaradacaq
- **"403 Forbidden" Sheets-dən** → Service account email-ini sheet-ə "Editor" kimi əlavə etməmisən
- **RSS feed xəta verir** → O saytın RSS URL-i dəyişmiş ola bilər, `config.ts`-də yenilə

## Workflow

1. GitHub Actions həftədə 2 dəfə işə düşür
2. Sənin Telegram-a bildiriş gəlir: "5 yeni post hazırdır"
3. Google Sheets-i açırsan, post-ları oxuyursan
4. Bəyəndiyini redaktə edirsən, LinkedIn-də paylaşırsan
5. Sheets-də "Status" sütununu "Posted" et (optional — özün üçün track etmək)
