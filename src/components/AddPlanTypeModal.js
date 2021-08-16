import React, { useState, useEffect } from 'react'
import { Button, Checkbox, FormControlLabel, Divider, Dialog, DialogContent, DialogActions, Grid } from '@material-ui/core'
import _ from 'lodash'

function AddPlanTypeModal({ onClose, onSelected, existingPlanTypes }) {


    const [pilates, setpilates] = useState(false);
    const [gyrotonic, setgyrotonic] = useState(false);
    const [ballet, setballet] = useState(false);
    const [gyrokinesis, setgyrokinesis] = useState(false);

    const [individual, setindividual] = useState(false);
    const [semi, setsemi] = useState(false);
    const [group, setgroup] = useState(false);


    const is_submit_disabled = () => {
        let at_least_one_at_selected = false

        if (pilates || gyrotonic || ballet || gyrokinesis) {
            at_least_one_at_selected = true
        }

        if (!at_least_one_at_selected) return true

        let at_least_one_gt_selected = false

        if (individual || semi || group) at_least_one_gt_selected = true

        if (!at_least_one_gt_selected) return true

        return false
    }

    const get_updated_plan_types = () => {

        console.log('existingPlanTypes')
        console.log(existingPlanTypes)

        const current_pt_arr = []

        const selected_at_arr = []
        if (pilates) {
            selected_at_arr.push('PILATES')
        }

        if (gyrotonic) {
            selected_at_arr.push('GYROTONIC')
        }

        if (ballet) {
            selected_at_arr.push('BALLET')
        }

        if (gyrokinesis) {
            selected_at_arr.push('GYROKINESIS')
        }

        console.log('selected_at_arr')
        console.log(selected_at_arr)

        const selected_gt_arr = []

        if (individual) {
            selected_gt_arr.push('INDIVIDUAL')
        }

        if (semi) {
            selected_gt_arr.push('SEMI')
        }

        if (group) {
            selected_gt_arr.push('GROUP')
        }

        console.log('selected_gt_arr')
        console.log(selected_gt_arr)

        for (let at of selected_at_arr) {
            for (let gt of selected_gt_arr) {
                current_pt_arr.push({
                    activity_type: at,
                    grouping_type: gt
                })
            }
        }

        console.log('current_pt_arr')
        console.log(current_pt_arr)


        const merged_pt_arr = _.cloneDeep(current_pt_arr)

        // check each existing pt is already included in merged_pt_arr

        for (let pt of existingPlanTypes) {
            let exist = false
            for (let pt2 of current_pt_arr) {
                if (pt.activity_type === pt2.activity_type && pt.grouping_type === pt2.grouping_type) {
                    exist = true
                    break
                }
            }

            if (!exist) {
                merged_pt_arr.push(pt)
            }
        }

        console.log('final merged_pt_arr')
        console.log(merged_pt_arr)
        return merged_pt_arr

    }

    return <Dialog open={true} onClose={onClose}>
        <DialogContent>
            <Grid container>
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={6} md={4}>
                            <FormControlLabel control={<Checkbox checked={pilates} onChange={e => setpilates(e.target.checked)} />} label='필라테스' />
                        </Grid>

                        <Grid item xs={6} md={4}>
                            <FormControlLabel control={<Checkbox checked={ballet} onChange={e => setballet(e.target.checked)} />} label='발레' />
                        </Grid>

                        <Grid item xs={6} md={4}>
                            <FormControlLabel control={<Checkbox checked={gyrotonic} onChange={e => setgyrotonic(e.target.checked)} />} label='자이로토닉' />
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <FormControlLabel control={<Checkbox checked={gyrokinesis} onChange={e => setgyrokinesis(e.target.checked)} />} label='자이로키네시스' />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Divider variant='inset' />
                </Grid>
                <Grid item xs={12}>
                    <Grid container>

                        <Grid item xs={4} md={3}>
                            <FormControlLabel control={<Checkbox checked={individual} onChange={e => setindividual(e.target.checked)} />} label='개별' />
                        </Grid>
                        <Grid item xs={4} md={3}>
                            <FormControlLabel control={<Checkbox checked={semi} onChange={e => setsemi(e.target.checked)} />} label='세미' />
                        </Grid>
                        <Grid item xs={4} md={3}>
                            <FormControlLabel control={<Checkbox checked={group} onChange={e => setgroup(e.target.checked)} />} label='그룹' />
                        </Grid>
                    </Grid>
                </Grid>


            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>취소</Button>
            <Button disabled={is_submit_disabled()} onClick={() => {
                onSelected?.(get_updated_plan_types())
            }}>추가</Button>
        </DialogActions>

    </Dialog>
}


export default AddPlanTypeModal