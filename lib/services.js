// lib/services.js
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const servicesDirectory = path.join(process.cwd(), "data/services");

export function getAllServices() {
  const files = fs.readdirSync(servicesDirectory);
  return files.map((filename) => {
    const slug = filename.replace(".md", "");
    const fullPath = path.join(servicesDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    return {
        ...data,
        slug,
        content: content.split('\n').filter(Boolean) // quebra por linha
      };
      
  });
}

export function getServiceBySlug(slug) {
  const fullPath = path.join(servicesDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  return {
    ...data,
    slug,
    content: content.split('\n').filter(Boolean) // quebra por linha
  };
  
}
