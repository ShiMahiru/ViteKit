import { getDisplayPosts } from '$lib/utils/posts';
import type { PageLoad } from './$types';

export const load: PageLoad = () => ({
	posts: getDisplayPosts()
});
