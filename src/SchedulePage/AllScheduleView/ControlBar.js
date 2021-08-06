import React, { useState } from 'react'
import { DateTime } from 'luxon'
import LessonColorToolTip from './LessonColorTooltip'
import PT from 'prop-types'
import { Button, Checkbox, FormControlLabel } from '@material-ui/core'
import { DatePicker } from '@material-ui/pickers'

function ControlBar({ updateFilter, viewDate, setViewDate, filter }) {


    return <div className="row-gravity-between">

        <div className='className="row-gravity-center"'>

            <FormControlLabel control={<Checkbox checked={filter?.show_individual_lesson ?? false} onChange={d => {


                const new_filter = { ...filter, show_individual_lesson: d.target.checked }

                updateFilter?.(new_filter)

            }} />} label='개별레슨' />
            <FormControlLabel control={<Checkbox checked={filter?.show_semi_lesson ?? false} onChange={d => {
                const new_filter = { ...filter, show_semi_lesson: d.target.checked }

                updateFilter?.(new_filter)

            }} />} label='세미레슨' />
            <FormControlLabel control={<Checkbox checked={filter?.show_group_lesson ?? false} onChange={d => {
                const new_filter = { ...filter, show_group_lesson: d.target.checked }

                updateFilter?.(new_filter)

            }} />} label='그룹레슨' />

        </div>
        <div className="row-gravity-center">
            <Button variant='outlined' onClick={e => {
                const new_date = DateTime.fromJSDate(viewDate).minus({ days: 7 })


                setViewDate(new_date.toJSDate())
                // this.calendar.calendarInst.prev()
                // // update current view date
                // let new_date = new Date(this.state.view_date)
                // new_date.setDate(this.state.view_date.getDate() - 7)
                // this.setState({
                //     view_date: new_date,
                //     data: null
                // }, () => {
                //     this.fetchdata()
                // })

            }}>이전 주</Button>

            <DatePicker
                style={{
                    margin: '1rem'
                }}
                autoOk
                variant='inline'
                format='yy.MM.dd'
                showTodayButton
                value={viewDate}
                onChange={(d) => {
                    setViewDate(d)
                    // this.calendar.calendarInst.setDate(d)
                    // this.setState({
                    //     view_date: d,
                    //     show_date_picker: false,
                    //     data: null
                    // }, () => {
                    //     this.fetchdata()
                    // })
                }}

            />
            <Button variant='outlined' onClick={e => {
                const new_date = DateTime.fromJSDate(viewDate).plus({ days: 7 })


                setViewDate(new_date.toJSDate())
                // this.calendar.calendarInst.next()
                // // update current view date
                // let new_date = new Date(this.state.view_date)
                // new_date.setDate(this.state.view_date.getDate() + 7)
                // this.setState({
                //     view_date: new_date,
                //     data: null
                // }, () => {
                //     this.fetchdata()
                // })
            }}>다음 주</Button>
        </div>

        <div>
            <LessonColorToolTip />
        </div>






    </div>
}

ControlBar.propTypes = {
    updateFilter: PT.func,
    viewDate: PT.instanceOf(Date),
    setViewDate: PT.func,
    filter: PT.object
}


export default ControlBar