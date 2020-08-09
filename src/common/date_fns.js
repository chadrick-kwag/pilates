


export function get_week_range_of_date(date) {
    let lower_sun, higher_sat

    let time_nullified_date = new Date(date)
    time_nullified_date.setHours(0)
    time_nullified_date.setMinutes(0)
    time_nullified_date.setSeconds(0)
    time_nullified_date.setMilliseconds(0)

    for (let i = 0; i < 7; i++) {

        let temp = new Date(time_nullified_date).setDate(time_nullified_date.getDate() - i)
        let higher_temp = new Date(time_nullified_date).setDate(time_nullified_date.getDate() + i)


        temp = new Date(temp)
        higher_temp = new Date(higher_temp)

        if (temp.getDay() == 0) {
            lower_sun = temp
        }

        if (higher_temp.getDay() == 6) {
            higher_sat = higher_temp
        }
    }

    // for higher sat, turn it into next week sunday
    let new_higher_sat = new Date(higher_sat)
    new_higher_sat.setDate(higher_sat.getDate() + 1)
    new_higher_sat = new Date(new_higher_sat)

    return [lower_sun, new_higher_sat]

}


