import React, { useState, useRef } from 'react'
import { DateTime } from 'luxon'
import { useQuery } from '@apollo/client'
import client from '../apolloclient'
import { CircularProgress } from '@material-ui/core'

import { QUERY_LESSON_WITH_DATERANGE_GQL } from '../common/gql'


const get_sequence_schedules = (schedules) => {


    const sorted_schedules = schedules.sort((a, b) => {
        return a.end < b.end
    })

    let end = null

    const selected_schedules = []
    const unselected_schedules = []

    for (let i = 0; i < sorted_schedules.length; i++) {
        const curr = sorted_schedules[i]
        if (end === null) {
            selected_schedules.push(curr)
            end = curr.end
        }
        else {
            if (curr.start >= end) {
                selected_schedules.push(curr)

            }
            else {
                unselected_schedules.push(curr)
            }
        }
    }

    return [selected_schedules, unselected_schedules]


}


const process_schedules = (schedules) => {

    if (!schedules) {
        return [[], 0]
    }


    // add colindex to schedules
    const processed_schedules = []
    let unprocessed_schedules = schedules
    let col_index = 0
    while (true) {

        if (unprocessed_schedules.length === 0) {
            break
        }

        const [selected_schedules, unselected_schedules] = get_sequence_schedules(unprocessed_schedules)



        for (let i = 0; i < selected_schedules.length; i++) {
            const s = selected_schedules[i]
            s.colindex = col_index
            processed_schedules.push(s)
        }

        col_index++

        unprocessed_schedules = unselected_schedules

    }

    return [processed_schedules, col_index]

}


const get_y_offset = (start_hour, curr_time, per_hour_height) => {
    if (start_hour > curr_time.hour) {
        return 0
    }

    const h_diff = curr_time.hour - start_hour

    const h = (h_diff + curr_time.minute / 60) * per_hour_height

    return h
}

function Container({ onSlotClicked, targetDate }) {

    console.log('scheduler init')

    const _var = {
        start_time: DateTime.fromJSDate(targetDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
        end_time: DateTime.fromJSDate(targetDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).plus({ day: 1 }),
    }



    const [schedules, setSchedules] = useState(null)
    const parentdiv = useRef(null)

    const { loading, error, data } = useQuery(QUERY_LESSON_WITH_DATERANGE_GQL, {
        client: client,
        fetchPolicy: 'no-cache',
        variables: _var,
        onCompleted: d => {
            console.log(d)
            if (d.query_lessons_with_daterange.success) {

                let pd = d.query_lessons_with_daterange.lessons.map(a => {
                    a.start = DateTime.fromMillis(parseInt(a.starttime)).setZone('utc+9')
                    a.end = DateTime.fromMillis(parseInt(a.endtime)).setZone('utc+9')

                    return a

                })

                setSchedules(pd)

            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    });

    const start_hour = 8
    const end_hour = 22

    const slot_width = 100; // per column
    const slot_height = 100; // per hour


    const legend_width = 50;
    const top_padding = 20;


    const [processed_schedules, colsize] = process_schedules(schedules)

    const get_time_grid_lines = () => {

        let output = []

        for (let i = start_hour; i <= end_hour; i++) {
            const line = <div style={{
                width: (() => {
                    if (parentdiv.current === null) {
                        return "0px"
                    }

                    const parent_width = parentdiv.current.offsetWidth
                    const reduced_width = parent_width - legend_width
                    return Math.max(slot_width * colsize, reduced_width) + 'px'

                })(),
                height: '2px',
                backgroundColor: 'gray',
                position: 'absolute',
                top: (i - start_hour) * slot_height + top_padding + 'px',
                left: legend_width + 'px',
                transform: "translateY(-50%)"

            }}></div>

            output.push(line)

            // add legend

            const legend = <div style={{
                color: 'gray',
                position: 'absolute',
                top: (i - start_hour) * slot_height + top_padding + 'px',
                transform: "translateY(-50%)"
            }}>{i}:00</div>

            output.push(legend)
        }

        return output

    }


    const get_timeslots = () => {
        const output = []


        for (let i = 0; i < processed_schedules.length; i++) {
            const s = processed_schedules[i]

            const start_h = get_y_offset(start_hour, s.start, slot_height)
            const end_h = get_y_offset(start_hour, s.end, slot_height)


            if (end_h <= start_h) {
                continue
            }

            const curr_slot_height = end_h - start_h

            const slot = <div
                style={{
                    position: 'absolute',
                    height: curr_slot_height + 'px',
                    width: slot_width + 'px',
                    top: start_h + top_padding + 'px',
                    left: legend_width + (s.colindex * slot_width) + 'px',

                }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row'
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexGrow: 1,
                        flexDirection: 'column',
                        padding: '3px',
                        boxSizing: 'border-box'
                    }}>
                        <div className='schedule-slot' style={{ flexGrow: 1, borderRadius: '0.5rem' }} onClick={() => onSlotClicked(s)}>
                            <span>{(() => {
                                let outstring = s.instructorname + ' 강사'
                                let clientstring = ""
                                let name_arr = s.client_info_arr?.map(a => a.clientname)
                                console.log(name_arr)
                                if (name_arr!==undefined) {
                                    clientstring = name_arr.join(', ')
                                }

                                if (clientstring === "") {
                                    return outstring
                                }
                                else {
                                    return outstring + " / " + clientstring
                                }

                            })()}</span>
                        </div>

                    </div>
                </div>


            </div>

            output.push(slot)
        }

        return output
    }


    if (loading) {
        return <div style={{ width: '100%', heigh: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </div>
    }
    else {
        if (error) {
            return <div style={{ width: '100%', heigh: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span>error</span>
            </div>
        }
        else {
            return <div ref={parentdiv} style={{ width: '100%', height: '100%', overflow: 'scroll', position: 'relative', backgroundColor: "white" }}>
                {get_time_grid_lines()}
                {get_timeslots()}
            </div>
        }
    }

}


export default Container