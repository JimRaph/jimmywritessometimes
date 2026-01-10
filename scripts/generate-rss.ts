import fs from 'fs';
import path from 'path';

interface ArticleMetadata {
  title: string;
  cover: string;
  date: string;
  series: string;
  tags: string[];
  link: string;
}

const SITE_URL = 'https://jimmywritessometimes.vercel.app';
const SITE_TITLE = 'JimmyWritesSometimes';
const SITE_DESCRIPTION = 'Learn all about software engineering and AI.';
const AUTHOR = 'Jimmy';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRSS(articles: ArticleMetadata[]): string {
  // Sort articles by date (newest first)
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const lastBuildDate = new Date().toUTCString();
  const pubDate = sortedArticles.length > 0 
    ? new Date(sortedArticles[0].date).toUTCString()
    : lastBuildDate;

  const items = sortedArticles
    .map((article) => {
      const articleUrl = `${SITE_URL}${article.link}`;
      const imageUrl = article.cover.startsWith('http') 
        ? article.cover 
        : `${SITE_URL}${article.cover}`;
      const pubDate = new Date(article.date).toUTCString();
      
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(articleUrl)}</link>
      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(article.title)}</description>
      <category>${escapeXml(article.series)}</category>
${article.tags.map(tag => `      <category>${escapeXml(tag)}</category>`).join('\n')}
      <enclosure url="${escapeXml(imageUrl)}" type="image/png"/>
      <media:thumbnail xmlns:media="http://search.yahoo.com/mrss/" url="${escapeXml(imageUrl)}"/>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${pubDate}</pubDate>
    <copyright>© ${new Date().getFullYear()} ${SITE_TITLE}</copyright>
    <managingEditor>${AUTHOR}</managingEditor>
    <webMaster>${AUTHOR}</webMaster>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

function main() {
  try {
    // Read metadata.json
    const metadataPath = path.join(process.cwd(), 'static', 'metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as ArticleMetadata[];

    // Generate RSS feed
    const rssContent = generateRSS(metadata);

    // Write to static directory (will be copied to build)
    const outputPath = path.join(process.cwd(), 'static', 'rss.xml');
    fs.writeFileSync(outputPath, rssContent, 'utf-8');

    console.log(`✓ RSS feed generated successfully at ${outputPath}`);
    console.log(`  Articles included: ${metadata.length}`);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    process.exit(1);
  }
}

main();
