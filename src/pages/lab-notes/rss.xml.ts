import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { siteConfig } from '../../data/siteConfig';

const feedPath = '/lab-notes/rss.xml';
const labNotesPath = '/lab-notes';

function absoluteUrl(path: string) {
  return new URL(path, siteConfig.canonicalUrl).toString();
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function cdata(value: string) {
  return `<![CDATA[${value.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

export const GET: APIRoute = async () => {
  const entries = (await getCollection('lab-notes'))
    .filter((entry) => !entry.data.draft)
    .toSorted((first, second) => first.data.title.localeCompare(second.data.title));

  const generatedAt = new Date().toUTCString();
  const items = entries
    .map((entry) => {
      const noteUrl = absoluteUrl(`${labNotesPath}#${entry.id}`);
      const description = entry.data.summary ?? entry.data.title;

      return `    <item>
      <title>${escapeXml(entry.data.title)}</title>
      <link>${escapeXml(noteUrl)}</link>
      <guid isPermaLink="false">${escapeXml(`lab-notes:${entry.id}`)}</guid>
      <description>${cdata(description)}</description>
    </item>`;
    })
    .join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml('DRAGGON Lab Notes')}</title>
    <link>${escapeXml(absoluteUrl(labNotesPath))}</link>
    <atom:link href="${escapeXml(absoluteUrl(feedPath))}" rel="self" type="application/rss+xml" />
    <description>${escapeXml('Published research logs, explainers, tutorials, and updates from DRAGGON Lab.')}</description>
    <language>en</language>
    <lastBuildDate>${escapeXml(generatedAt)}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(feed, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
};
