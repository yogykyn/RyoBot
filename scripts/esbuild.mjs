#!/usr/bin/env node
import * as esbuild from 'esbuild';
import arg from 'arg';

const args = arg({
  '--watch': Boolean,
  '--quiet': Boolean,
  '--development': Boolean,
  }, { argv: process.argv });
  
/** @type {import('esbuild').BuildOptions} */
const defaultBuildOptions = {
  entryPoints: [
    'src/**/*.ts',
  ],
  outdir: 'dist',
  target: 'node18',
  format: 'esm',
  platform: 'node',
  bundle: true,
  keepNames: true,
  splitting: true,
  external: [
    '@whiskeysockets/baileys',
    'pino',
  ],
  minify: !(args['--development'] ?? false),
  treeShaking: !(args['--development'] ?? false),
};

if (args?.['--watch'] === true) {
  const ctx = await esbuild.context(defaultBuildOptions);
  await ctx.watch();
} else {
  await esbuild.build(defaultBuildOptions);
}
