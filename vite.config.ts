import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5173, open: false },
  build: {
    target: 'es2022',
    sourcemap: false,
    assetsInlineLimit: 0, // keep models/video/audio as real files
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr'],
});
