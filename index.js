const chalk = require('chalk')

const { getFormsAndFields } = require('./utils/axios')
const { isBlank } = require('./utils/helpers')

const log = console.log

class GravityFormsSource{
    constructor(api,options){
        this.api = api;
        this.options = options;
        if(isBlank(this.options)){
            this.options = {}
        }
        log('Starting Gravity Forms Source plugin');
        this.initDefaultValues()
        this.validateValues();
        this.getGravityForms()

    }
    initDefaultValues(){
        let defaultIgnoredFields = ['notifications','confirmations'];
        this.options.basicAuth={
            username:'',
            password:'',
        }
        if(!this.options.hasOwnProperty('ignoreFields')){
            this.options.ignoreFields=defaultIgnoredFields
        }
        else{
            this.options.ignoreFields=this.ignoreFields.concat(defaultIgnoredFields)
        }
        if(!this.options.hasOwnProperty('exclude')||isBlank(this.options.exclude)){
            this.options.exclude = [];
        }
    }
    validateValues(){
        if(!this.options.hasOwnProperty('baseUrl')||isBlank(this.options.baseUrl)){
            log('Base URL Option Not Provided. Checking Environment');
            this.options.baseUrl = process.env.GFORMS_BASE_URL;
            if(isBlank(this.options.baseUrl)){
                log(chalk.black.bgRedBright('Error: Base URL Not Configured for Gridsome Gravity Forms'));
                return;
            }
        }
        log('Base URL Configured');


        if(!this.options.hasOwnProperty('include')||isBlank(this.options.include)||this.options.include.length<=0){
            log('No Included Forms not Provided. Checking Environment');
            this.options.include = process.env.GFORMS_INCLUDE.split(',');
            if(isBlank(this.options.include)){
                log(chalk.black.bgRedBright('Error:Include Forms Not Configured for Gridsome Gravity Forms'));
                return;
            }
        }
        log('Included Forms Configured');

        if(isBlank(process.env.GFORMS_CONSUMER_KEY)||isBlank(process.env.GFORMS_CONSUMER_SECRET)){
            log('API Values Not found in Environment. Checking Passed Values');
            if(!this.options.hasOwnProperty('api')||!this.options.api.hasOwnProperty('key')||
                !this.options.api.hasOwnProperty('secret')||isBlank(this.options.api.key)||isBlank(this.options.api.secret)){
                log(chalk.black.bgRedBright('Error: API Values Not Configured for Gridsome Gravity Forms'))
                return;
            }  
            log(chalk.black.bgYellowBright('WARNING: API VALUES SHOULD BE STORED AS ENVIRONMENT VARIABLES'))
        }
        else{
            this.options.api={}
            this.options.api.key = process.env.GFORMS_CONSUMER_KEY
            this.options.api.secret = process.env.GFORMS_CONSUMER_SECRET
        }
        log('API Values Configured');
    }

    async getGravityForms(){
        log('Beginning Gravity Forms Retrieval');
        let formArgs = {
            include:this.options.include,
            exclude:this.options.exclude
        }
        let formsObject = await getFormsAndFields(this.options.basicAuth,this.options.api,this.options.baseUrl,formArgs)
        if(formsObject&&Object.keys(formsObject).length>0){
            log('Gravity Forms Retrieved. Beginning Import');
            let errorOccured =false;
            try{
                this.api.loadSource(actions=>{
                    var collection = actions.addCollection({
                        typeName:'GravityForms'
                    })
                    var forms = Object.keys(formsObject);
                    for(let x=0;x<forms.length;x++){
                        let form = this.processFields(formsObject[forms[x]])
                        collection.addNode({
                            form
                        })
                    }
                })
            }
            catch(err){
                errorOccured = true;
                log(chalk.black.bgRedBright('Error: '+err.message))
            }
            if(errorOccured){
                log(chalk.black.bgRedBright('An Unexpected Error Occured. All Gravity Forms May Not Have Been Retrieved'))
            }
            else{
                log('Gravity Forms '+String(this.options.include)+' Imported');
            }
        }
        else{
            log(chalk.black.bgRedBright('No Gravity Forms Retrieved'))
        }
    }

    processFields(form){
        let keys = Object.keys(form);
        keys.forEach(key=>{
            if(this.options.ignoreFields.includes(key)){
                delete form[key]
            }
        })
        return form
    }
}
module.exports = GravityFormsSource;
