import { z, defineCollection } from 'astro:content';

const blogs = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
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
      scale: z.string().optional(),
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

const faqCollection = defineCollection({
  type: 'data',
  schema: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      category: z.string().optional(),
    })
  ),
});

export const collections = {
  blogs,
  logos: logosCollection,
  leadership: leadershipCollection,
  faq: faqCollection,
};
