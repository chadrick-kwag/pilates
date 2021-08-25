
export const PILATES_BGCOLOR = '#4287f5'
export const GYROTONIC_BGCOLOR = '#d8e310'
export const BALLET_BGCOLOR = '#d6890d'
export const GYROKINESIS_BGCOLOR = '#32a852'


export const INDIVIDUAL_BGCOLOR = '#4287f5'
export const SEMI_BGCOLOR = '#d8e310'
export const GROUP_BGCOLOR = '#d6890d'


export function get_bg_fontcolor_for_grouping_type(grouping_type){
    
    let bgcolor = INDIVIDUAL_BGCOLOR
    let fontcolor = 'white'
    switch(grouping_type){
        case "INDIVIDUAL":
            bgcolor = INDIVIDUAL_BGCOLOR
            fontcolor = 'white'
            break
        case 'SEMI':
            bgcolor = SEMI_BGCOLOR
            fontcolor = 'black'
            break
        case 'GROUP':
            bgcolor = GROUP_BGCOLOR
            fontcolor = 'black'
            break
    }

    return [bgcolor, fontcolor]
}

export function get_bg_fontcolor_for_activity_type(activity_type){

    let bgcolor = PILATES_BGCOLOR
    let fontcolor = 'white'
    switch(activity_type){
        case "PILATES":
            bgcolor = PILATES_BGCOLOR
            fontcolor = 'white'
            break
        case 'GYROTONIC':
            bgcolor = GYROTONIC_BGCOLOR
            fontcolor = 'black'
            break
        case 'BALLET':
            bgcolor = BALLET_BGCOLOR
            fontcolor = 'black'
            break
        case 'GYROKINESIS':
            bgcolor = GYROKINESIS_BGCOLOR
            fontcolor = 'white'
            break

            
    }

    return [bgcolor, fontcolor]
}


export const BORDER_INDIVIDUAL = 'black'
export const BORDER_SEMI = 'red'
export const BORDER_GROUP = '#03fc17'


export const BORDER_PILATES = 'black'
export const BORDER_GYROTONIC = 'red'
export const BORDER_BALLET = '#03fc17'
export const BORDER_GYROKINESIS = 'green'

export function get_border_color_for_activity_type(activity_type){
    
    let color = null
    switch(activity_type){
        case 'PILATES':
            color = BORDER_PILATES
            break
        case 'GRYOTONIC':
            color = BORDER_GYROTONIC
            break
        case 'BALLET':
            color = BORDER_BALLET
            break
        case 'GYROKINESIS':
            color = BORDER_GYROKINESIS
            break
    }

    return color
}

export function get_border_color_for_grouping_type(grouping_type){

    let color = null
    switch(grouping_type){
        case 'INDIVIDUAL':
            color = BORDER_INDIVIDUAL
            break
        case 'SEMI':
            color = BORDER_SEMI
            break
        case 'GROUP':
            color = BORDER_GROUP
            break
    }

    return color
}