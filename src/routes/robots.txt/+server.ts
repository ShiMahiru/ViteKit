import { getSiteUrl } from '$lib/utils/site';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const siteUrl = getSiteUrl();
	const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

	return new Response(robots, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
