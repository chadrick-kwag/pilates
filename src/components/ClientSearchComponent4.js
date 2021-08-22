// one line, material ui client select component
// supports selected start mode

import React, { useState, useRef } from 'react'
import { TextField, Button, Chip, MenuItem, Popover, CircularProgress } from '@material-ui/core'
import client from '../apolloclient'
import { QUERY_CLIENTS_BY_NAME } from '../common/gql_defs'
import PT from 'prop-types'

function ClientSearchComponent(props) {

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
            query: QUERY_CLIENTS_BY_NAME,
            variables: {
                name: searchName
            },
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.query_clients_by_name.success) {
                const data = res.data.query_clients_by_name.clients.filter(x => x.disabled === false).map(a => {
                    return {
                        id: a.id,
                        clientname: a.name,
                        clientphonenumber: a.phonenumber
                    }
                })
                console.log(data)
                setSearchIsLoading(false)

                if (data.length === 1) {
                    setSelectedClient(data[0])
                    props.onClientSelected?.(data[0])
                    setViewMode('selected')
                }
                else {
                    setSearchResult(data)
                }
            }
            else {
                setSearchIsLoading(false)
                alert('조회 실패')
            }


        }).catch(e => {
            console.log(JSON.stringify(e))
            setSearchIsLoading(false)

        })
    }

    const button_click_handler = () => {
        request_search()
        setAnchorEl(textinput.current)
    }

    if (viewMode === 'search') {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ wordBreak: 'keep-all' }}>이름</span>
                <TextField autoFocus ref={textinput} value={searchName}
                    style={{ width: '10rem' }}
                    onChange={e => setSearchName(e.target.value)} onKeyDown={e => {
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
                    {searchIsLoading ? <CircularProgress /> : searchResult?.length > 0 ? searchResult?.map(a => <MenuItem onClick={() => {
                        setSelectedClient(a)
                        setViewMode('selected')
                        props.onClientSelected?.(a)
                    }}>{a.clientname}({a.clientphonenumber})</MenuItem>) : <MenuItem>검색결과 없음</MenuItem>}

                </Popover>

                <Button variant='outlined' disabled={searchName === null || searchName === "" ? true : false} onClick={e => button_click_handler()}>검색</Button>
                {selectedClient !== null ? <Button variant='outlined' onClick={() => {
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
            <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                <Chip label={`${selectedClient.clientname}(${selectedClient.clientphonenumber})`} />
                <Button
                    variant='outlined'
                    onClick={() => {
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

ClientSearchComponent.propTypes = {
    client: PT.object,
    onClientSelected: PT.func
}


export default ClientSearchComponent