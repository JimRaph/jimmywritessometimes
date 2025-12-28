import { pipeline } from '@xenova/transformers';
import fs from 'fs-extra';
import fg from 'fast-glob';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_PATH = 'docs'; 
const OUTPUT_FILE = 'static/search-index.json';

const handler = async () => {
  console.log('Starting indexing process...');

  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const files = await fg(`${CONTENT_PATH}/**/*.{md,mdx}`);
  const indexData = [];


  for (const file of files) {
    const rawContent = await fs.readFile(file, 'utf8');
    const { data, content: bodyContent } = matter(rawContent);
    
    const relativePath = path.relative(CONTENT_PATH, file);
    const directory = path.dirname(relativePath);
    const urlSafeDirectory = directory === '.' ? '' : directory.replace(/_/g, '-');
    const slug = data.slug

    const globalText = `Title: ${data.title}. Description: ${data.description || ''}. Tags: ${data.tags?.join(' ') || ''}`;
    const globalOutput = await embedder(globalText, { pooling: 'mean', normalize: true });

    const chunks = bodyContent.match(/[\s\S]{1,500}/g) || [];
    const chunkEmbeddings = [];

    for (const chunk of chunks) {
      const chunkOutput = await embedder(chunk, { pooling: 'mean', normalize: true });
      chunkEmbeddings.push(Array.from(chunkOutput.data));
    }

    const finalLink = urlSafeDirectory 
      ? `/articles/${urlSafeDirectory}/${slug}` 
      : `/articles/${slug}`;

    console.log(`Processing: ${data.title || slug}`);


    indexData.push({
      title: data.title || 'Untitled',
      path: finalLink,
      globalEmbedding: Array.from(new Float32Array(globalOutput.data as any)).map(v => parseFloat(v.toFixed(4))),
      chunkEmbeddings: chunkEmbeddings.map(chunk => 
        Array.from(new Float32Array(chunk)).map(v => parseFloat(v.toFixed(4)))
      ), 
      // content: bodyContent.substring(0, 160).trim() + "..."
    });
  }

  await fs.ensureDir('static');
  await fs.writeJson(OUTPUT_FILE, indexData);

  console.log(`embedding done, saved to ${OUTPUT_FILE}`);
};

handler().catch(console.error);