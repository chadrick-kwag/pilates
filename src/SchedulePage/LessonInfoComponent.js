import React from 'react'
import PersonProfileCard from '../components/PersonProfileCard'
import moment from 'moment'
import { activity_type_to_kor, person_type_to_kor, grouping_type_to_kor } from '../common/consts'

export default function LessonInfoComponent(props) {

    const people_sort_func = (a, b) => {
        // 강사/회원에 따라 정렬

        if (a.type === b.type) {
            return 0
        }
        if (a.type === 'client' && b.type === 'instructor') {
            return -1
        }
        if (a.type === 'instructor' && b.type === 'client') {
            return 1
        }

        return 0

    }

    let datetimestr

    let moment_date = moment(new Date(parseInt(props.start_time)))
    let end_moment = moment(new Date(parseInt(props.end_time)))


    datetimestr = moment_date.format("MM월 DD일 hh:mm A - ")
    let endstr = end_moment.format("hh:mm A")

    datetimestr = datetimestr + endstr



    return <div>
        <div className='row-gravity-center'>
            {props.people.sort(people_sort_func).map(d => {
                return <PersonProfileCard variant={d.type === 'client' ? 'light' : 'dark'}
                    type={person_type_to_kor[d.type.toLowerCase()]}
                    name={d.name}
                    phonenumber={d.phonenumber}
                    style={{
                        margin: '10px'
                    }}
                />
            })}


        </div>
        <div className='col-gravity-center'>
            <span style={{ fontSize: '1.5rem' }}>{datetimestr}</span>
            <span style={{ fontSize: '1.5rem' }}>{activity_type_to_kor[props.activity_type]}/{grouping_type_to_kor[props.grouping_type]} 수업</span>
        </div>

    </div>
}