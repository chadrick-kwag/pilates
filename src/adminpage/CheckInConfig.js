import React, { useState, useEffect } from 'react'
import { CircularProgress, Table, TableRow, TableCell } from '@material-ui/core'
import { useLazyQuery } from '@apollo/client'
import { FETCH_CHECKIN_CONFIGS } from '../common/gql_defs'
import client from '../apolloclient'


const stringify_value = (value)=>{
    if(value===null){
        return null
    }

    return value.toString()
}


function CheckInConfig() {

    const [config, setConfig] = useState(null)
    const [error, setError] = useState(null)
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

    useEffect(() => {
        fetchData()
    }, [])

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
                                    <TableCell>
                                        {key}
                                    </TableCell>
                                    <TableCell>
                                        {stringify_value(value)}
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