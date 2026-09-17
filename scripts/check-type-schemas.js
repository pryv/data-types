/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/data-types/blob/master/LICENSE)
 */
// Usage: check-type-schemas.js [schema.json]   (default: dist/flat.json)
//
// Checks a file the way Pryv cores use it. For an event-types catalogue (a file
// with `types`):
// - the catalogue as a whole must compile (cores compile it on download; with
//   `strict: false` that barely checks anything, the per-type loop below is the
//   check that matters);
// - every type's schema must compile, or cores refuse every event of that type,
//   because their validator cannot build it. A malformed keyword (e.g.
//   `"additionalProperties": "true"`, a string) or misnested braces (`required`
//   inside `properties`) did exactly that without the build noticing.
// Any other file is checked as a single JSON schema.
const path = require('path');
const { createAjv } = require('./json-schema-validator');

const filePath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(__dirname, '../dist/flat.json');
const content = require(filePath);

const invalid = [];
const check = (label, schema) => {
  try {
    createAjv().compile(schema);
  } catch (err) {
    invalid.push(`  ${label}\n    ${err.message}`);
  }
};

const isCatalogue = content !== null && typeof content === 'object' &&
  content.types !== null && typeof content.types === 'object';
if (isCatalogue) {
  check('(whole catalogue)', content);
  for (const [key, schema] of Object.entries(content.types)) check(key, schema);
} else {
  check('(schema)', content);
}

if (invalid.length > 0) {
  console.error(`Invalid schema(s) in ${filePath}:\n${invalid.join('\n')}`);
  process.exit(1);
}
console.log(isCatalogue
  ? `  ✓ catalogue and ${Object.keys(content.types).length} type schemas compile`
  : `  ✓ ${filePath} compiles`);
