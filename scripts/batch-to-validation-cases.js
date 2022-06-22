/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/data-types/blob/master/LICENSE)
 */
const fs = require('fs');
const path = require('path');

const outputFilename = 'validation-cases.json';

const batchPath = path.resolve(__dirname, '..', process.argv[2]);
const batch = require(batchPath);

const validationCases = [];

let casesCount = 0;
batch.forEach(call => {
  if (call.method === 'events.create') {
    validationCases.push({
      type: call.params.type,
      content: call.params.content,
      expected: 'success'
    });
    casesCount++;
  }
});

if (casesCount === 0) {
  console.error('No "events.create" calls found to create validation cases from.');
  process.exit(1);
}

fs.writeFileSync(outputFilename, JSON.stringify(validationCases, null, 2));

console.log(`Validation cases successfully created in ${outputFilename}`);
