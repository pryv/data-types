/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/data-types/blob/master/LICENSE)
 */
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const version = require('../package.json').version;

const SRC = path.resolve(__dirname, '../src/');
const OPTIONALS = path.resolve(__dirname, '../optionals/');
const DEST = path.resolve(__dirname, '../dist/');

// -- data handlers

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

// -- load all classes json files
const classesFiles = fs.readdirSync(SRC).filter((e) => e.endsWith('.json'));

const classes = {};

classesFiles.forEach((classFile) => {
  console.log('Reading file: ' + classFile);
  const classContent = require(path.resolve(SRC, classFile));
  Object.assign(classes, classContent);
});

// -- load optionals
const optionalFiles = fs.readdirSync(OPTIONALS).filter((e) => e.endsWith('.json'));

optionalFiles.forEach((optionalFile) => {
  console.log('Reading file: ' + optionalFile);
  const optionalContent = require(path.resolve(OPTIONALS, optionalFile));
  Object.assign(flat, optionalContent);
  Object.assign(hierchical, optionalContent);
});

// -- Loop thru classes
Object.keys(classes).sort().forEach((classKey) => {
  const classContent = classes[classKey];

  // -- fill flat with classes and extra-classes
  flat.classes[classKey] = _.cloneDeep(classContent);
  delete flat.classes[classKey].formats;
  if (flat.classes[classKey].extras) { delete flat.classes[classKey].extras.formats; }

  // -- Handle Classe's own extras
  if (classContent.extras) {
    hierchical.extras[classKey] = classContent.extras;
    delete classContent.extras;
  }

  // -- Loop thru formats
  if (classContent.formats) {
    Object.keys(classContent.formats).forEach((formatKey) => {
      const formatContent = classContent.formats[formatKey];
      const formatFullKey = classKey + '/' + formatKey;

      // -- Handling fromat extras
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

fs.writeFileSync(path.resolve(DEST, 'event-types.json'), JSON.stringify(hierchical, null, 2));
fs.writeFileSync(path.resolve(DEST, 'flat.json'), JSON.stringify(flat, null, 2));

const flatMin = { version: flat.version, types: flat.types };

fs.writeFileSync(path.resolve(DEST, 'flat.min.json'), JSON.stringify(flatMin, null, 2));
