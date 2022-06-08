# Pryv data types

Events are the primary units of content in the Pryv.io data model. Depending on its type, an event can represent anything related to a particular time (picture, note, data measurement, etc).

We provide a list of **standard event types** used in Pryv that you can customize to suit your needs as explained below.


## Effective version

The event types effectively in use by default are published on [our API site](https://api.pryv.com/event-types/).


## How to customize your data types

*Prerequisites:* Node v12+

You must [fork](https://github.com/pryv/data-types/fork) this repository, add the data types that you want to validate and host it on a URL where it will be loaded by Pryv.io on boot.

The format validation follows the [JSON Schema](https://json-schema.org) specification and Pryv.io uses the [z-schema](https://github.com/zaggino/z-schema) library for validation.

To add and modify your own data types, you can follow these steps:

#### 1. Fetch dependencies

run `npm install`

#### 2. Add files in the directory `/src-classes`

Filenames are not important as long as they end with `.json`.

The type of an event indicates how to handle its content and is specified as `{class}/{format}`. We recommend to separate classes in independent files with their corresponding filename for the sake of readability.

##### Content of a `{class}.json` file

Your custom data type should be specified in a JSON formated document as an `Object` with the following properties:

- **{class}** the class of the event type (specified as `{class}/{format}`). For example, an angle measurement will have the class `"angle"`.
  - **formats** `Object` each property key will be a possible format of this class.
    -  **{format}** the format of the event type (specified as `{class}/{format}`). For example, the format `"deg"` for degrees.
      The content of these properties should follow [JSON Schema](https://json-schema.org/) format.
      - **description** (optional) a `string` describing the format.
      - **type** `Mixed` as per JSON schema.
      - **extras** (optional) they will be stripped out in a separate "extra" place at build.
  - **description** (optional) a `string` describing the class.
  - **extras** (optional) can contain anything that would be relevant for your apps.
    - **name** (optional)
      - **{languageCode}** the name of this class in a specific language.

Examples:

- Minimalist `angle.json` file

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
```

- Extended `angle.json` file

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
        "description": "Grade",
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

#### 3. Build the document to `dist/`

run `npm run build`

Three new versions of files will be created in `dist/`:

- `event-types.json`
- `flat.json`
- `flat.min.json`

Furthermore, the file `flat.json` will be validated.

#### 4. Publish these files on a web sever and expose `flat.json` or `flat.min.json`

The URL to the file `flat.json` or `flat.min.json` should be exposed by the [service information](https://api.pryv.com/reference/#service-info).

More information on the content validation for your custom data types can be found in the [Pryv.io Setup Guide](https://api.pryv.com/customer-resources/pryv.io-setup/#customize-event-types-validation).


## Data types validation

To validate that the schemas you have provided have proper JSON structure, you may execute below script:

`npm run validate-schema <shema_path>`

where `schema_path` is a full path to the data type JSON file to validate.

Furthermore, to validate data type values against generated `flat.json` file (or any file with the same structure), following script may be used:

`npm run validate-content <content_validation_cases_path> <schema_path>`

where:

- `content_validation_cases_path` is a full path to a JSON file with validation cases having following structure:

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

- `schema_path` is a full path to the data type JSON file to validate. Optional - if not provided, generated `flat.json` will be used.

### Troubleshoot

If you are having issues creating events with custom data types, here is a small tool to convert the request body of a [batch call](https://api.pryv.com/reference/#call-batch) to its events creation validation cases:

`npm run batch-to-validate`


## Contents

We present below the content of the three files generated in `dist/`:

### `events-types.json`

Event types represented in a hierarchical structure. It is mainly used for documentation generation purposes.

Extract of the structure:

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
        "grad": {
          "description": "Grade",
          "type": "number"
        }
      }
    },
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
    }
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
        "grad": {
          "name": {
            "en": "Gradians",
            "fr": "Grades"
          },
          "symbol": "grad"
        }
      }
    }
  }
}
```

### `flat.json`

Event types in a key / value structure. It is mainly used for applications that require data format validation.

This file is the one that is exposed by the [service information](https://api.pryv.com/reference/#service-info) in the `eventTypes` property. Example: [https://reg.pryv.me/service/info](https://reg.pryv.me/service/info).

```json
{
  "version": "0.3.0",
  "types": {
    "angle/deg": {
      "description": "Degrees",
      "type": "number"
    },
    "angle/grad": {
      "description": "Grade",
      "type": "number"
    }
  },
  "extras": {
    "angle/deg": {
      "name": {
        "en": "Degrees",
        "fr": "Degrés"
      },
      "symbol": "°"
    },
    "angle/grad": {
      "name": {
        "en": "Gradians",
        "fr": "Grades"
      },
      "symbol": "grad"
    }
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


## License

(Revised BSD license, adapted.)

Copyright (c) 2020, Pryv S.A. All rights reserved.

Redistribution and use of this work, with or without modification, are permitted provided that the following conditions are met:

* Redistributions must retain the above copyright notice, this list of conditions and the following disclaimer.
* Neither the name of Pryv nor the names of its contributors may be used to endorse or promote products derived from this work without specific prior written permission.

THIS WORK IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PRYV BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS WORK, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
