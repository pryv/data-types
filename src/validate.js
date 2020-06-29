if(!process.argv[2]) {
    console.error('Json file with validation cases not provided');
    process.exit(1);
}

const fs = require('fs');

const schemaPath = process.argv[3] || './../dist/flat.json';
const typesSchema = require(schemaPath);
const validationCases = require(process.argv[2]);

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

    const validationResult = validator.validate(validationCase.content, type);

    const reportEntry = {};
    reportEntry['Tested type'] = validationCase.type;
    reportEntry['Tested value'] = validationCase.content;
    reportEntry['Validation passed'] = validationResult;
    reportEntry['Expected result'] = validationCase.expected;

    report.push(reportEntry);

    const expectedResultInt = expectedResultToInt(validationCase.expected);
    if(expectedResultInt === -1) {
        expectedResultNotSpecified++;
    } else if(expectedResultInt == validationResult) {
        passed++;
    } else {
        failed++;
    }
}

console.log('\nValidation results:\n', report);
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
