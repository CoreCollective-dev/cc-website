import { z, defineCollection } from 'astro:content';

const blogs = defineCollection({
  type: 'content',

  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.date().or(z.string()),
      image: image(),
    }),
});

export const collections = {
  blogs,
};
