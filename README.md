# Pryv data types

Standard event types used in Pryv.


## Effective versions

The types effectively in use are published on [our API site](http://api.pryv.com).

## Contents

- **dist/** Proccessed files ready to be used and consumed by applications and services 

  - **events-types.json** Event types represented in a hierarchical structure. It's mainly used for documentation generation purposes.
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

    

  - **flat.json** Event types in a key / value structure. Is main usage being for applications that require data format validations.

    This file is the one that is exposed by Pryv.io `service/info/` route with the `eventTypes` property. Exemple: [https://reg.pryv.me/service/info](https://reg.pryv.me/service/info)
    Note: Only the properties `version` and `types` are mandatory.

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

  - **flat.min.json** Indentical to flat.json with only the mandatory fields (version and types)

  

## How to contribute

Things currently stand at the proposal level, with some types reasonably stable, others more likely to change, and many others missing. At this stage, **we definitely need your feedback and contributions**. 

You can either [add issues](https://github.com/pryv/data-types/issues) or [fork and propose pull requests](https://github.com/pryv/data-types/fork). Please always include example use cases with your issues/pull requests.

The format validation follows  [JSON SCHEMA](https://json-schema.org) specification and Pryv.io uses [z-scheam](https://github.com/zaggino/z-schema) for validation.

#### 1- Clone this repository 

run `npm install`

#### 2- Edit package.json  `version` value

This will be used as the version for the files generated in `/dist`

#### 3- Modifiy or add files in the directory `/src-classes`

Filenames are not important as long as they end with `.json` for readability we recommend separating classes in independent files with their corresponding filename.

##### Content of a `{classKey}.json` file

A json formated document as an `Object`with the following properties

- **{classKey}** they key of the class for example `"angle"` for angles measures
  - **description** (optional) `string` 
  - **extras** (optional) can contain anything that would be relevant for your Apps.
    - **name** (optional)
      - **{languageCode}** Name of this class in a specific language 
  - **fromats** `Object` each property key beign a format of this class. 
    -  **{fromatKey}** they key of the format examples: `"deg"` for degrees. 
      The content of this properties should follow [https://json-schema.org/](JSON Schema) format.
      - **description** (optional) `string`
      - **type** `Mixed` as per JSON schema
      - **extras** (optional) they will be stripped out in a separete "extra" place at build.

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

Three new versions of files in `/dist`

- **event-types.json**
- **flat.json**
- **flat.min.json** 

#### 5- Publish these files on a web sever and expose flat.json or flat.min.json.

`flat.json` or `flat.min.json` should be exposed by **Pryv.io** from `service/info`

More info: on [https://api.pryv.com/customer-resources/pryv.io-setup/#customize-event-types-validation](Pryv.io Setup Guide) 

##  License

(Revised BSD license, adapted.)

Copyright (c) 2020, Pryv S.A. All rights reserved.

Redistribution and use of this work, with or without modification, are permitted provided that the following conditions are met:

* Redistributions must retain the above copyright notice, this list of conditions and the following disclaimer.
* Neither the name of Pryv nor the names of its contributors may be used to endorse or promote products derived from this work without specific prior written permission.

THIS WORK IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PRYV BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS WORK, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
