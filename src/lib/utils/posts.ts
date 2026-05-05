import type { Post, PostMetadata } from '$lib/types/post';
import { resolvePostAssetPath } from '$lib/utils/markdown';

const postModules = import.meta.glob('/src/posts/*.md', { eager: true });
const rawPostModules = import.meta.glob('/src/posts/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

function stripFrontmatter(content: string): string {
	return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
}

function normalizePostMetadata(slug: string, metadata: Partial<PostMetadata>): PostMetadata {
	return {
		title: metadata.title || slug,
		image: metadata.image || '',
		published: metadata.published || new Date(0).toISOString(),
		pinned: metadata.pinned ?? false,
		description: metadata.description || '',
		draft: metadata.draft,
		updated: metadata.updated,
		toc: metadata.toc,
		tags: metadata.tags,
		categories: metadata.categories
	};
}

export function markdownToPlainText(value: string): string {
	return value
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/[#>*_~|[\]()-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function countPostWords(post: Pick<Post, 'metadata' | 'content'>): number {
	const text = markdownToPlainText(
		`${post.metadata.title} ${post.metadata.description} ${post.content}`
	);
	const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
	const englishWords = text.match(/[a-zA-Z]+/g) || [];
	return chineseChars.length + englishWords.length;
}

export function getPostReadTime(post: Pick<Post, 'metadata' | 'content'>): number {
	return Math.max(1, Math.ceil(countPostWords(post) / 300));
}

export function createPostSearchText(post: Post): string {
	return markdownToPlainText(
		[
			post.metadata.title,
			post.metadata.description,
			post.slug,
			...(post.metadata.tags ?? []),
			...(post.metadata.categories ?? []),
			post.content
		].join(' ')
	).toLowerCase();
}

/**
 * 获取所有文章
 */
export function getAllPosts(): Post[] {
	const posts: Post[] = [];

	for (const [path, module] of Object.entries(postModules)) {
		const slug = path.split('/').pop()?.replace(/\.md$/, '') ?? '';
		const mod = module as any;

		// mdsvex 会将 frontmatter 导出为 metadata
		const metadata = normalizePostMetadata(slug, mod.metadata as Partial<PostMetadata>);
		const rawContent = rawPostModules[path];

		posts.push({
			slug,
			metadata,
			content: typeof rawContent === 'string' ? stripFrontmatter(rawContent) : ''
		});
	}

	// 按发布日期排序，置顶文章优先
	return posts.sort((a, b) => {
		if (a.metadata.pinned && !b.metadata.pinned) return -1;
		if (!a.metadata.pinned && b.metadata.pinned) return 1;
		return new Date(b.metadata.published).getTime() - new Date(a.metadata.published).getTime();
	});
}

export function getDisplayPosts(): Post[] {
	return getAllPosts().map((post) => ({
		...post,
		metadata: {
			...post.metadata,
			image: resolvePostAssetPath(post.slug, post.metadata.image)
		}
	}));
}

export function getPostTags(post: Post): string[] {
	const values = [...(post.metadata.tags ?? []), ...(post.metadata.categories ?? [])];
	return Array.from(new Set(values.map((tag) => tag.trim()).filter(Boolean)));
}

export function getAllTags(posts: Post[] = getDisplayPosts()): { name: string; count: number }[] {
	const counts = new Map<string, number>();

	for (const post of posts) {
		for (const tag of getPostTags(post)) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}

	return Array.from(counts.entries())
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}

export function getPostsByTag(tag: string, posts: Post[] = getDisplayPosts()): Post[] {
	return posts.filter((post) => getPostTags(post).some((item) => item.toLowerCase() === tag.toLowerCase()));
}

/**
 * 根据 slug 获取单篇文章
 */
export function getPostBySlug(slug: string): Post | undefined {
	const posts = getAllPosts();
	return posts.find((post) => post.slug === slug);
}

/**
 * 获取文章组件
 */
export async function getPostComponent(slug: string) {
	try {
		const modules = import.meta.glob('/src/posts/*.md');
		const path = `/src/posts/${slug}.md`;

		if (path in modules) {
			const mod = await modules[path]();
			return (mod as any).default;
		}
	} catch (error) {
		console.error('Error loading post component:', error);
	}

	return null;
}
