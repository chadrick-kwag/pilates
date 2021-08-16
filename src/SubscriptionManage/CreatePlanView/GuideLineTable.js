import React, { useState, useEffect } from 'react'
import { Table, TableRow, TableCell, CircularProgress } from '@material-ui/core'

import PREDEFINED_PLANS from '../PredefinedPlans'
import './GuideLineTable.css'
import numeral from 'numeral'


export default function GuideLineTable(props) {

    console.log(props)

    const [data, setData] = useState(null)

    useEffect(() => {


        // fetch guideline that matches given at_arr and gt
        if (props.activity_type_arr === null) {
            return
        }

        const activity_type_arr = []

        for (let a in props.activity_type_arr) {
            if (props.activity_type_arr[a]) {
                activity_type_arr.push(a)
            }
        }


        if (activity_type_arr.length === 0) {
            return false
        }

        if (props.grouping_type === null) {
            return
        }

        const final_at = activity_type_arr[0]
        const final_gt = props.grouping_type


        const guidelines = PREDEFINED_PLANS[final_at][final_gt]

        setData(guidelines)


    }, [props.activity_type_arr, props.grouping_type])

    if (data === null) {
        return (
            <>
                <CircularProgress />
            </>
        )
    }
    else {

        return (
            <>
                <Table>
                    <TableRow>
                        <TableCell>횟수</TableCell>
                        <TableCell>총가격</TableCell>
                        <TableCell>만료기한</TableCell>
                    </TableRow>
                    {data.map(d => <TableRow className='guideline-row' onClick={() => props.onGuideLineSelected?.(d)}>
                        <TableCell>
                            {d.rounds}
                        </TableCell>
                        <TableCell>
                            {numeral(d.cost).format('0,0')}
                        </TableCell>
                        <TableCell>
                            {d.expire_countdown}
                        </TableCell>
                    </TableRow>)}
                </Table>
            </>
        )
    }

}