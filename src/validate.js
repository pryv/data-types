if(!process.argv[2]) {
  console.error('Json file with validation cases not provided');
  process.exit(1);
}

const path = require('path');
const fs = require('fs');

const validationCasesPath = path.resolve(__dirname, '..', process.argv[2]);
const schemaPath = process.argv[3] ? path.resolve(__dirname, '..', process.argv[3]) : path.resolve(__dirname, '..', 'dist/flat.json');

const typesSchema = require(schemaPath);
const validationCases = require(validationCasesPath);

const ZSchema = require("z-schema");
const validator = new ZSchema();

const report = [];
let passed = 0;
let failed = 0;
let expectedResultNotSpecified = 0;
for(const validationCase of validationCases) {
  if(!validationCase.hasOwnProperty('type')) {
      console.warn('Type property for this case not provided. Skipping ...');
      continue;
  }
  if(!validationCase.hasOwnProperty('content')) {
      console.warn('Content property for this case not provided. Skipping ...');
      continue;
  }

  const type = typesSchema.types[validationCase.type];
  if(!type) {
      console.warn(`Type: ${validationCase.type} not found in schema: ${schemaPath}`);
      continue;
  }

  const reportEntry = {};
  reportEntry['Tested type'] = validationCase.type;
  if (JSON.stringify(validationCase.content).length < 300) {
    reportEntry['Tested value'] = validationCase.content;
  } else {
    reportEntry['Tested value'] = '... Too long to display ...';
  }
  
  reportEntry['Expected result'] = validationCase.expected;


  try {
    const validationResult = validator.validate(validationCase.content, type);
    reportEntry['Validation passed'] = validationResult;

    const expectedResultInt = expectedResultToInt(validationCase.expected);
    if(expectedResultInt === -1) {
        expectedResultNotSpecified++;
    } else if (expectedResultInt == validationResult) {
        passed++;
    } else {
        failed++;
        reportEntry['Validation errors'] = validator.getLastErrors().map((err) => { return { message: err.message, path: err.path , code: err.code, params: err.params}; });
    }


  } catch (err) {
    reportEntry['Error'] = err.message;
    failed++;
  }

  report.push(reportEntry);

  
}
const util = require('util');
console.log('\nValidation results:\n', util.inspect(report, {depth: 20, colors: true}) );
console.log('\nPassed: ', passed);
console.log('Failed: ', failed);
if (expectedResultNotSpecified > 0) {
  console.log('Expected result not specified: ', expectedResultNotSpecified);
}

function expectedResultToInt(outcome) {
  if(!outcome) {
      return -1;
  }
  if(outcome.toLowerCase().startsWith('success')) {
      return 1;
  }
  if(outcome.toLowerCase().startsWith('fail')) {
      return 0;
  }
  return -1;
}
