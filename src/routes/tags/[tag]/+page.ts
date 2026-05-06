import { error } from '@sveltejs/kit';
import { getAllTags, getDisplayPosts, getPostsByTag } from '$lib/utils/posts';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = 'auto';

export const entries: EntryGenerator = () => {
	return getAllTags().map((tag) => ({ tag: tag.name }));
};

export const load: PageLoad = ({ params }) => {
	const tag = decodeURIComponent(params.tag);
	const posts = getPostsByTag(tag, getDisplayPosts());

	if (posts.length === 0) {
		throw error(404, '标签不存在');
	}

	return {
		tag,
		posts
	};
};
