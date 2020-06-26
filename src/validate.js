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
    reportEntry['Tested value'] = validationCase.content;
    reportEntry['Validation passed'] = validator.validate(validationCase.content, type);
    reportEntry['Expected result'] = validationCase.expected;

    report.push(reportEntry);
}

console.log('\nValidation results:\n', report);

