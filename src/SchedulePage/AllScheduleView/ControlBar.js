import React, { useState, useRef } from 'react'
import { DateTime } from 'luxon'
import LessonColorToolTip from './LessonColorTooltip'
import PT from 'prop-types'
import { Button, Checkbox, FormControlLabel, Popover, Grid } from '@material-ui/core'
import { DatePicker } from '@material-ui/pickers'
import TuneIcon from '@material-ui/icons/Tune';

function ControlBar({ updateFilter, viewDate, setViewDate, filter }) {

    const filterRef = useRef(null)
    const [showFilter, setShowFilter] = useState(false)

    return <div className="row-gravity-between">

        <Button ref={filterRef} variant='outlined' onClick={() => setShowFilter(true)}>
            <TuneIcon />
            <span style={{ wordBreak: 'keep-all' }}>필터</span>
        </Button>
        <Popover open={showFilter} anchorEl={filterRef?.current} onClose={() => setShowFilter(false)}>

            <Grid container style={{ padding: '0.3rem' }}>
                <Grid item xs={4}>


                    <FormControlLabel control={<Checkbox checked={filter?.show_individual_lesson ?? false} onChange={d => {

                        const new_filter = { ...filter, show_individual_lesson: d.target.checked }

                        updateFilter?.(new_filter)

                    }} />} label='개별레슨' />

                </Grid>
                <Grid item xs={4}>
                    <FormControlLabel control={<Checkbox checked={filter?.show_semi_lesson ?? false} onChange={d => {
                        const new_filter = { ...filter, show_semi_lesson: d.target.checked }

                        updateFilter?.(new_filter)

                    }} />} label='세미레슨' />

                </Grid>
                <Grid item xs={4}>
                    <FormControlLabel control={<Checkbox checked={filter?.show_group_lesson ?? false} onChange={d => {
                        const new_filter = { ...filter, show_group_lesson: d.target.checked }

                        updateFilter?.(new_filter)

                    }} />} label='그룹레슨' />
                </Grid>
                <Grid item xs={4}>
                    <FormControlLabel control={<Checkbox checked={filter?.show_pilates_lesson ?? false} onChange={d => {
                        const new_filter = { ...filter, show_pilates_lesson: d.target.checked }
                        updateFilter?.(new_filter)
                    }} />} label='필라테스' />
                </Grid>

                <Grid item xs={4}>

                    <FormControlLabel control={<Checkbox checked={filter?.show_gyrotonic_lesson ?? false} onChange={d => {
                        const new_filter = { ...filter, show_gyrotonic_lesson: d.target.checked }
                        updateFilter?.(new_filter)
                    }} />} label='자이로토닉' />

                </Grid>
                <Grid item xs={4}>
                    <FormControlLabel control={<Checkbox checked={filter?.show_ballet_lesson ?? false} onChange={d => {
                        const new_filter = { ...filter, show_ballet_lesson: d.target.checked }
                        updateFilter?.(new_filter)
                    }} />} label='발레' />

                </Grid>

                <Grid item xs={4}>

                    <FormControlLabel control={<Checkbox checked={filter?.show_gyrokinesis_lesson ?? false} onChange={d => {
                        const new_filter = { ...filter, show_gyrokinesis_lesson: d.target.checked }
                        updateFilter?.(new_filter)
                    }} />} label='자이로키네시스' />
                </Grid>


                <Grid item xs={4}>

                    <FormControlLabel control={<Checkbox checked={filter?.show_normal_lesson ?? false} onChange={d => {
                        const new_filter = { ...filter, show_normal_lesson: d.target.checked }
                        updateFilter?.(new_filter)
                    }} />} label='일반수업' />
                </Grid>

                <Grid item xs={4}>

                    <FormControlLabel control={<Checkbox checked={filter?.show_apprentice_lesson ?? false} onChange={d => {
                        const new_filter = { ...filter, show_apprentice_lesson: d.target.checked }
                        updateFilter?.(new_filter)
                    }} />} label='견습강사 주도수업' />
                </Grid>
            </Grid>



        </Popover>


        <div className="row-gravity-center">
            <Button variant='outlined' onClick={e => {
                const new_date = DateTime.fromJSDate(viewDate).minus({ days: 7 })


                setViewDate(new_date.toJSDate())


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

                }}

            />
            <Button variant='outlined' onClick={e => {
                const new_date = DateTime.fromJSDate(viewDate).plus({ days: 7 })


                setViewDate(new_date.toJSDate())

            }}>다음 주</Button>
        </div>

        <div>
            <LessonColorToolTip />
        </div>






    </div >
}

ControlBar.propTypes = {
    updateFilter: PT.func,
    viewDate: PT.instanceOf(Date),
    setViewDate: PT.func,
    filter: PT.object
}


export default ControlBar