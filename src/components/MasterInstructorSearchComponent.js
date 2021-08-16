// one line, material ui client select component
// supports selected start mode

import React, { useState, useRef } from 'react'
import { TextField, Button, Chip, MenuItem, Popover, CircularProgress } from '@material-ui/core'
import client from '../apolloclient'
import { QUERY_INSTRUCTORS_ALLOWED_TO_TEACH_APPRENTICE_WITH_NAME } from '../common/gql_defs'
import { useLazyQuery } from '@apollo/client'

export default function MasterInstructorSearchComponent(props) {

    const [viewMode, setViewMode] = useState((props.instructor !== null && props.instructor !== undefined) ? 'selected' : 'search')

    const [selectedInstructor, setSelectedInstructor] = useState(props.instructor)
    const [searchName, setSearchName] = useState(null)
    const [searchResult, setSearchResult] = useState(null)
    const [searchIsLoading, setSearchIsLoading] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)

    const [fetchInsturctors, { loading, data, error }] = useLazyQuery(QUERY_INSTRUCTORS_ALLOWED_TO_TEACH_APPRENTICE_WITH_NAME, {
        client: client,
        fetchPolicy: 'no-cache'
    })

    const textinput = useRef(null)



    const request_search = () => {

        fetchInsturctors({
            variables: {
                name: searchName
            }
        })

    }

    const button_click_handler = () => {
        request_search()
        setAnchorEl(textinput.current)
    }

    if (viewMode === 'search') {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <span style={{ wordBreak: 'keep-all', paddingRight: '0.5rem' }}>이름:</span>
                <TextField ref={textinput} value={searchName} onChange={e => setSearchName(e.target.value)} onKeyDown={e => {
                    if (e.key === 'Enter') {
                        button_click_handler()
                    }
                }} />
                <Popover
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    open={anchorEl !== null}
                    onClose={() => setAnchorEl(null)}
                >

                    {(() => {
                        if (loading) {
                            return <CircularProgress />
                        }

                        if (error || data?.query_instructors_allowed_to_teach_apprentice_with_name?.success === false) {
                            return <span>error</span>
                        }

                        const instructors = data?.query_instructors_allowed_to_teach_apprentice_with_name.instructors || []

                        if (instructors.length === 0) {
                            return <MenuItem>검색결과 없음</MenuItem>
                        }

                        return instructors.map(a => <MenuItem onClick={() => {
                            setSelectedInstructor(a)
                            setViewMode('selected')
                            props?.onInstructorSelected(a)
                        }}>{a.name}</MenuItem>)
                    })()}


                </Popover>

                <Button
                    style={{ marginLeft: '0.5rem' }}
                    variant='outlined' disabled={searchName === null || searchName === "" ? true : false} onClick={e => button_click_handler()}>검색</Button>
                {selectedInstructor !== null ? <Button style={{ marginLeft: '0.5rem' }} variant='outlined' onClick={() => {
                    setSearchName(null)
                    setViewMode('selected')
                    setSearchResult(null)
                    setSearchIsLoading(false)
                }}>취소</Button> : null}

            </div>
        )
    }
    else if (viewMode === 'selected') {
        return (
            <div>
                <Chip label={`${selectedInstructor.name}(${selectedInstructor.phonenumber})`} />
                <Button style={{ marginLeft: '0.5rem' }} variant='outlined' onClick={() => {
                    setSearchName(null)
                    setSearchResult(null)
                    setSearchIsLoading(false)
                    setViewMode('search')
                    setAnchorEl(null)

                }}>변경</Button>
            </div>
        )
    }
}

