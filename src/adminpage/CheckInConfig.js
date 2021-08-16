import React, { useState, useEffect } from 'react'
import { CircularProgress, Table, TableRow, TableCell, TextField } from '@material-ui/core'
import { useLazyQuery, useMutation } from '@apollo/client'
import { FETCH_CHECKIN_CONFIGS, UPDATE_CHECKIN_CONFIGS } from '../common/gql_defs'
import client from '../apolloclient'
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';

const stringify_value = (value) => {
    if (value === null) {
        return null
    }

    return value.toString()
}





function CheckInConfig() {

    const [config, setConfig] = useState(null)
    const [error, setError] = useState(null)
    const [editKey, setEditKey] = useState(null)
    const [editValue, setEditValue] = useState(null)
    const [fetchData, { loading }] = useLazyQuery(FETCH_CHECKIN_CONFIGS, {
        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d.fetch_checkin_configs.success) {
                setError(null)
                setConfig(d.fetch_checkin_configs.config)
            }
            else {
                setError('데이터 조회 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            setError('데이터 조회 에러')
        }
    })


    const [updateConfig, { _loading }] = useMutation(UPDATE_CHECKIN_CONFIGS, {

        client: client,
        fetchPolicy: 'no-cache',
        onCompleted: d=>{
            console.log(d)
            if(d.update_checkin_configs.success){
                setEditKey(null)
                fetchData()
            }
            else{
                alert('업데이트 실패')
            }
        },
        onError: e=>{
            console.log(JSON.stringify(e))
            alert('업데이트 에러')
        }

    })

    useEffect(() => {
        fetchData()
    }, [])

    const process_edit_value = (key, value, _editvalue) => {
        const new_config = config

        try {

            if (value === null) {

                config[key] = _editvalue
            }
            else {
                config[key] = value.constructor(_editvalue)
            }
        }
        catch (e) {
            console.log(e)
            return
        }

        // update new config
        updateConfig({
            variables: {
                newconfig: JSON.stringify(new_config)
            }
        })

    }

    if (loading) {

        return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </div>
    }
    else {

        if (error !== null) {
            return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span>{error}</span>
            </div>
        }
        else {

            if (config === null) {
                return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span>데이터 없음</span>
                </div>
            }
            else {

                return <div style={{ width: '100%', height: '100%' }}>
                    <Table>
                        {(() => {
                            let ret = []
                            for (const [key, value] of Object.entries(config)) {
                                if (key === '__typename') {
                                    continue
                                }
                                ret.push(<TableRow>
                                    <TableCell width='25%'>
                                        {key}
                                    </TableCell>
                                    <TableCell width='75%'>
                                        {key === editKey ? <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                            <TextField variant='outlined' value={editValue} onChange={a => setEditValue(a.target.value)} /><DoneIcon style={{marginLeft: '0.5rem'}} onClick={() => {
                                                process_edit_value(key, value, editValue)
                                                
                                            }} /></div> : <div>
                                            <span>{stringify_value(value)}</span>
                                            <EditIcon style={{marginLeft: '0.5rem'}} onClick={() => {
                                                setEditValue(value)
                                                setEditKey(key)
                                            }} />
                                        </div>}

                                    </TableCell>
                                </TableRow>)
                            }

                            return ret
                        })()}
                    </Table>
                </div>
            }

        }
    }
}


export default CheckInConfig