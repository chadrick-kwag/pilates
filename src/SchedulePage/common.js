
export const PILATES_BGCOLOR = '#4287f5'
export const GYROTONIC_BGCOLOR = '#d8e310'
export const BALLET_BGCOLOR = '#d6890d'

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
            
    }

    return [bgcolor, fontcolor]
}