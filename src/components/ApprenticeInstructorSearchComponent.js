import React, { useState, useRef } from 'react'

import { TextField, Button } from '@material-ui/core'
import client from '../apolloclient'
import { QUERY_APPRENTICE_INSTRUCTOR_BY_NAME } from '../common/gql_defs'



export default function ApprenticeInstructorSearchComponent(props) {


    const [name, setName] = useState(null)
    const [searchResult, setSearchResult] = useState([])
    const [showResult, setShowResult] = useState(false)


    const searchTextField = useRef(null)


    const try_search = () => {
        // check name
        if (name === null || name.trim() === '') {
            return;
        }

        client.query({
            query: QUERY_APPRENTICE_INSTRUCTOR_BY_NAME,
            variables: {
                name: name
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.query_apprentice_instructor_by_name.success) {
                setSearchResult(res.data.query_apprentice_instructor_by_name.apprenticeInstructors)
                setShowResult(true)

            }
            else {
                alert(`query apprentice instructors failed. msg: ${res.data.query_apprentice_instructor_by_name.msg}`)
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('query apprentice instructors error')
        })



    }

    return (
        <div className="row-gravity-left">
            <span>이름</span>
            <div style={{ position: 'relative' }}>
                <TextField ref={searchTextField} value={name} onChange={e => setName(e.target.value)}></TextField>

                {showResult ? <div style={{ position: 'absolute', zIndex: '9000', top: searchTextField.current.height, left: '0px', backgroundColor: 'white' }}>
                    {searchResult?.map(d => <div className='search-result' style={{ width: searchTextField.current.width }} onClick={e => {
                        setShowResult(false)
                        props.onSelect?.(d)
                    }}>{d.name}({d.phonenumber})</div>)}
                </div> : null}
            </div>

            <Button variant='outlined' onClick={e => try_search()}>검색</Button>

        </div>

    )

}