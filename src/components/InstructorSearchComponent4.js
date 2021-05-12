// one line, material ui client select component
// supports selected start mode

import React, { useState, useRef } from 'react'
import { TextField, Button, Chip, MenuItem, Popover, CircularProgress } from '@material-ui/core'
import client from '../apolloclient'
import { SEARCH_INSTRUCTOR_WITH_NAME } from '../common/gql_defs'

export default function InstructorSearchComponent(props) {

    const [viewMode, setViewMode] = useState((props.instructor !== null && props.instructor !== undefined) ? 'selected' : 'search')

    const [selectedInstructor, setSelectedInstructor] = useState(props.instructor)
    const [searchName, setSearchName] = useState(null)
    const [searchResult, setSearchResult] = useState(null)
    const [searchIsLoading, setSearchIsLoading] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)

    const textinput = useRef(null)



    const request_search = () => {

        setSearchIsLoading(true)
        setSearchResult(null)

        client.query({
            query: SEARCH_INSTRUCTOR_WITH_NAME,
            variables: {
                name: searchName
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            const data = res.data.search_instructor_with_name.filter(x => x.disabled === false).map(a => {
                return {
                    id: a.id,
                    name: a.name,
                    phonenumber: a.phonenumber
                }
            })

            console.log(data)

            setSearchIsLoading(false)
            if (data.length === 1) {
                setSelectedInstructor(data[0])
                props.onInstructorSelected?.(data[0])
                setViewMode('selected')
            }
            else {
                setSearchResult(data)
            }

        }).catch(e => {
            console.log(JSON.stringify(e))
            setSearchIsLoading(false)

        })
    }

    if (viewMode === 'search') {
        return (
            <div>
                <span>이름:</span>
                <TextField ref={textinput} value={searchName} onChange={e => setSearchName(e.target.value)} />
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
                    {searchIsLoading ? <CircularProgress /> : searchResult?.length > 0 ? searchResult?.map(a => <MenuItem onClick={() => {
                        setSelectedInstructor(a)
                        setViewMode('selected')
                        props.onInstructorSelected?.(a)
                    }}>{a.name}({a.phonenumber})</MenuItem>) : <MenuItem>검색결과 없음</MenuItem>}

                </Popover>

                <Button disabled={searchName === null || searchName === "" ? true : false} onClick={e => {
                    request_search()
                    setAnchorEl(textinput.current)
                }}>검색</Button>
                {selectedInstructor !== null ? <Button onClick={() => {
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
                <Button onClick={() => {
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

