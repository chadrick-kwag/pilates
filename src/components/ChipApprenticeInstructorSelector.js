import React, { useState, useRef } from 'react'
import { Chip, TextField, Button, CircularProgress, Popover, MenuItem } from '@material-ui/core'
import CachedIcon from '@material-ui/icons/Cached';

import PT from 'prop-types'


import client from '../apolloclient'
import { QUERY_APPRENTICE_INSTRUCTOR_BY_NAME } from '../common/gql_defs'
import { useLazyQuery } from '@apollo/client'


function ChipApprenticeInstructorSelector({ name, phonenumber, onSelected }) {

    const [mode, setMode] = useState('view')
    const anchor = useRef(null)
    const [showPopover, setShowPopover] = useState(false)

    const [searchName, setSearchName] = useState("")

    const [fetchInstructors, { loading, data: fetchedInstructors, error }] = useLazyQuery(QUERY_APPRENTICE_INSTRUCTOR_BY_NAME, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            setShowPopover(true)
        },
        onError: e => console.log(JSON.stringify(e))
    })

    if (mode === 'view') {
        return <Chip label={<div><span>{`${name}(${phonenumber})`}</span><CachedIcon onClick={() => setMode('edit')} /></div>} />
    }

    if (mode === 'edit') {
        return <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', alignItems: 'center' }}>
            <span>이름</span>
            <TextField ref={anchor} value={searchName} onChange={a => setSearchName(a.target.value)}  style={{maxWidth: '10rem'}}/>
            <Popover open={showPopover && fetchedInstructors?.query_apprentice_instructor_by_name?.success === true} anchorEl={anchor?.current}
                onClose={() => setShowPopover(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {(() => {


                    const inst_info_arr = fetchedInstructors?.query_apprentice_instructor_by_name?.apprenticeInstructors
                    console.log('inst_info_arr')
                    console.log(inst_info_arr)

                    if (inst_info_arr == null) {
                        return null
                    }

                    if (inst_info_arr.length === 0) {
                        return <MenuItem>검색결과 없음</MenuItem>
                    }

                    return inst_info_arr.map(d => <MenuItem onClick={() => {

                        onSelected(d)
                        setMode('view')
                    }}>{`${d.name}(${d.phonenumber})`}</MenuItem>)


                })()}
            </Popover>
            <Button variant='outlined' disabled={searchName.trim() === "" || loading} onClick={() => fetchInstructors({
                variables: {
                    name: searchName
                }
            })}>{loading ? <CircularProgress size="20" /> : '검색'}</Button>
            <Button variant='outlined' onClick={() => setMode('view')}>취소</Button>


        </div>
    }

}


ChipApprenticeInstructorSelector.propTypes = {
    name: PT.string,
    phonenumber: PT.string,
    onSelected: PT.func
}


export default ChipApprenticeInstructorSelector