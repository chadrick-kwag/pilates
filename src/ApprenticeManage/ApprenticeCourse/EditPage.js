import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import client from '../../apolloclient'
import { UPDATE_APPRENTICE_COURSE, FETCH_APPRENTICE_COURSE_INFO } from '../../common/gql_defs'
import { TextField, CircularProgress, Table, TableRow, TableCell, Button } from '@material-ui/core'

function EditPage({ history, match }) {

    const courseid = parseInt(match.params.id)


    const [name, setname] = useState("");

    const { loading, data, error } = useQuery(FETCH_APPRENTICE_COURSE_INFO, {
        client,
        fetchPolicy: 'no-cache',
        variables: {
            id: courseid
        },
        onCompleted: d => {
            console.log(d)

            const _d = d.fetch_apprentice_course_info.course

            setname(_d.name)
        },
        onError: e => {
            console.log(JSON.stringify(e))
        }
    })


    const [updateInfo, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_APPRENTICE_COURSE, {
        client,
        fetchPolicy: 'no-cache',
        onCompleted: d => {
            console.log(d)
            if (d?.update_apprentice_course?.success) {
                history.push('/apprenticecourse')
            }
            else {
                alert('수정 실패')
            }
        },
        onError: e => {
            console.log(JSON.stringify(e))
            alert('수정 에러')
        }
    })

    if (loading) {
        return <div className="fwh justify-center align-center">
            <CircularProgress />
        </div>

    }

    if (error || data?.fetch_apprentice_course_info?.success === false) {
        return <div className="fwh justify-center align-center">
            <span>에러</span>
        </div>
    }

    return <div className="fwh flexcol">
        <Table>
            <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>
                    <TextField value={name} onChange={e => setname(e.target.value)} />
                </TableCell>
            </TableRow>
        </Table>
        <div className="flexrow justify-center align-center" style={{ gap: '0.5rem' }}>
            <Button onClick={() => history.goBack()}>취소</Button>
            <Button disabled={(() => {
                if (name.trim() === "") return true
                return false
            })()} onClick={() => {
                updateInfo({
                    variables: {
                        id: courseid,
                        name: name
                    }
                })
            }}>완료</Button>

        </div>
    </div>

}


export default withRouter(EditPage)