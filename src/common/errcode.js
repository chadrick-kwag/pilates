


const ERRCODES={
    INSTRUCTOR_HAS_NO_LEVEL: {
        code: 1,
        msg: 'instructor has no level'
    }
}


function get_msg_of_errcode(errcode){
    for(let i=0;i<ERRCODES.length;i++){
        if(ERRCODES[i].code === errcode){
            return ERRCODES[i].msg
        }
    }
}

module.exports = ERRCODES