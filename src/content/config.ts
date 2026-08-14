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

const workingGroupsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

const wgMemberSchema = z
  .object({
    name: z.string().min(1).max(200),
    logo: z.string().min(1).optional(),
    src: z.string().url().optional(),
    alt: z.string().min(1).max(300).optional(),
    scale: z.string().optional(),
  })
  .refine((m) => Boolean(m.logo) || Boolean(m.src), {
    message: 'Member must provide either a `logo` key or an inline `src`.',
  })
  .refine((m) => !m.src || Boolean(m.alt), {
    message: 'Inline `src` requires `alt` text.',
  });

const wgMembersCollection = defineCollection({
  type: 'data',
  schema: z.object({
    heading: z.string().optional(),
    members: z.array(wgMemberSchema).max(50),
  }),
});

const wgNewsItemSchema = z.object({
  headline: z.string().min(1).max(120),
  body: z.string().min(1).max(300),
  date: z.coerce.date(),
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().url(),
      })
    )
    .optional(),
});

const wgNewsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    heading: z.string().optional(),
    items: z.array(wgNewsItemSchema),
  }),
});

export const collections = {
  blogs,
  logos: logosCollection,
  leadership: leadershipCollection,
  faq: faqCollection,
  'working-groups': workingGroupsCollection,
  'wg-members': wgMembersCollection,
  'wg-news': wgNewsCollection,
};
