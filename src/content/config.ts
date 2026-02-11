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

export const collections = {
  blogs,
};
