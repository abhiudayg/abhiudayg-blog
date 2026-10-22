import { describe, expect, it } from 'bun:test';
import {
	getExtraPaginationPages,
	paginatePosts,
	paginationHref,
	sortSeriesPosts,
} from './pagination';

describe('blog pagination utilities', () => {
	const sampleItems = Array.from({ length: 25 }, (_, i) => `item-${i + 1}`);

	it('paginates items correctly for page 1', () => {
		const result = paginatePosts(sampleItems, 1, 10);
		expect(result.currentPage).toBe(1);
		expect(result.totalPages).toBe(3);
		expect(result.totalItems).toBe(25);
		expect(result.items.length).toBe(10);
		expect(result.items[0]).toBe('item-1');
		expect(result.items[9]).toBe('item-10');
	});

	it('paginates items correctly for page 3 (last page with remainder)', () => {
		const result = paginatePosts(sampleItems, 3, 10);
		expect(result.currentPage).toBe(3);
		expect(result.totalPages).toBe(3);
		expect(result.items.length).toBe(5);
		expect(result.items[0]).toBe('item-21');
		expect(result.items[4]).toBe('item-25');
	});

	it('clamps page out of bounds gracefully', () => {
		const result = paginatePosts(sampleItems, 999, 10);
		expect(result.currentPage).toBe(3);
		expect(result.items.length).toBe(5);

		const resultZero = paginatePosts(sampleItems, 0, 10);
		expect(resultZero.currentPage).toBe(1);
		expect(resultZero.items.length).toBe(10);
	});

	it('handles empty item list without division errors', () => {
		const result = paginatePosts([], 1, 10);
		expect(result.currentPage).toBe(1);
		expect(result.totalPages).toBe(1);
		expect(result.items.length).toBe(0);
	});
});

describe('paginationHref utility', () => {
	it('generates canonical trailing slash url for page 1', () => {
		expect(paginationHref('/blog', 1)).toBe('/blog/');
		expect(paginationHref('/blog/', 1)).toBe('/blog/');
	});

	it('generates page 2+ pagination url correctly', () => {
		expect(paginationHref('/blog', 2)).toBe('/blog/page/2/');
		expect(paginationHref('/blog/', 3)).toBe('/blog/page/3/');
	});
});

describe('getExtraPaginationPages utility', () => {
	it('returns empty array when total items fit in page 1', () => {
		expect(getExtraPaginationPages(5, 10)).toEqual([]);
		expect(getExtraPaginationPages(10, 10)).toEqual([]);
	});

	it('returns remaining page numbers starting from 2', () => {
		expect(getExtraPaginationPages(25, 10)).toEqual([2, 3]);
		expect(getExtraPaginationPages(31, 10)).toEqual([2, 3, 4]);
	});
});

describe('sortSeriesPosts utility', () => {
	it('sorts posts primarily by seriesPart ascending', () => {
		const posts: any[] = [
			{ id: 'p2', data: { seriesPart: 2, pubDate: new Date('2026-06-10') } },
			{ id: 'p1', data: { seriesPart: 1, pubDate: new Date('2026-06-15') } },
			{ id: 'p3', data: { seriesPart: 3, pubDate: new Date('2026-06-01') } },
		];

		const sorted = sortSeriesPosts(posts);
		expect(sorted[0].id).toBe('p1');
		expect(sorted[1].id).toBe('p2');
		expect(sorted[2].id).toBe('p3');
	});

	it('falls back to pubDate descending when seriesPart is missing', () => {
		const posts: any[] = [
			{ id: 'older', data: { pubDate: new Date('2026-06-01') } },
			{ id: 'newer', data: { pubDate: new Date('2026-06-20') } },
		];

		const sorted = sortSeriesPosts(posts);
		expect(sorted[0].id).toBe('newer');
		expect(sorted[1].id).toBe('older');
	});
});
