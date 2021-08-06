import React, { useState, useEffect, useRef } from 'react'

import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';

// If you use the default popups, use this.
import 'tui-date-picker/dist/tui-date-picker.css';



import {
    QUERY_LESSON_WITH_DATERANGE_GQL
} from '../../common/gql_defs'


import { get_week_range_of_date } from '../../common/date_fns'

import NormalLessonDetailModal from '../NormalLessonDetail/main'

import client from '../../apolloclient'
import { get_bg_fontcolor_for_activity_type, get_border_color_for_grouping_type, get_bg_fontcolor_for_grouping_type, get_border_color_for_activity_type } from '../common'

import PartialOverlaySpinner from '../PartialOverlaySpinner'


import ApprenticeLessonDetailModal from '../ApprenticeLessonDetailModal/main'


import SpecialSchedulDetailModal from '../SpecialScheduleDetailModal/container'

import { useLazyQuery } from '@apollo/client';
import ControlBar from './ControlBar'



const split_time_range_by_day = (s, e) => {
    let split_day_arr = []

    let split_start = new Date(s)
    split_start.setHours(24)
    split_start.setMinutes(0)
    split_start.setSeconds(0)
    split_start.setMilliseconds(0)



    while (true) {

        if (split_start >= e) {
            break;
        }

        if (split_start < e) {
            const a = new Date(split_start)
            split_day_arr.push(a)

            const newd = new Date()
            newd.setTime(split_start.getTime() + 24 * 60 * 60 * 1000)
            split_start = newd

        }
    }

    let arr = [s]
    arr = arr.concat(split_day_arr)
    arr = arr.concat([e])

    console.log('arr')
    console.log(arr)

    let split_range_arr = []
    for (let i = 0; i < arr.length - 1; i++) {

        split_range_arr.push([arr[i], arr[i + 1]])

    }



    return split_range_arr
}


const format_schedules = (_schedules, filter) => {

    console.log('_schedules')
    console.log(_schedules)

    const schedules = _schedules ?? []


    console.log('schedules')
    console.log(schedules)
    let schedule_formatted_data = []


    schedules.forEach((d, i) => {

        // check grouping type and visibility
        let grouping_type = d.grouping_type

        console.log('grouping_type')
        console.log(grouping_type)

        if (grouping_type === 'INDIVIDUAL' && !filter.show_individual_lesson) {
            return
        }

        if (grouping_type === 'SEMI' && !filter.show_semi_lesson) {
            return
        }

        if (grouping_type === 'GROUP' && !filter.show_group_lesson) {
            return
        }

        let starttime = d.starttime
        let endtime = d.endtime


        starttime = new Date(parseInt(starttime))
        endtime = new Date(parseInt(endtime))


        if (d.lesson_domain === 'apprentice_lesson') {
            let title = d.instructorname + ' 강사님'
            let bgcolor = 'black'
            let fontcolor = 'white'

            schedule_formatted_data.push({
                id: parseInt(i),
                calendarId: '0',
                title: title,
                category: 'time',
                dueDateClass: '',
                start: starttime,
                end: endtime,
                bgColor: bgcolor,
                color: fontcolor,
                raw: {
                    lesson_domain: d.lesson_domain,
                    indomain_id: d.indomain_id
                }
            })

        }
        else if (d.lesson_domain === 'normal_lesson') {

            let clients_str = ""
            // get unique client names from client info arr
            const unique_client_names = []
            const unique_client_ids = []


            for (let i = 0; i < d.client_info_arr.length; i++) {
                const c = d.client_info_arr[i]
                if (!unique_client_ids.includes(c.clientid)) {
                    unique_client_names.push(c.clientname)
                    unique_client_ids.push(c.clientid)
                }
            }


            // d.client_info_arr.forEach(a => clients_str += a.clientname + ' ')

            for (let i = 0; i < unique_client_names.length; i++) {
                clients_str += unique_client_names[i] + ' '
            }


            let title = clients_str + "회원님 / " + d.instructorname + " 강사님"

            let [bgcolor, fontcolor] = get_bg_fontcolor_for_grouping_type(d.grouping_type)

            schedule_formatted_data.push({
                id: parseInt(i),
                calendarId: '0',
                title: title,
                category: 'time',
                dueDateClass: '',
                start: starttime,
                end: endtime,
                bgColor: bgcolor,
                color: fontcolor,
                borderColor: get_border_color_for_activity_type(d.activity_type),
                raw: {
                    lesson_domain: d.lesson_domain,
                    indomain_id: d.indomain_id
                }
            })
        }
        else if (d.lesson_domain === 'special_schedule') {

            console.log(d)

            let split_range_arr = split_time_range_by_day(starttime, endtime)

            console.log('split_range_arr')
            console.log(split_range_arr)

            for (let j = 0; j < split_range_arr.length; j++) {

                const st = split_range_arr[j][0]
                const et = split_range_arr[j][1]

                schedule_formatted_data.push({
                    id: parseInt(i),
                    calendarId: '0',
                    title: d.title,
                    category: 'time',
                    dueDateClass: '',
                    start: st,
                    end: et,
                    bgColor: 'red',
                    color: 'black',
                    borderColor: 'red',
                    raw: {
                        lesson_domain: d.lesson_domain,
                        indomain_id: d.indomain_id
                    }
                })
            }


        }



    })

    console.log('output schedule_formatted_data')
    console.log(schedule_formatted_data)

    return schedule_formatted_data

}


function ScheduleViewer({ props }) {


    const [scheduleData, SetScheduleData] = useState(null)
    const [viewDate, setViewDate] = useState(() => {
        const a = new Date()
        return a
    })
    const [lessonDetailModal, setLessonDetailModal] = useState(null)
    const [filter, setFilter] = useState({
        show_individual_lesson: true,
        show_semi_lesson: true,
        show_group_lesson: true
    })

    const calendarRef = useRef(null)


    const [fetchSchedules, { loading, data }] = useLazyQuery(QUERY_LESSON_WITH_DATERANGE_GQL, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log('fetched schedules')
            console.log(d)
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('스케쥴 조회 에러')
        }
    })



    const fetchdata = () => {

        // determine search date range based on view_date

        let [start_time, end_time] = get_week_range_of_date(viewDate)

        fetchSchedules({
            variables: {
                start_time: start_time.toUTCString(),
                end_time: end_time.toUTCString()
            }
        })
    }

    useEffect(() => {
        fetchdata()
    }, [])


    const handle_schedule_click = (e) => {

        const lesson_domain = e?.schedule?.raw?.lesson_domain
        const indomain_id = e?.schedule?.raw?.indomain_id

        if (lesson_domain === "normal_lesson") {
            setLessonDetailModal(<NormalLessonDetailModal indomain_id={indomain_id} onClose={() => setLessonDetailModal(null)} onCloseAndRefresh={() => {
                setLessonDetailModal(null)
                fetchdata()
            }} />)
        }

        if (lesson_domain === 'apprentice_lesson') {
            setLessonDetailModal(<ApprenticeLessonDetailModal lessonid={indomain_id} onCancel={() => setLessonDetailModal(null)} onCloseAndRefresh={() => {
                setLessonDetailModal(null)
                fetchdata()
            }} 
            
            
            />)
        }


    }

    return <div>

        <div>

            <ControlBar updateFilter={f => setFilter(f)} viewDate={viewDate} setViewDate={d => {

                setViewDate(d)
                console.log('calendarref')
                console.log(calendarRef)
                calendarRef?.current?.calendarInst?.setDate(d)

            }}
                filter={filter}

            />

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

                <PartialOverlaySpinner hide={loading ? true : false} style={{ flexGrow: '1' }} >
                    <Calendar

                        ref={calendarRef}
                        // height="80%"
                        calendars={[
                            {
                                id: '0',
                                name: 'Private',
                                color: 'white',
                                bgColor: '#4275ff',
                                borderColor: '#9e5fff'
                            }

                        ]}
                        useCreationPopup={false}
                        useDetailPopup={false}
                        disableDblClick={true}
                        disableClick={false}
                        isReadOnly={false}


                        month={{
                            startDayOfWeek: 0,
                            daynames: ['일', '월', '화', '수', '목', '금', '토']
                        }}
                        schedules={(() => {
                            console.log('trigger')
                            console.log(data)
                            return format_schedules(data?.query_lessons_with_daterange?.lessons, filter)
                        })()}
                        taskView={false}
                        scheduleView={['time']}

                        template={{
                            milestone(schedule) {
                                return `<span style="color:#fff;background-color: ${schedule.bgColor};">${schedule.title
                                    }</span>`;
                            },
                            milestoneTitle() {
                                return 'Milestone';
                            },
                            allday(schedule) {
                                return `${schedule.title}<i class="fa fa-refresh"></i>`;
                            },
                            alldayTitle() {
                                return 'All Day';
                            }
                        }}

                        timezones={[
                            {
                                timezoneOffset: +540,
                                displayLabel: 'GMT+09:00',
                                tooltip: 'Seoul'
                            }

                        ]}

                        // view={selectedView} // You can also set the `defaultView` option.
                        week={{
                            showTimezoneCollapseButton: false,
                            timezonesCollapsed: true,
                            hourStart: 7,
                            hourEnd: 23
                        }}


                        onClickSchedule={e => {
                            console.log(e)
                            handle_schedule_click(e)

                        }}

                    />
                </PartialOverlaySpinner>
            </div>
        </div>
        {lessonDetailModal}

    </div>



}


export default ScheduleViewer