/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/data-types/blob/master/LICENSE)
 */
// Checks dist/flat.json the way Pryv cores use it:
// - the catalogue as a whole must compile (cores check it on download);
// - every type's schema must compile, or cores refuse every event of that type,
//   because their validator cannot build it. A malformed keyword (e.g.
//   `"additionalProperties": "true"`, a string) or misnested braces (`required`
//   inside `properties`) did exactly that without the build noticing.
const path = require('path');
const { createAjv } = require('./json-schema-validator');

const flatPath = path.resolve(__dirname, '../dist/flat.json');
const catalogue = require(flatPath);

const invalid = [];
const check = (label, schema) => {
  try {
    createAjv().compile(structuredClone(schema));
  } catch (err) {
    invalid.push(`  ${label}\n    ${err.message}`);
  }
};

check('(whole catalogue)', catalogue);
for (const [key, schema] of Object.entries(catalogue.types)) check(key, schema);

if (invalid.length > 0) {
  console.error(`Invalid schema(s) in ${flatPath}:\n${invalid.join('\n')}`);
  process.exit(1);
}
console.log(`  ✓ catalogue and ${Object.keys(catalogue.types).length} type schemas compile`);
