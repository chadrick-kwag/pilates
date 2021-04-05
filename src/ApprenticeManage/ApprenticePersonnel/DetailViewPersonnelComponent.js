import React, { useState, useEffect } from 'react'

import client from '../../apolloclient'
import { FETCH_APPRENTICE_INSTRUCTOR_BY_ID } from '../../common/gql_defs'

import { Table, TableRow, TableCell, Button, CircularProgress } from '@material-ui/core'
import DetailViewPersonnel from './DetailViewPersonnel'
import EditPersonnel from './EditPersonnel'

export default function DetailViewPersonnelComponent(props) {

    const [personnelId, setPersonnelId] = useState(null)
    const [name, setName] = useState(null)
    const [gender, setGender] = useState(null)
    const [phonenumber, setPhonenumber] = useState(null)
    const [courseName, setCourseName] = useState(null)
    const [courseId, setCourseId] = useState(null)
    const [loading, setLoading] = useState(true)


    const [editMode, setEditMode] = useState(false)

    const fetch_data = () => {
        // fetch data
        client.query({
            query: FETCH_APPRENTICE_INSTRUCTOR_BY_ID,
            variables: {
                id: props.id
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.fetch_apprentice_instructor_by_id.success) {
                console.log('success')

                let d = res.data.fetch_apprentice_instructor_by_id.apprenticeInstructors[0]

                setName(d.name)
                setGender(d.gender)
                setPhonenumber(d.phonenumber)
                setCourseName(d.course_name)
                setCourseId(d.course_id)
                setLoading(false)
            }
            else {
                alert('fetch data fail')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch data error')
        })
    }

    useEffect(() => {
        fetch_data()

    }, [])


    return (
        <div className='col-gravity-center'>
            <h2>견습강사 상세</h2>
            {loading === true ? <CircularProgress /> :

                editMode ? <EditPersonnel
                    id={props.id}
                    data={{
                        name: name,
                        phonenumber: phonenumber,
                        gender: gender,
                        course: {
                            id: courseId,
                            name: courseName
                        }
                    }}
                    onCancel={() => setEditMode(false)}
                    onSuccess={() => {
                        setLoading(true)
                        setEditMode(false)
                        fetch_data()

                    }}
                /> :
                    <DetailViewPersonnel name={name} phonenumber={phonenumber} gender={gender} courseName={courseName} onCancel={() => props.onCancel?.()}
                        onEdit={() => setEditMode(true)}
                    />
            }


        </div>
    )
}