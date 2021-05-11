// one line, material ui client select component
// supports selected start mode

import React, { useState, useRef } from 'react'
import { TextField, Button, Chip, MenuItem, Popover, CircularProgress } from '@material-ui/core'
import client from '../apolloclient'
import { SEARCH_CLIENT_WITH_NAME } from '../common/gql_defs'

export default function ClientSearchComponent(props) {

    const [viewMode, setViewMode] = useState((props.client !== null && props.client !== undefined) ? 'selected' : 'search')

    const [selectedClient, setSelectedClient] = useState(props.client)
    const [searchName, setSearchName] = useState(null)
    const [searchResult, setSearchResult] = useState(null)
    const [searchIsLoading, setSearchIsLoading] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)

    const textinput = useRef(null)



    const request_search = () => {

        setSearchIsLoading(true)
        setSearchResult(null)

        client.query({
            query: SEARCH_CLIENT_WITH_NAME,
            variables: {
                name: searchName
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            const data = res.data.search_client_with_name.filter(x => x.disabled === false).map(a => {
                return {
                    id: a.id,
                    clientname: a.name,
                    clientphonenumber: a.phonenumber
                }
            })

            setSearchIsLoading(false)
            if (data.length === 1) {
                setSelectedClient(data[0])
                props.onClientSelected?.(data[0])
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
                >
                    {searchIsLoading ? <CircularProgress /> : searchResult?.map(a => <MenuItem onClick={() => {
                        setSelectedClient(a)
                        setViewMode('selected')
                        props.onClientSelected?.(a)
                    }}>{a.clientname}({a.clientphonenumber})</MenuItem>)}

                </Popover>

                <Button disabled={searchName === null || searchName === "" ? true : false} onClick={e => {
                    request_search()
                    setAnchorEl(textinput.current)
                }}>검색</Button>
                {selectedClient !== null ? <Button onClick={() => {
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
                <Chip label={`${selectedClient.clientname}(${selectedClient.clientphonenumber})`} />
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

