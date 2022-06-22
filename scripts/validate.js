/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/data-types/blob/master/LICENSE)
 */
if (!process.argv[2]) {
  console.error('Json file with validation cases not provided');
  process.exit(1);
}

const path = require('path');
const ZSchema = require('z-schema');
const util = require('util');

const rootPath = path.resolve(__dirname, '..');
const validationCasesPath = path.resolve(rootPath, process.argv[2]);
const schemaPath = process.argv[3] ? path.resolve(rootPath, process.argv[3]) : path.resolve(rootPath, 'dist/flat.json');

const schema = require(schemaPath);
const validationCases = require(validationCasesPath);

const validator = new ZSchema();

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

    const type = schema.types[validationCase.type];
    if (!type) {
      throw Error(`Type "${validationCase.type}" not found in schema file ${schemaPath}`);
    }

    const shouldValidate = expectedStringToBoolean(validationCase.expected);
    report['Expected to validate'] = shouldValidate;
    const didValidate = validator.validate(validationCase.content, type);
    report['Did validate'] = didValidate;
    if (shouldValidate !== didValidate) {
      report['Validation errors'] = validator.getLastErrors().map((err) => {
        return { message: err.message, path: err.path, code: err.code, params: err.params };
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
