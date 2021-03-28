const fs = require('fs');

let typedoc = require('./src/test.json');
// let typedoc = require('../node_modules/@types/puppeteer/index');

// let generateFilter = ['Browser'];
let generateFilter = ['Page', 'JSHandle'];

let generateFor = typedoc.children.filter((e) => generateFilter.includes(e.name));

generateFor.forEach((def) => {
  console.log('Generating for ' + def.name);
  createClassFor(def);
});

function createClassFor(def) {
  let className = def.name;

  let start = `<?php

namespace Puth\\FakeClasses;

use Puth\\GenericObject;

/**
 * Class ${className}
 * @package Puth\\FakeClasses
 *\n`;

  let end = `\n*/
class ${className} extends GenericObject {}`;

  let methodComments = [];

  let methods = def.children
    .filter((e) => e.kindString === 'Method')
    .map((method) => {
      let signature = method.signatures[0];

      function log(...rest) {
        if (method.name === 'awdawda') {
          console.log(...rest);
        }
      }

      function resolveTypeToPhp(typeDef, isDef = false) {
        log('resolveTypeToPhp', typeDef);

        if (isDef && typeDef.kindString && typeDef.kindString === 'Interface') {
          return typeDef.name;
        }

        if (isDef) {
          if (typeDef.type) {
            typeDef = typeDef.type;
          } else {
            return;
          }
        }

        if (typeDef.types) {
          return typeDef.types.map((type) => resolveTypeToPhp(type)).filter((t) => t)[0];
        }
        if (typeDef.type) {
          if (typeDef.type === 'intrinsic') {
            if (typeDef.name === 'any') {
              return 'mixed';
            }
            if (typeDef.name === 'symbol') {
              // Symbols are not supported
              return undefined;
            }
            return typeDef.name;
          }
          if (typeDef.type === 'reflection') {
            // Set function type to string because you can't easily transfrom php functions to js function
            return 'string';
          }
          if (typeDef.type === 'array') {
            return 'array';
          }
          if (typeDef.type === 'literal') {
            return 'string';
          }
        }
      }

      log('signature', signature);

      let parameters = signature.parameters
        ? signature.parameters
            // .filter((p) => p.kindString === 'Parameter')
            .map((parameter) => {
              let defaultNull = ' = null';

              let typeDef = parameter.type;
              let type = typeDef.type;
              let typeTransformed;

              if (parameter.name === 'awdawdawda') {
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.log(parameter);
              }
              log('parameter', parameter, type);

              if (type === 'reference') {
                let refResovled = typedoc.children.find((c) => c.id === typeDef.id);

                log('reference', parameter.name, typeDef.name, refResovled);

                if (refResovled) {
                  if (isOptionsArray(refResovled)) {
                    typeTransformed = 'array';
                  } else {
                    typeTransformed = resolveTypeToPhp(refResovled, true);
                  }
                  log('reference', parameter.name, typeDef.name, isOptionsArray(refResovled));
                } else {
                  typeTransformed = 'object';
                }
              } else {
                typeTransformed = resolveTypeToPhp(typeDef);
              }

              let showDefaultValue = !!parameter.flags.isOptional;

              return `${typeTransformed} $${parameter.name}${showDefaultValue ? defaultNull : ''}`;
            })
        : [];

      log('parameters', parameters);

      return ` * @method ${method.name}(${parameters.join(', ')})`;
    });

  let file = start + methods.join('\n') + end;

  // console.log(file);

  fs.writeFileSync('generated/php/' + className + '.php', file);
}

function isOptionsArray(def) {
  return def.children ? !def.children.find((c) => c.kindString === 'Method') : false;
  // return !def.children.find((c) => c.kindString === 'Method');
}
