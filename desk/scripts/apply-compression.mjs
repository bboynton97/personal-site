#!/usr/bin/env node

/**
 * Applies compressed 3D models by replacing originals with compressed versions.
 * 
 * Usage: node scripts/apply-compression.mjs
 */

import { readdirSync, statSync, renameSync, unlinkSync, existsSync, rmSync } from 'fs';
import { join, extname, basename, dirname } from 'path';

const PUBLIC_DIR = new URL('../public', import.meta.url).pathname;

function findCompressedModels(dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findCompressedModels(fullPath, files);
    } else if (entry.name.endsWith('_compressed.glb')) {
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

async function main() {
  console.log('🔍 Finding compressed models...\n');
  
  const compressedFiles = findCompressedModels(PUBLIC_DIR);
  console.log(`Found ${compressedFiles.length} compressed models\n`);
  
  for (const compressedPath of compressedFiles) {
    const dir = dirname(compressedPath);
    const compressedName = basename(compressedPath);
    
    // Determine the original file name pattern
    // scene_compressed.glb -> scene.glb (was scene.gltf + scene.bin)
    // model_compressed.glb -> model.glb
    const baseName = compressedName.replace('_compressed.glb', '');
    
    // New path for the final file
    const newPath = join(dir, baseName + '.glb');
    
    console.log(`📦 Processing: ${compressedName}`);
    
    // Check if we need to remove old gltf+bin files
    const oldGltfPath = join(dir, baseName + '.gltf');
    const oldBinPath = join(dir, baseName + '.bin');
    const oldGlbPath = join(dir, baseName + '.glb');
    
    // Remove old files
    if (existsSync(oldGltfPath)) {
      unlinkSync(oldGltfPath);
      console.log(`   Removed: ${baseName}.gltf`);
    }
    if (existsSync(oldBinPath)) {
      unlinkSync(oldBinPath);
      console.log(`   Removed: ${baseName}.bin`);
    }
    if (existsSync(oldGlbPath) && oldGlbPath !== compressedPath) {
      unlinkSync(oldGlbPath);
      console.log(`   Removed: ${baseName}.glb`);
    }
    
    // Rename compressed file to final name
    renameSync(compressedPath, newPath);
    console.log(`   Renamed: ${compressedName} → ${baseName}.glb`);
    
    // Check if there's a textures folder we can remove (textures are now embedded)
    const texturesDir = join(dir, 'textures');
    if (existsSync(texturesDir)) {
      rmSync(texturesDir, { recursive: true });
      console.log(`   Removed: textures/ folder (now embedded)`);
    }
    
    console.log('');
  }
  
  console.log('✅ Done! All compressed models are now in place.\n');
  console.log('📝 You may need to update code references from .gltf to .glb for:');
  console.log('   - Notepad/scene.gltf → Notepad/scene.glb');
  console.log('   - scope/scene.gltf → scope/scene.glb');
  console.log('   - speaker/scene.gltf → speaker/scene.glb');
  console.log('   - metal_desk/scene.gltf → metal_desk/scene.glb');
  console.log("   - Mazda RX-7 Akagi's White Comet Remake/scene.gltf → scene.glb");
  console.log('   - computer/scene.gltf → computer/scene.glb');
}

main().catch(console.error);

