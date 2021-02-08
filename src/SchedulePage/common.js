export function get_bg_fontcolor_for_activity_type(activity_type){

    let bgcolor = '#4287f5'
    let fontcolor = 'white'
    switch(activity_type){
        case "PILATES":
            bgcolor = '#4287f5'
            fontcolor = 'white'
            break
        case 'GYROTONIC':
            bgcolor = '#d8e310'
            fontcolor = 'black'
            break
        case 'BALLET':
            bgcolor = '#d6890d'
            fontcolor = 'black'
            break
            
    }

    return [bgcolor, fontcolor]
}