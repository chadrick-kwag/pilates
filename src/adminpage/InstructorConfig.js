import React, { useState, useEffect } from 'react'

import client from '../apolloclient'

import { Table } from 'react-bootstrap'
import MaterialTable from "material-table";

import { FETCH_INSTRUCTOR_LEVEL_INFO, ADD_INSTRUCTOR_LEVEL, UPDATE_INSTRUCTOR_LEVEL, DELETE_INSTRUCTOR_LEVEL } from '../common/gql_defs'

import { CircularProgress, Switch } from '@material-ui/core'
import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};



export default function InstructorConfig(props) {



    const [state, setState] = useState({
        level_info_arr: []
    })

    const [levelInfoArr, setLevelInfoArr] = useState(null)

    const add_instructor_level = async (data) => {

        try {

            const _var = {
                id: data.id,
                rank: parseInt(data.rank),
                level_string: data.level_string,
                active: data.active,
                non_group_lesson_pay_percentage: parseFloat(data.non_group_lesson_pay_percentage),
                group_lesson_perhour_payment: parseInt(data.group_lesson_perhour_payment),
                group_lesson_perhour_penalized_payment: parseInt(data.group_lesson_perhour_penalized_payment)

            }

            console.log('var')
            console.log(_var)

            let res = await client.query({
                query: ADD_INSTRUCTOR_LEVEL,
                variables: _var,
                fetchPolicy: 'no-cache'
            })

            console.log(res)

            if (res.data.add_instructor_level.success) {
                // return res.data.add_instructor_level.id
                return true
            }
            else {
                return false
            }
        }
        catch (e) {
            console.log(e)
            console.log(JSON.stringify(e))

            return false
        }


    }

    const delete_instructor_level = async (id) => {
        let res = await client.query({
            query: DELETE_INSTRUCTOR_LEVEL,
            variables: {
                id: id
            },
            fetchPolicy: 'no-cache'
        })

        if (res.data.delete_instructor_level.success) {
            return true
        }

        return false
    }

    const update_instructor_level = async (data) => {

        console.log('inside update_instructor_level')

        const _var = {
            id: data.id,
            rank: parseInt(data.rank),
            level_string: data.level_string,
            active: data.active,
            non_group_lesson_pay_percentage: parseFloat(data.non_group_lesson_pay_percentage),
            group_lesson_perhour_payment: parseInt(data.group_lesson_perhour_payment),
            group_lesson_perhour_penalized_payment: parseInt(data.group_lesson_perhour_penalized_payment)

        }

        console.log('_var')
        console.log(_var)
        try {
            let res = await client.query({
                query: UPDATE_INSTRUCTOR_LEVEL,
                variables: _var,
                fetchPolicy: 'no-cache'
            })

            if (res.data.update_instructor_level.success) {
                return true
            }

            return false
        }
        catch (e) {
            console.log(e)
            console.log(JSON.stringify(e))
            return false
        }

    }

    const fetch_instructor_level = () => {

        client.query({
            query: FETCH_INSTRUCTOR_LEVEL_INFO,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.fetch_instructor_level_info.success) {


                setLevelInfoArr(res.data.fetch_instructor_level_info.info_list)
            }
            else {
                alert('instructor lefvel info fetch failed')
            }
        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('instructor lefvel info fetch error')
        })
    }

    let headers = [
        {
            value: 'name', type: 'TextField'
        },

    ]
    let rows = [{
        name: 'brandy'
    }, {
        name: 'hello'
    }]


    useEffect(() => {
        fetch_instructor_level()
    }, [])

    return (

        <div>
            <h1>강사관련 설정</h1>
            <div>
                <h2>강사 레벨 설정</h2>

                {levelInfoArr === null ? <CircularProgress /> : <MaterialTable
                    icons={tableIcons}
                    options={{
                        showTitle: false,
                        search: false,
                        paging: false

                    }}

                    columns={[
                        { title: '랭크', field: 'rank', type: 'int' },
                        { title: "등급이름", field: "level_string" },
                        {
                            title: "활성", field: 'active', type: 'boolean', initialEditValue: true, editComponent: p => {
                                console.log(p)
                                return <Switch checked={p.value} onChange={e => {
                                    console.log(e)
                                    p.onChange(e.target.checked)
                                }} />
                            }
                        },
                        { title: '개별/세미 수업 강사료 지급%', field: 'non_group_lesson_pay_percentage', type: 'float' },
                        { title: '그룹수업 회당 강사료', field: 'group_lesson_perhour_payment', type: 'int' },
                        { title: '그룹수업 1인수업시 회당 강사료', field: 'group_lesson_perhour_penalized_payment', type: 'int' },
                    ]}
                    data={levelInfoArr}
                    editable={{
                        onRowAdd: newdata => new Promise(async (resolve, reject) => {
                            console.log(newdata)

                            let ret = await add_instructor_level(newdata)

                            if (ret) {
                                setLevelInfoArr(null)
                                fetch_instructor_level()
                                resolve()

                            }
                            else {
                                alert('add failed')
                                fetch_instructor_level()
                                resolve()
                            }

                        }),
                        onRowUpdate: (newdata, olddata) => new Promise(async (resolve, reject) => {

                            console.log('onRowUpdate')
                            console.log(newdata)

                            let res = await update_instructor_level(newdata)
                            console.log(res)
                            if (res) {

                                setLevelInfoArr(null)
                                fetch_instructor_level()
                                resolve()
                            }
                            else {
                                alert('update failed')
                                fetch_instructor_level()
                                resolve()
                            }



                        }),
                        onRowDelete: olddata => new Promise(async (resolve, reject) => {


                            let res = delete_instructor_level(olddata.id)

                            if (res) {
                                setLevelInfoArr(null)
                                fetch_instructor_level()
                                resolve()
                            }
                            else {
                                alert('delete failed')
                                fetch_instructor_level()
                                resolve()

                            }

                        })
                    }}
                />}



            </div>
        </div>
    )
}