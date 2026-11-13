import { getAllPosts } from "@/utils/blogMarkdown";
import { AREAS, SITE_URL } from "@/lib/site";

export default function sitemap() {
  const fixas = [
    { path: "", priority: 1 },
    { path: "/sobre", priority: 0.8 },
    { path: "/contato", priority: 0.8 },
    { path: "/blog-standard", priority: 0.7 },
    ...AREAS.map((a) => ({ path: a.href, priority: 0.9 })),
  ].map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority,
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog-details/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : undefined,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...fixas, ...posts];
}
