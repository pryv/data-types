/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/data-types/blob/master/LICENSE)
 */
const neostandard = require('neostandard');

module.exports = [
  ...neostandard({
    semi: true
  }),
  {
    ignores: [
      'node_modules/**',
      '**/node_modules/**',
      'dist/**'
    ]
  }
];
