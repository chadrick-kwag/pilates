export const ACTIVITY_TYPES = ['PILATES', 'GYROTONIC', 'GYROKINESIS', 'BALLET']

export const GROUPING_TYPES = ['INDIVIDUAL', 'SEMI', 'GROUP']


export const activity_type_to_kor_str = a=>{
    if(a == null){
        return '-'
    }

    if(a.toUpperCase() === 'PILATES') return '필라테스'
    if(a.toUpperCase() === 'GYROTONIC') return '자이로토닉'
    if(a.toUpperCase() === 'GYROKINESIS') return '자이로키네시스'
    if(a.toUpperCase() === 'BALLET') return '발레'

    return 'invalid'
}

export const grouping_type_to_kor_str = a=>{
    if(a == null){
        return '-'
    }

    if(a.toLowerCase() === 'individual') return '개별'
    if(a.toLowerCase() === 'semi') return '세미'
    if(a.toLowerCase() === 'group') return '그룹'

    return 'invalid'
}


export const lesson_type_to_kor_str = a=>{
    if(a == null) return '-'
    if(a.toLowerCase() === 'normal_lesson') return '일반수업'
    if(a.toLowerCase() === 'apprentice_lesson') return '견습강사 주도수업'
    if(a.toLowerCase() === 'master_class') return '지도자과정 수업'

    return 'invalid'
}