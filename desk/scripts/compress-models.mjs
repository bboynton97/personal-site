#!/usr/bin/env node

/**
 * Compresses all GLB/GLTF 3D models using gltf-transform with meshopt compression.
 * This can reduce file sizes by 50-80% while maintaining visual quality.
 * 
 * Usage: bun run scripts/compress-models.mjs
 */

import { execSync } from 'child_process';
import { readdirSync, statSync, mkdirSync, existsSync, renameSync, unlinkSync } from 'fs';
import { join, extname, basename, dirname } from 'path';

const PUBLIC_DIR = new URL('../public', import.meta.url).pathname;
const BACKUP_DIR = new URL('../public-backup', import.meta.url).pathname;

// Files to compress (GLB files are self-contained, GLTF need their bin files)
const EXTENSIONS = ['.glb', '.gltf'];

function findModels(dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findModels(fullPath, files);
    } else if (EXTENSIONS.includes(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getFileSize(path) {
  try {
    return statSync(path).size;
  } catch {
    return 0;
  }
}

function getBinSize(gltfPath) {
  // For GLTF files, also count the associated .bin file
  const binPath = gltfPath.replace('.gltf', '.bin');
  return getFileSize(binPath);
}

async function compressModel(inputPath) {
  const ext = extname(inputPath).toLowerCase();
  const isGltf = ext === '.gltf';
  
  // Create output path (always output as .glb for better compression)
  const outputPath = inputPath.replace(ext, '_compressed.glb');
  
  // Get original size (include .bin for gltf files)
  let originalSize = getFileSize(inputPath);
  if (isGltf) {
    originalSize += getBinSize(inputPath);
  }
  
  try {
    // Run gltf-transform optimize with meshopt compression
    // This applies: dedup, flatten, join, prune, resample, quantize, and meshopt compression
    const gltfTransformBin = new URL('../node_modules/.bin/gltf-transform', import.meta.url).pathname;
    const cmd = `"${gltfTransformBin}" optimize "${inputPath}" "${outputPath}" --compress meshopt --texture-compress webp`;
    
    console.log(`  Compressing: ${basename(inputPath)}...`);
    execSync(cmd, { stdio: 'pipe', cwd: dirname(inputPath) });
    
    const compressedSize = getFileSize(outputPath);
    const savings = originalSize - compressedSize;
    const percent = ((savings / originalSize) * 100).toFixed(1);
    
    return {
      input: inputPath,
      output: outputPath,
      originalSize,
      compressedSize,
      savings,
      percent,
      success: true
    };
  } catch (error) {
    console.error(`  ❌ Failed to compress ${basename(inputPath)}: ${error.message}`);
    return {
      input: inputPath,
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🔍 Scanning for 3D models in public/...\n');
  
  const models = findModels(PUBLIC_DIR);
  console.log(`Found ${models.length} models to compress:\n`);
  
  // Show what we'll compress
  let totalOriginalSize = 0;
  for (const model of models) {
    const ext = extname(model).toLowerCase();
    let size = getFileSize(model);
    if (ext === '.gltf') {
      size += getBinSize(model);
    }
    totalOriginalSize += size;
    const relativePath = model.replace(PUBLIC_DIR, 'public');
    console.log(`  📦 ${relativePath} (${formatBytes(size)})`);
  }
  console.log(`\n  Total: ${formatBytes(totalOriginalSize)}\n`);
  
  console.log('🗜️  Starting compression with meshopt + WebP textures...\n');
  
  const results = [];
  for (const model of models) {
    const result = await compressModel(model);
    results.push(result);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Compression Results:\n');
  
  let totalSavings = 0;
  let totalCompressed = 0;
  const successful = results.filter(r => r.success);
  
  for (const result of successful) {
    const relativePath = result.input.replace(PUBLIC_DIR, 'public');
    console.log(`  ✅ ${relativePath}`);
    console.log(`     ${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (${result.percent}% smaller)\n`);
    totalSavings += result.savings;
    totalCompressed += result.compressedSize;
  }
  
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n  ❌ Failed:');
    for (const result of failed) {
      console.log(`     ${result.input}`);
    }
  }
  
  console.log('='.repeat(60));
  console.log(`\n🎉 Total savings: ${formatBytes(totalSavings)}`);
  console.log(`   Original: ${formatBytes(totalOriginalSize)}`);
  console.log(`   Compressed: ${formatBytes(totalCompressed)}`);
  console.log(`   Reduction: ${((totalSavings / totalOriginalSize) * 100).toFixed(1)}%\n`);
  
  console.log('📝 Next steps:');
  console.log('   1. Review the *_compressed.glb files');
  console.log('   2. Update your code to use the compressed versions');
  console.log('   3. Or run: bun run scripts/compress-models.mjs --apply to replace originals\n');
  
  // If --apply flag is passed, replace originals
  if (process.argv.includes('--apply')) {
    console.log('🔄 Applying changes (replacing original files)...\n');
    
    for (const result of successful) {
      const ext = extname(result.input).toLowerCase();
      const newPath = result.input.replace(ext, '.glb');
      
      // Backup original
      if (!existsSync(BACKUP_DIR)) {
        mkdirSync(BACKUP_DIR, { recursive: true });
      }
      
      // Remove old file and rename compressed
      if (result.input !== newPath) {
        unlinkSync(result.input);
        // Also remove .bin file if it's a gltf
        if (ext === '.gltf') {
          const binPath = result.input.replace('.gltf', '.bin');
          if (existsSync(binPath)) unlinkSync(binPath);
        }
      }
      renameSync(result.output, newPath);
      console.log(`   Replaced: ${basename(newPath)}`);
    }
    
    console.log('\n✅ All files replaced with compressed versions!');
  }
}

main().catch(console.error);

