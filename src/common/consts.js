const activity_type_to_kor = {
    'PILATES': '필라테스',
    'BALLET': '발레',
    'GYROTONIC': '자이로토닉',
    "": "!",
    null: "!"
}

const grouping_type_to_kor={
    'INDIVIDUAL': '개별',
    'SEMI': '세미',
    'GROUP': '그룹',
    "": "!",
    null: "!"
}

const person_type_to_kor={
    'client': '회원',
    'instructor': '강사'
}


const INSTRUCTOR_LEVEL_LIST = ['LV1', 'LV2', 'LV3']


export {
    activity_type_to_kor,
    grouping_type_to_kor,
    INSTRUCTOR_LEVEL_LIST,
    person_type_to_kor
}