import React, { useState, useEffect } from 'react'

import { Dialog, DialogContent, DialogActions, CircularProgress } from '@material-ui/core'
import ReadOnlyView from './ReadOnlyView'
import EditView from './EditView'
import client from '../../apolloclient'
import { FETCH_SPECIAL_SCHEDULE_BY_ID, DELETE_SPECIAL_SCHEDULE_BY_ID } from '../../common/gql_defs'

export default function Container(props) {

    const [mode, setMode] = useState('readonly')

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)


    const fetch_data = () => {

        setLoading(true)

        const _var = {
            id: props.id
        }

        client.query({
            query: FETCH_SPECIAL_SCHEDULE_BY_ID,
            variables: _var,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.fetch_special_schedule_by_id.success) {
                setData(res.data.fetch_special_schedule_by_id.schedule)
            }
            else {
                alert(`스케쥴 가져오기 실패 (${res.data.fetch_special_schedule_by_id.msg})`)
            }

            setLoading(false)

        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('스케쥴 가져오기 에러')
            setLoading(false)
        })
    }

    const request_delete = () => {
        let resp = confirm('삭제하시겠습니까?')

        if (resp) {
            client.mutate({
                mutation: DELETE_SPECIAL_SCHEDULE_BY_ID,
                variables: {
                    id: props.id
                },
                fetchPolicy: 'no-cache'
            }).then(res => {
                console.log(res)

                if (res.data.delete_special_schedule.success) {
                    props.onDelete?.()
                }
                else {
                    alert(`스케쥴 삭제 실패(${res.data.delete_special_schedule.msg})`)
                }
            }).catch(e => {
                console.log(JSON.stringify(e))
                alert('스케쥴 삭제 에러')
            })
        }
    }


    useEffect(() => {
        fetch_data()
    }, [])


    return (
        <Dialog open={true} onClose={() => props.onClose?.()}>

            {(() => {
                if (loading) {
                    return <DialogContent>
                        <CircularProgress />
                    </DialogContent>
                }
                else {
                    if (data === null) {
                        return <DialogContent>
                            <span>error</span>
                        </DialogContent>
                    }
                    else {
                        if (mode === 'readonly') {

                            return <ReadOnlyView data={data} onCancel={() => props.onClose?.()} onEdit={() => setMode('edit')} onDelete={() => {
                                request_delete()
                            }} />
                        }
                        else if (mode === 'edit') {
                            return <EditView initData={(() => {
                                const _d = { ...data }
                                _d.starttime = new Date(parseInt(_d.starttime))
                                _d.endtime = new Date(parseInt(_d.endtime))

                                return _d
                            })()} onCancel={() => props.onClose?.()}
                                onSuccess={() => {
                                    fetch_data()
                                    setMode('readonly')
                                    props.onEditOccured?.()

                                }}
                                id={props.id}


                            />
                        }
                    }
                }
            })()}

        </Dialog>
    )
}

