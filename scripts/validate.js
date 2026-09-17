/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/data-types/blob/master/LICENSE)
 */
// Usage: validate.js <cases.json> [schema.json] [--enforce-wildcards]
//
// A type is looked up by its exact key, as Pryv cores do. A type that only
// matches a wildcard format (e.g. `numset/heart` against `numset/*`) is unknown
// to a core, which accepts it with ANY content; by default it is reported that
// way. `--enforce-wildcards` validates it against the wildcard format instead,
// which describes the intended content but is not enforced by cores.
const args = process.argv.slice(2).filter((arg) => arg !== '--enforce-wildcards');
const enforceWildcards = process.argv.includes('--enforce-wildcards');

if (!args[0]) {
  console.error('Json file with validation cases not provided');
  process.exit(1);
}

const path = require('path');
const util = require('util');
const { createAjv } = require('./json-schema-validator');

const rootPath = path.resolve(__dirname, '..');
const validationCasesPath = path.resolve(rootPath, args[0]);
const schemaPath = args[1] ? path.resolve(rootPath, args[1]) : path.resolve(rootPath, 'dist/flat.json');

const schema = require(schemaPath);
const validationCases = require(validationCasesPath);

console.log('Validation results:');

let caseIndex = 0;
let passedCount = 0;
let failedCount = 0;
for (const validationCase of validationCases) {
  caseIndex++;
  const report = validateCase(validationCase);
  const passed = casePassed(report);
  if (passed) { passedCount++; } else { failedCount++; }
  console.log(`\n#${caseIndex}`, passed ? '✅' : '❌');
  console.log(util.inspect(report, { depth: 20, colors: true, compact: false }));
}

console.log('\nSummary:');
console.log('  Passed:', passedCount);
console.log('  Failed:', failedCount);

process.exit(failedCount);

function validateCase (validationCase) {
  const report = {};

  try {
    if (!Object.prototype.hasOwnProperty.call(validationCase, 'type')) {
      throw Error('Case is missing property "type"');
    }
    report['Tested type'] = validationCase.type;

    if (!Object.prototype.hasOwnProperty.call(validationCase, 'content')) {
      throw Error('Case is missing property "content"');
    }
    if (JSON.stringify(validationCase.content).length < 300) {
      report['Tested content'] = validationCase.content;
    } else {
      report['Tested content'] = '...Too long to display...';
    }

    let type = schema.types[validationCase.type];
    const slash = typeof validationCase.type === 'string' ? validationCase.type.indexOf('/') : -1;
    const wildcardKey = slash > 0 ? validationCase.type.slice(0, slash) + '/*' : null;
    const wildcardType = (type || wildcardKey == null) ? null : schema.types[wildcardKey];
    if (!type && !wildcardType) {
      throw Error(`Type "${validationCase.type}" not found in schema file ${schemaPath}`);
    }

    const shouldValidate = expectedStringToBoolean(validationCase.expected);
    report['Expected to validate'] = shouldValidate;
    if (wildcardType && !enforceWildcards) {
      // Mirror a core: an unknown type is accepted whatever its content.
      report.Note = `"${validationCase.type}" only matches the wildcard format "${wildcardKey}", which cores do not enforce: accepted with any content (use --enforce-wildcards to validate against "${wildcardKey}")`;
      report['Did validate'] = true;
      return report;
    }
    if (wildcardType) {
      report.Note = `validated against the wildcard format "${wildcardKey}", which cores do not enforce`;
      type = wildcardType;
    }
    // A schema that does not compile makes cores refuse every event of the type.
    const validateContent = createAjv().compile(type);
    const didValidate = validateContent(validationCase.content);
    report['Did validate'] = didValidate;
    if (shouldValidate !== didValidate) {
      report['Validation errors'] = (validateContent.errors || []).map((err) => {
        return { message: err.message, path: err.instancePath, keyword: err.keyword, params: err.params };
      });
    }
  } catch (err) {
    report.ERROR = err.message;
  }
  return report;
}

function expectedStringToBoolean (expectedString) {
  if (!expectedString) {
    throw Error('Case is missing property "expected"');
  }
  if (expectedString.toLowerCase().startsWith('success')) {
    return true;
  } else if (expectedString.toLowerCase().startsWith('fail')) {
    return false;
  } else {
    throw Error(`Unexpected value "${expectedString}" for property "expected"`);
  }
}

function casePassed (report) {
  return !report.ERROR &&
         report['Expected to validate'] === report['Did validate'];
}
