const fs = require('fs');
const path = require('path');

const VALIDATION_CASES_FILENAME = 'validation-cases.json';

const batchPath = path.resolve(__dirname, '..', process.argv[2]);
const batch = require(batchPath);

const validationCases = [];

batch.forEach(c => {
  if (c.method === 'events.create') validationCases.push({
    type: c.params.type,
    content: c.params.content,
    expected: 'success',
  });
});

console.log(validationCases)

fs.writeFileSync(VALIDATION_CASES_FILENAME, JSON.stringify(validationCases, null, 2));

