# Pryv data types

Events are the primary units of content in Pryv.io data model. Depending on its type, an event can represent anything related to a particular time (picture, note, data measurement, etc).

We provide you with a list of **standard event types** used in Pryv that you can customize to suit your needs as explained below.

## Effective versions

The event types effectively in use are published on [our API site](https://api.pryv.com/event-types/).

## How to customize your data types

You can either [add issues](https://github.com/pryv/data-types/issues) or [fork and propose pull requests](https://github.com/pryv/data-types/fork). Please always include example use cases with your issues/pull requests.

The format validation follows [JSON SCHEMA](https://json-schema.org) specification and Pryv.io uses [z-schema](https://github.com/zaggino/z-schema) for validation.

To add and modify your own data types, you can follow these steps:

#### 1- Clone this repository 

run `npm install`

#### 2- Edit package.json `version` value

This will be used as the version for the files generated in `/dist`.

#### 3- Modify or add files in the directory `/src-classes`

Filenames are not important as long as they end with `.json`. We recommend to separate classes in independent files with their corresponding filename for the sake of readability.

##### Content of a `{classKey}.json` file

Your custom data type should be specified in a json formated document as an `Object` with the following properties:

- **{classKey}** the key of the class. For example, an angle measurement will have the key `"angle"`.
  - **description** (optional) a `string` describing the class.
  - **extras** (optional) can contain anything that would be relevant for your apps.
    - **name** (optional)
      - **{languageCode}** the name of this class in a specific language.
  - **formats** `Object` each property key will be a possible format of this class. 
    -  **{formatKey}** the key of the format. For example, the format key `"deg"` for degrees. 
      The content of these properties should follow [JSON Schema](https://json-schema.org/) format.
      - **description** (optional) a `string` describing the format.
      - **type** `Mixed` as per JSON schema.
      - **extras** (optional) they will be stripped out in a separate "extra" place at build.

Examples:

- Minimalist **angle.json** file

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

- Extended **angle.json** file

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

#### 4- Build the document to `/dist`

run `npm run build`

Three new versions of files in `/dist` will be created:

- **event-types.json**
- **flat.json**
- **flat.min.json** 

#### 5- Publish these files on a web sever and expose flat.json or flat.min.json.

The files `flat.json` or `flat.min.json` should be exposed by **Pryv.io** from `service/info`.

More information on the content validation for your custom data types can be found in the [Pryv.io Setup Guide](https://api.pryv.com/customer-resources/pryv.io-setup/#customize-event-types-validation). 

## Contents

We present below the content of the three files generated in `/dist`:

- **dist/** contains the processed files ready to be used and consumed by applications and services, in particular: 

  - **events-types.json** Event types represented in a hierarchical structure. It is mainly used for documentation generation purposes.
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

    

  - **flat.json** Event types in a key / value structure. It is mainly used for applications that require data format validation.

    This file is the one that is exposed by Pryv.io `service/info/` route with the `eventTypes` property. Example: [https://reg.pryv.me/service/info](https://reg.pryv.me/service/info)
    *Note: Only the properties `version` and `types` are mandatory.*

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

  - **flat.min.json** Identical to **flat.json** file with only the mandatory fields (version and types).

  ##  License

(Revised BSD license, adapted.)

Copyright (c) 2020, Pryv S.A. All rights reserved.

Redistribution and use of this work, with or without modification, are permitted provided that the following conditions are met:

* Redistributions must retain the above copyright notice, this list of conditions and the following disclaimer.
* Neither the name of Pryv nor the names of its contributors may be used to endorse or promote products derived from this work without specific prior written permission.

THIS WORK IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PRYV BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS WORK, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
