import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const OUTPUT_DIR = path.join(__dirname, '../ai_models/models', MODEL_NAME);

const ROOT_FILES = [
  'config.json',
  'tokenizer.json',
  'tokenizer_config.json',
  'vocab.txt',
  'special_tokens_map.json'
];

const ONNX_FILES = [
  'model.onnx',
  'model_quantized.onnx' 
];

const downloadFile = async (filename: string, isOnnx: boolean) => {
  const remotePath = isOnnx ? `onnx/${filename}` : filename;
  const url = `https://huggingface.co/${MODEL_NAME}/resolve/main/${remotePath}?download=true`;
  
  const localDir = isOnnx ? path.join(OUTPUT_DIR, 'onnx') : OUTPUT_DIR;
  const dest = path.join(localDir, filename);

  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

  console.log(`fetching ${filename}.....`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(dest, new Uint8Array(arrayBuffer));
    console.log(`saved ${filename} to ${isOnnx ? 'onnx/' : 'root'}`);
  } catch (err) {
    console.error(`error downloading ${filename}:`, err);
  }
};

const main = async () => {
  console.log(`starting Structured Download...`);
  
  for (const file of ROOT_FILES) await downloadFile(file, false);
  for (const file of ONNX_FILES) await downloadFile(file, true);
  
  console.log('model download complete');
};

main();