const fs = require('fs')
const path = require('path')
const filepath = path.join(__dirname, '../admin_web_config.yaml')
console.log(filepath)
const yaml  = require('yaml')

const file = fs.readFileSync(filepath, 'utf8')

const setting = yaml.parse(file)
console.log(setting)
const save_setting = ()=>{
    fs.writeFileSync(filepath, yaml.stringify(setting))
}




module.exports = {
    setting,
    save_setting
}