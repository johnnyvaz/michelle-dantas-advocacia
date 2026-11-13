// lib/services.js
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const servicesDirectory = path.join(process.cwd(), "data/services");

export function getAllServices() {
  const files = fs.readdirSync(servicesDirectory).filter(file => file.endsWith('.md'));
  return files.map((filename) => {
    const slug = filename.replace(".md", "");
    const fullPath = path.join(servicesDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    return {
        ...data,
        slug,
        content: Array.isArray(data.content) ? data.content : content.split('\n').filter(Boolean)
      };

  }).filter(service => service.slug && service.slug !== 'undefined');
}

export function getServiceBySlug(slug) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const fullPath = path.join(servicesDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  return {
    ...data,
    slug,
    content: Array.isArray(data.content) ? data.content : content.split('\n').filter(Boolean)
  };

}
