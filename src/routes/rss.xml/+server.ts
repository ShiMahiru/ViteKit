import { Feed } from 'feed';
import MarkdownIt from 'markdown-it';
import { siteConfig } from '../../config';
import { getAllPosts } from '$lib/utils/posts';
import { resolvePostAssetPath } from '$lib/utils/markdown';
import { getSiteUrl, SITE_LANGUAGE, toAbsoluteUrl } from '$lib/utils/site';
import type { RequestHandler } from './$types';

const md = new MarkdownIt({ html: true, linkify: true });

export const prerender = true;

export const GET: RequestHandler = async () => {
	const siteUrl = getSiteUrl();
	const posts = getAllPosts();

	// 只包含已发布的文章，按日期排序
	const publishedPosts = posts
		.filter((post) => !post.metadata.draft)
		.sort((a, b) => new Date(b.metadata.published).getTime() - new Date(a.metadata.published).getTime());

	// 创建 Feed 实例
	const feed = new Feed({
		title: siteConfig.title,
		description: siteConfig.title,
		id: siteUrl,
		link: siteUrl,
		language: SITE_LANGUAGE,
		favicon: siteConfig.icon || undefined,
		copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.title}`,
		feedLinks: {
			rss: `${siteUrl}/rss.xml`
		},
		author: {
			name: siteConfig.title,
			link: siteUrl
		}
	});

	// 添加文章到 feed
	for (const post of publishedPosts) {
		// 清理 CDATA 中的非法字符，避免 xml-js writeCdata 崩溃
		const sanitize = (s: unknown): string => {
			if (typeof s !== 'string') return '';
			// 去除 XML 1.0 不允许的控制字符
			return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
		};

		const safeTitle = sanitize(post.metadata.title) || post.slug;
		const safeDescription = sanitize(post.metadata.description);
		const safeContent = sanitize(post.content) || safeDescription || safeTitle;

		const publishedDate = new Date(post.metadata.published);
		const safeDate = isNaN(publishedDate.getTime()) ? new Date() : publishedDate;

		// 将 Markdown 渲染为 HTML，并解析相对图片路径
		let htmlContent = md.render(safeContent);
		htmlContent = htmlContent.replace(
			/(<img[^>]+src=")(?!\/|https?:\/\/)([^"]+)(")/g,
			(_m, before, src, after) => `${before}${siteUrl}/posts/${post.slug}/${src}${after}`
		);

		feed.addItem({
			title: safeTitle,
			id: `${siteUrl}/posts/${post.slug}/`,
			link: `${siteUrl}/posts/${post.slug}/`,
			description: safeDescription || safeTitle,
			content: htmlContent,
			date: safeDate,
			image: post.metadata.image
				? (() => {
						const resolved = resolvePostAssetPath(post.slug, post.metadata.image);
						return toAbsoluteUrl(resolved);
					})()
				: undefined
		});
	}

	return new Response(feed.rss2(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
