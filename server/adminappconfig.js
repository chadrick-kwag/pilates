const fs = require('fs')
const path = require('path')
const filepath = path.join(__dirname, '../admin_web_config.yaml')
console.log(filepath)
const yaml = require('yaml')

const file = fs.readFileSync(filepath, 'utf8')

const setting = yaml.parse(file)
console.log(setting)
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

    console.log('after update_setting')

    console.log(setting)

    return true
}




module.exports = {
    setting,
    save_setting,
    update_setting
}