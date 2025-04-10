import fs from "fs";
import path from "path";
import matter from "gray-matter";

const servicesDir = path.join(process.cwd(), "data/services");

export function getAllServices() {
  const files = fs.readdirSync(servicesDir);

  return files.map((filename) => {
    const filePath = path.join(servicesDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContent);

    return {
      ...data,
      slug: data.slug || filename.replace(".md", ""),
    };
  });
}

export function getServiceBySlug(slug) {
  const filePath = path.join(servicesDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data } = matter(fileContent);

  return {
    ...data,
    slug,
  };
}
