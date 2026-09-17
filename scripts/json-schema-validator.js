/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/data-types/blob/master/LICENSE)
 */
// The JSON Schema validator Pryv cores use to validate event content: ajv with
// the draft-04 dialect and formats, configured the same way. Checking the
// catalogue with anything else lets schemas through that cores cannot compile.
const Ajv = require('ajv-draft-04');
const addFormats = require('ajv-formats');

function createAjv () {
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    coerceTypes: false,
    validateFormats: true
  });
  addFormats(ajv);
  return ajv;
}

module.exports = { createAjv };
