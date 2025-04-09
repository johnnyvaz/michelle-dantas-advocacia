import fs from "fs";
import path from "path";

const postsDir = path.join(process.cwd(), "data/posts");


export function getPostById(id) {
  return getAllPosts().find((post) => post.id === parseInt(id));
}

export function getAllPosts() {
  const files = fs.readdirSync(postsDir);
  return files.map((filename) => {
    const filePath = path.join(postsDir, filename);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return jsonData;
  });
}


export function getPostBySlug(slug) {
  return getAllPosts().find((post) => post.slug === slug);
}