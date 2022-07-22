import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'index.js', //dir where app.js is
  output: [
    {
      format: 'esm',
      file: 'bundle.js'
    },
  ],
  plugins: [
    resolve(),
  ]
};
