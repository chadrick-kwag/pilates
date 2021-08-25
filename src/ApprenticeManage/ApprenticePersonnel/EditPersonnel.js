import React, { useState, useEffect } from 'react'
import { Table, TableRow, TableBody, TableCell, TextField, Select, Radio, Button, MenuItem, CircularProgress, DialogActions } from '@material-ui/core'


import client from '../../apolloclient'
import { UPDATE_APPRENTICE_INSTRUCTOR, FETCH_APPRENTICE_COURSES } from '../../common/gql_defs'


export default function EditPersonnel(props) {


    const [name, setName] = useState(props.data.name)
    const [phonenumber, setPhoneNumber] = useState(props.data.phonenumber)
    const [gender, setGender] = useState(props.data.gender)
    const [course, setCourse] = useState(props.data.course)
    const [courseList, setCourseList] = useState(null)

    console.log('course')
    console.log(course)

    const check_inputs = () => {
        if (name === null || name.trim() === "") {
            return false
        }

        if (phonenumber === null || phonenumber.trim() === "") {
            return false
        }


        return true
    }



    useEffect(() => {
        client.query({
            query: FETCH_APPRENTICE_COURSES,
            fetchPolicy: 'no-cache'
        }).then(res => {
            if (res.data.fetch_apprentice_courses.success) {
                setCourseList(res.data.fetch_apprentice_courses.courses)
            }
            else {
                alert('fetch courses failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('fetch courses error')
        })
    }, [])

    const submit = () => {
        // check inputs
        if (!check_inputs()) {
            alert('invalid inputs')
            return
        }
        console.log('course')
        console.log(course)


        let _var = {
            id: props.id,
            name: name,
            phonenumber: phonenumber,
            gender: gender,
            course_id: course === null ? null : course.id
        }

        console.log(_var)

        client.mutate({
            mutation: UPDATE_APPRENTICE_INSTRUCTOR,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.update_apprentice_instructor.success) {
                console.log('success')
                props.onSuccess?.()
            }
            else {
                alert(`update instructor fail. msg:${res.data.update_apprentice_instructor.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('error updating instructor')
        })

    }


    console.log('course')
    console.log(course)

    return (
        <div className='col-gravity-center'>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            이름
                        </TableCell>
                        <TableCell>
                            <TextField value={name} onChange={e => setName(e.target.value)}></TextField>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            성별
                        </TableCell>
                        <TableCell>
                            <Radio
                                checked={gender === 'MALE'}
                                onChange={_ => setGender('MALE')}
                            />남자
                            <Radio
                                checked={gender === 'FEMALE'}
                                onChange={_ => setGender('FEMALE')}
                            />여자
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>연락처</TableCell>
                        <TableCell>
                            <TextField value={phonenumber} onChange={e => setPhoneNumber(e.target.value)} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>과정</TableCell>
                        <TableCell>
                            <Select value={course.id} onChange={e => {
                                let c = null

                                for (let i = 0; i < courseList.length; i++) {
                                    if (courseList[i].id === e.target.value) {
                                        c = courseList[i]
                                        break
                                    }
                                }
                                setCourse(c)
                            }}>
                                {courseList === null ? <MenuItem><CircularProgress size={20} /></MenuItem> : courseList.map((d, i) => {
                                    console.log(d)

                                    return <MenuItem value={d.id}>{d.name}</MenuItem>

                                })}
                            </Select>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <DialogActions>
                <Button variant='outlined' color='secondary' onClick={_ => props.onCancel?.()}>취소</Button>
                <Button variant='outlined' onClick={e => submit()}>변경</Button>
            </DialogActions>

        </div>
    )

}