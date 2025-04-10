// utils/blogMarkdown.js
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "data/posts");

export function getAllMarkdownPosts() {
  const files = fs.readdirSync(postsDir);

  return files
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(postsDir, filename);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContent);

      return {
        ...data,
        content,
        slug: data.slug || filename.replace(".md", ""),
      };
    });
}

export function getPostBySlug(slug) {
  const filePath = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);

  return {
    ...data,
    content,
    slug: data.slug || slug,
  };
}

export function getAllSlugs() {
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

// app/api/posts/getAllPosts.js
export { getAllMarkdownPosts as getAllPosts };
