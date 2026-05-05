import { getAllTags, getDisplayPosts } from '$lib/utils/posts';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	const posts = getDisplayPosts();

	return {
		tags: getAllTags(posts)
	};
};
