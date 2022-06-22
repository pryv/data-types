/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/data-types/blob/master/LICENSE)
 */
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const version = require('../package.json').version;

const srcPath = path.resolve(__dirname, '../src/');
const optionalsPath = path.resolve(__dirname, '../optionals/');
const destPath = path.resolve(__dirname, '../dist/');

// data handlers

const flat = {
  version: version,
  types: {},
  extras: {},
  classes: {}
};

const hierchical = {
  version: version,
  classes: {},
  extras: {}
};

// load all classes JSON files

const classesFiles = fs.readdirSync(srcPath).filter((e) => e.endsWith('.json'));

const classes = {};

console.log('Reading source class files...');
classesFiles.forEach((classFile) => {
  console.log(`  · ${classFile}`);
  const classContent = require(path.resolve(srcPath, classFile));
  Object.assign(classes, classContent);
});

// load optionals
const optionalFiles = fs.readdirSync(optionalsPath).filter((e) => e.endsWith('.json'));

console.log('Reading optional files...');
optionalFiles.forEach((optionalFile) => {
  console.log(`  · ${optionalFile}`);
  const optionalContent = require(path.resolve(optionalsPath, optionalFile));
  Object.assign(flat, optionalContent);
  Object.assign(hierchical, optionalContent);
});

// loop thru classes
Object.keys(classes).sort().forEach((classKey) => {
  const classContent = classes[classKey];

  // fill flat with classes and extra-classes
  flat.classes[classKey] = _.cloneDeep(classContent);
  delete flat.classes[classKey].formats;
  if (flat.classes[classKey].extras) { delete flat.classes[classKey].extras.formats; }

  // handle class extras
  if (classContent.extras) {
    hierchical.extras[classKey] = classContent.extras;
    delete classContent.extras;
  }

  if (classContent.formats) {
    // loop thru formats
    Object.keys(classContent.formats).forEach((formatKey) => {
      const formatContent = classContent.formats[formatKey];
      const formatFullKey = classKey + '/' + formatKey;

      // handling format extras
      const fromatExtras = formatContent.extras;
      delete formatContent.extras;
      flat.types[formatFullKey] = formatContent;
      flat.extras[formatFullKey] = fromatExtras;

      if (fromatExtras) {
        if (!hierchical.extras[classKey]) hierchical.extras[classKey] = {};
        if (!hierchical.extras[classKey].formats) hierchical.extras[classKey].formats = {};
        hierchical.extras[classKey].formats[formatKey] = fromatExtras;
      }
    });
  }
});
hierchical.classes = classes;

const flatMin = { version: flat.version, types: flat.types };

console.log('\nGenerating files...');
writeToDest('event-types.json', hierchical);
writeToDest('flat.json', flat);
writeToDest('flat.min.json', flatMin);

function writeToDest (fileName, object) {
  fs.writeFileSync(path.resolve(destPath, fileName), JSON.stringify(object, null, 2));
  console.log(`  ✓ ${fileName}`);
}

console.log(); // HACK: blank line to separate with z-schema output
