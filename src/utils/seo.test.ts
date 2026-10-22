import { describe, expect, it } from 'bun:test';
import {
	absoluteUrl,
	blogPostJsonLd,
	breadcrumbJsonLd,
	formatTitle,
	graphJsonLd,
	resolveImageUrl,
	twitterHandle,
} from './seo';

describe('SEO formatting utilities', () => {
	it('formats page title with site title suffix', () => {
		expect(formatTitle('My Post', 'Dev Journey')).toBe('My Post | Dev Journey');
	});

	it('does not duplicate site title when identical', () => {
		expect(formatTitle('Dev Journey', 'Dev Journey')).toBe('Dev Journey');
	});

	it('constructs absolute URLs cleanly with trailing or non-trailing origins', () => {
		expect(absoluteUrl('/blog/', 'https://example.com')).toBe('https://example.com/blog/');
		expect(absoluteUrl('/blog/', 'https://example.com/')).toBe('https://example.com/blog/');
	});

	it('resolves image fallback and relative paths', () => {
		expect(resolveImageUrl(undefined, 'https://example.com')).toBe(
			'https://example.com/og-default.jpg',
		);
		expect(resolveImageUrl('/custom.png', 'https://example.com')).toBe(
			'https://example.com/custom.png',
		);
	});

	it('extracts twitter handle cleanly', () => {
		const handle = twitterHandle();
		expect(handle).toBe('@abhiudayg');
	});
});

describe('JSON-LD schema generators', () => {
	it('generates BlogPosting schema with ISO dates and series section', () => {
		const schema = blogPostJsonLd({
			title: 'Post Title',
			description: 'Post Description',
			url: 'https://example.com/blog/my-post/',
			image: 'https://example.com/image.jpg',
			pubDate: new Date('2026-10-22T00:00:00Z'),
			series: 'agentrun',
		});

		expect(schema['@type']).toBe('BlogPosting');
		expect(schema.headline).toBe('Post Title');
		expect(schema.datePublished).toBe('2026-10-22T00:00:00.000Z');
		expect(schema.articleSection).toBe('agentrun');
	});

	it('generates breadcrumb list with 1-based indexing', () => {
		const breadcrumbs = breadcrumbJsonLd([
			{ name: 'Home', url: 'https://example.com/' },
			{ name: 'Blog', url: 'https://example.com/blog/' },
		]);

		expect(breadcrumbs['@type']).toBe('BreadcrumbList');
		expect(breadcrumbs.itemListElement[0].position).toBe(1);
		expect(breadcrumbs.itemListElement[1].position).toBe(2);
		expect(breadcrumbs.itemListElement[0].name).toBe('Home');
	});

	it('wraps multiple entities in schema.org @graph container', () => {
		const graph = graphJsonLd({ '@type': 'WebSite' }, { '@type': 'Person' });
		expect(graph['@context']).toBe('https://schema.org');
		expect(graph['@graph'].length).toBe(2);
	});
});
