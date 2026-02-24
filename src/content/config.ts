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
  schema: z.array(
    z.object({
      src: z.string().url(),
      alt: z.string(),
    })
  ),
});

const leadershipCollection = defineCollection({
  type: 'data',
  schema: ({ image }) =>
    z.array(
      z.object({
        src: image(),
        name: z.string(),
        role: z.string(),
        company: z.string(),
      })
    ),
});

export const collections = {
  blogs,
  logos: logosCollection,
  leadership: leadershipCollection,
};
