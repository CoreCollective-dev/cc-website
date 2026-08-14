export interface NewsItem {
  headline: string;
  body: string;
  date: Date;
  links?: { label: string; href: string }[];
}

/**
 * Sort by date descending, break ties deterministically by headline,
 * then take at most `max` items.
 *
 * Does not mutate the input array.
 */
export function selectLatestNews(items: NewsItem[], max = 3): NewsItem[] {
  const clampedMax = Math.max(1, max);

  // Attach original index for stable tie-breaking
  const indexed = items.map((item, i) => ({ item, i }));

  indexed.sort((a, b) => {
    // Primary: date descending
    const dateCompare = b.item.date.getTime() - a.item.date.getTime();
    if (dateCompare !== 0) return dateCompare;

    // Secondary: headline ascending (lexicographic)
    const headlineCompare = a.item.headline.localeCompare(b.item.headline);
    if (headlineCompare !== 0) return headlineCompare;

    // Tertiary: original index ascending (stable)
    return a.i - b.i;
  });

  return indexed.slice(0, clampedMax).map(({ item }) => item);
}
