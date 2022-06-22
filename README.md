# Pryv data types

Events are the primary units of content in the Pryv.io data model. Depending on its type, an event can represent anything related to a particular time (picture, note, data measurement, etc).

We provide a list of **standard event types** for Pryv.io that you can customize to suit your needs as explained below.
The event types effectively in use by default are published on [our API site](https://api.pryv.com/event-types/).

The format validation follows the [JSON Schema](https://json-schema.org) specification, and Pryv.io uses the [z-schema](https://github.com/zaggino/z-schema) library for validation.


## Usage: how to customize data types

Prerequisite: Node.js v12+

To add and modify your own data types, follow these steps:

#### 1. Prepare a working copy of this repository

[Fork the repository](https://github.com/pryv/data-types/fork), then install dependencies for your local copy with `npm install`.

#### 2. Add files in the directory `/src-classes`

Filenames are not important as long as they end with `.json`.

The type of an event indicates how to handle its content and is specified as `{class}/{format}`. We recommend declaring each class into a separate files with corresponding filename for the sake of readability.

##### Contents of a `{class}.json` file

Your custom data type should be specified as a JSON object with the following properties:

- `{class}`: an object describing the class, i.e. what kind of data the type represents.
  - `formats`: an object whose properties define the possible data formats for the class.
    - `{format}`: an object describing the format using [JSON Schema](https://json-schema.org/). Properties includes:
      - `type`: the JSON Schema type.
      - `description` (optional): a string describing the format.
      - `extras` (optional): an object with extra information about the format.
  - `description` (optional): a string describing the class.
  - `extras` (optional): an object with additional information about the class.

The `extras` properties are extracted into a separate section in the generated files. The following properties are declared for the default types:
- `name`: an object with the class or format's localized name for different languages:
  - `{languageCode}`: the name in the language specified by the code.
- `symbol` (format only): a symbol representing the format.

For example, here is what an `angle.json` describing a class `angle` with formats `deg` and `grad` would look like:

- Minimal version:
  ```json
  {
    "angle": {
      "formats": {
        "deg": {
          "type": "number"
        },
        "grad": {
          "type": "number"
        }
      }
    }
  }
  ```
- With descriptions and extras:
  ```json
  {
    "angle": {
      "formats": {
        "deg": {
          "description": "Degrees",
          "type": "number",
          "extras": {
            "name": {
              "en": "Degrees",
              "fr": "Degrés"
            },
            "symbol": "°"
          }
        },
        "grad": {
          "description": "Gradians",
          "type": "number",
          "extras": {
            "name": {
              "en": "Gradians",
              "fr": "Grades"
            },
            "symbol": "grad"
          }
        }
      },
      "description": "The figure formed by two rays.",
      "extras": {
        "name": {
          "en": "Angle",
          "fr": "Angle"
        }
      }
    }
  }
  ```

#### 3. Rebuild the generated files into `dist/`

Run `npm run build`, which generates files `event-types.json`, `flat.json` and `flat.min.json` in `dist/`, then validates `flat.json`.

#### 4. Publish the generated files on a web server

When done, the URL to either `flat.json` or `flat.min.json` must be exposed by the [service information](https://api.pryv.com/reference/#service-info) in order for your types to be loaded by Pryv.io.

More information on the content validation for your custom data types can be found in the [Pryv.io setup guide](https://api.pryv.com/customer-resources/pryv.io-setup/#customize-event-types-validation).

### Validating your data types

Validation of your type definitions is already performed when generating the files (see above), but you can validate the structure of any file containing JSON schemas by running `npm run validate-schema <schema_path>`, where `<schema_path>` is a full path to the JSON file to validate.

Furthermore, you can define validation cases for your data types and execute them by running `npm run validate-content <content_validation_cases_path> <schema_path>`, where:

- `<content_validation_cases_path>` is a full path to a JSON file with validation cases defined as in the following example:
  ```json
    [
      {
          "type": "absorbed-dose/gy",
          "content": 45,
          "expected": "success"
      },
      {
          "type": "absorbed-dose/gy",
          "content": "some_v",
          "expected": "failure"
      }
    ]
  ```
- `<schema_path>` (optional) is a full path to the data types JSON file to use as reference. If not provided, `dist/flat.json` is used.

#### Generating a validation cases file from a Pryv.io API batch call

You can convert the request body of a [batch call](https://api.pryv.com/reference/#call-batch) with event creation calls to the corresponding validation cases by running `npm run batch-to-validate <batch_request_body_JSON_path>` (a `validation-cases.json` file will be created).


## Contents of the generated files in `dist/`

### [`events-types.json`](dist/event-types.json)

Event types represented in a hierarchical, mainly used for documentation generation purposes.

```json
{
  "version": "0.x.0",
  "classes": {
    "angle": {
      "description": "The figure formed by two rays.",
      "formats": {
        "deg": {
          "description": "Degrees",
          "type": "number"
        },
        ...
      }
    },
    ...
    "note": {
      "description": "To record different kinds of text-based notes, from simple text to more complex formatted content like social network posts.",
      "formats": {
        "html": {
          "description": "An HTML-formatted note.",
          "type": "string",
          "maxLength": 4194304
        },
        "txt": {
          "description": "A plain-text note.",
          "type": "string",
          "maxLength": 4194304
        }
      }
    },
    ...
  },
  "extras": {
    "angle": {
      "name": {
        "en": "Angle",
        "fr": "Angle"
      },
      "formats": {
        "deg": {
          "name": {
            "en": "Degrees",
            "fr": "Degrés"
          },
          "symbol": "°"
        },
        ...
      }
    },
    ...
  }
}
```

### `flat.json`

Event types in a key-value structure, mainly used for applications that require data format validation. This file is the one exposed by the [service information](https://api.pryv.com/reference/#service-info) in the `eventTypes` property. See for example: [https://reg.pryv.me/service/info](https://reg.pryv.me/service/info).

```json
{
  "version": "0.3.0",
  "types": {
    "angle/deg": {
      "description": "Degrees",
      "type": "number"
    },
    ...
  },
  "extras": {
    "angle/deg": {
      "name": {
        "en": "Degrees",
        "fr": "Degrés"
      },
      "symbol": "°"
    },
    ...
  },
  "classes": {
      "angle": {
      "description": "The figure formed by two rays.",
      "extras": {
        "name": {
          "en": "Angle",
          "fr": "Angle"
        }
      }
    }
  }
}
```

### `flat.min.json`

Identical to `flat.json` file with only the mandatory fields (version and types).


## Contributing

`npm run license` updates license information with [source-licenser](https://github.com/pryv/source-licenser).

`npm run lint` checks the code, which follows the [Semi-Standard](https://github.com/standard/semistandard) style.


## License

[BSD-3-Clause](https://github.com/pryv/data-types/blob/master/LICENSE)
