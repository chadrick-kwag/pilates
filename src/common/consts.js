export const activity_type_to_kor = {
    'PILATES': '필라테스',
    'BALLET': '발레',
    'GYROTONIC': '자이로토닉',
    'GYROKINESIS': '자이로키네시스',
    "": "!",
    null: "!"
}


export const gender_to_kor = (a) => {
    if (a === null || a === undefined) {
        return '-'
    }

    if (a.trim().toLowerCase() === 'female') {
        return '여'
    }

    if (a.trim().toLowerCase() === 'male') {
        return '남'
    }

    return '-'
}

export const grouping_type_to_kor = {
    'INDIVIDUAL': '개별',
    'SEMI': '세미',
    'GROUP': '그룹',
    "": "!",
    null: "!"
}


export const person_type_to_kor = {
    'client': '회원',
    'instructor': '강사'
}


export const lesson_domain_type_to_kor = {
    'normal_lesson': '일반 수업',
    'apprentice_lesson': '견습강사 주도수업'
}

export const INSTRUCTOR_LEVEL_LIST = ['LV1', 'LV2', 'LV3']

