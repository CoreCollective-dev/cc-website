import { z, defineCollection } from 'astro:content';

const blogs = defineCollection({
  type: 'content',

  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
      image: image(),
      author: z.string().optional(),
    }),
});
const logosCollection = defineCollection({
  type: 'data',
  // Use Astro's built-in image() helper to resolve the paths
  schema: z.array(
    z.object({
      src: z.string().url(),
      alt: z.string(),
    })
  ),
});
export const collections = {
  blogs,
  logos: logosCollection,
};
