# gridsome-gravity-forms
Gravity Forms Source Plugin for Gridsome.

Derived from [gatsby-source-gravityforms](https://github.com/robmarshall/gatsby-source-gravityforms) and converted for use in Gridsome

This plugin connects to WordPress Gravity Forms, retrieves the given forms, and adds the forms as well as all related fields to GraphQL.

## Installation

    # Install with NMP
    npm install gridsome-source-gravity-forms
## Configuration
### Default Configuration
In gridsome.config.js

    module.exports = {
        plugins:[
            use:'gridsome-source-gravity-forms',
            options:{
                baseUrl:'WordPress URL Without Trailing Slash',
                include:['FormId1','FormId2',...]
            }
        ]
    }

In your Environment Variables

    GFORMS_CONSUMER_KEY = API Consumer Key from Gravity Forms
    GFORMS_CONSUMER_SECRET = API Consumer Secret from Gravity Forms

### Additional Configuration Options
In gridsome.config.js

    ...
    use:'gridsome-source-gravity-forms',
    options:{
        ignoreFields:['FieldsToIgnore'], //By default both notifications and confirmations are ignored
        api:{
            # These Options are Not Secure and Should be Stored In Environment Variables
            key:'API Consumer Key from Gravity Forms',
            secret:'API Consumer Secret from Gravity Forms'
        }
    }

In you Environment Variables

    GFORMS_INCLUDE = 1,2,3 #String of form ID's separated by commas
    GFROMS_BASE_URL = WordPress URL Without Trailing Slash

## Querying Data
Form and field information can be obtained using a query similar to that below.

    allGravityForms{
        edges{
            node{
                form{
                    id
                    fields{
                        ...
                    }
                }
            }
        }
    }
