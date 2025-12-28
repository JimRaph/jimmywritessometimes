import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsDir = path.join(__dirname, '../docs');
const outputFile = path.join(__dirname, '../static/metadata.json');

function getFiles(dir: string, allFiles: string[] = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, allFiles);
    } else if (name.endsWith('.md') || name.endsWith('.mdx')) {
      allFiles.push(name);
    }
  });
  return allFiles;
}

const metadata = getFiles(docsDir).map(file => {
  const fileContent = fs.readFileSync(file, 'utf-8');
  const { data } = matter(fileContent);

  const relativePath = path.relative(docsDir, file);
  const directory = path.dirname(relativePath);
  const urlSafeDirectory = directory === '.' ? '' : directory.replace(/_/g, '-');

  const slug = data.slug;

  const finalLink = urlSafeDirectory 
    ? `/articles/${urlSafeDirectory}/${slug}` 
    : `/articles/${slug}`;

  return {
    title: data.title,
    cover: data.cover,
    date: data.date || new Date().toISOString(),
    // slug: slug,
    series: urlSafeDirectory,
    tags: data.tags,
    link: finalLink,
  };
});

fs.writeFileSync(outputFile, JSON.stringify(metadata, null, 2));
console.log('metadata generated');