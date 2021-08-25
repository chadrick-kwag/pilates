const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

// check if file exists
const filepath = path.join(__dirname, '../admin_web_config.yaml')
let filecontent
try{
    if(!fs.existsSync(filepath)){
        // if not exist, then read from sample file
        const sample_filepath = path.join(__dirname, '../admin_app_config.sample.yaml')
        console.log(`${filepath} not exist. reading from ${sample_filepath}`)
        filecontent = fs.readFileSync(sample_filepath, 'utf8')
    
    }
    else{
        filecontent = fs.readFileSync(filepath, 'utf8')
    }
}catch(e){
    console.log('error while reading from admin web config file. abort')
    console.log(e)
    process.exit(1)
}



const setting = yaml.parse(filecontent)

const save_setting = () => {
    fs.writeFileSync(filepath, yaml.stringify(setting))
}


const update_setting = (new_config, part) => {

    const sub_part = setting[part]

    if(!sub_part){
        return false
    }

    for (const [key, value] of Object.entries(sub_part)) {
        const newvalue = new_config[key]
        if (newvalue) {
            sub_part[key] = newvalue
        }
    }

    setting[part] = sub_part
    save_setting()

    return true
}




module.exports = {
    setting,
    save_setting,
    update_setting
}