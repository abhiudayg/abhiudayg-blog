import { getCollection } from 'astro:content';
import type { BlogSeriesSlug } from '../consts';

export * from './pagination';

export async function getSortedPosts() {
	return (await getCollection('blog')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
}

export async function getPostsBySeries(series: BlogSeriesSlug) {
	const posts = await getSortedPosts();
	return posts.filter((post) => post.data.series === series);
}
