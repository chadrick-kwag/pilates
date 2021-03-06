import React, { useState, useEffect } from 'react'

import client from '../apolloclient'

import { Table } from 'react-bootstrap'
import MaterialTable from "material-table";

import { FETCH_INSTRUCTOR_LEVEL_INFO, ADD_INSTRUCTOR_LEVEL, UPDATE_INSTRUCTOR_LEVEL, DELETE_INSTRUCTOR_LEVEL } from '../common/gql_defs'


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

    const add_instructor_level = async (level_string) => {
        let res = await client.query({
            query: ADD_INSTRUCTOR_LEVEL,
            variables: {
                level_string: level_string
            },
            fetchPolicy: 'no-cache'
        })



        console.log(res)

        if (res.data.add_instructor_level.success) {
            return res.data.add_instructor_level.id
        }
        else {
            return null
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

    const update_instructor_level = async (id, level_string) => {

        let res = await client.query({
            query: UPDATE_INSTRUCTOR_LEVEL,
            variables: {
                id: id,
                level_string: level_string
            },
            fetchPolicy: 'no-cache'
        })

        if (res.data.update_instructor_level.success) {
            return true
        }

        return false
    }

    const fetch_instructor_level = () => {

        client.query({
            query: FETCH_INSTRUCTOR_LEVEL_INFO,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)
            if (res.data.fetch_instructor_level_info.success) {
                let new_state = _.cloneDeep(state)
                new_state.level_info_arr = res.data.fetch_instructor_level_info.info_list
                setState(new_state)
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

                <MaterialTable
                    icons={tableIcons}
                    options={{
                        showTitle: false,
                        search: false,
                        paging: false

                    }}

                    columns={[
                        { title: "level string", field: "level_string" },

                    ]}
                    data={state.level_info_arr}
                    editable={{
                        onRowAdd: newdata => new Promise(async (resolve, reject) => {
                            console.log(newdata)

                            let returnid = await add_instructor_level(newdata.level_string)

                            if (returnid !== null) {

                                newdata.id = returnid

                                let new_level_info_arr = state.level_info_arr.concat(newdata)
                                let new_state = _.cloneDeep(state)
                                new_state.level_info_arr = new_level_info_arr
                                setState(new_state)
                                resolve()
                            }
                            else {
                                alert('add failed')
                            }


                        }),
                        onRowUpdate: (newdata, olddata) => new Promise(async (resolve, reject) => {

                            let res = await update_instructor_level(newdata.id, newdata.level_string)
                            console.log(res)
                            if (res) {
                                let new_level_info_arr = [...state.level_info_arr]
                                let index = olddata.tableData.id
                                new_level_info_arr[index] = newdata
                                let new_state = _.cloneDeep(state)
                                new_state.level_info_arr = new_level_info_arr
                                setState(new_state)

                                console.log(new_state)
                                resolve()
                            }
                            else {
                                alert('update failed')
                            }



                        }),
                        onRowDelete: olddata => new Promise(async (resolve, reject) => {


                            let res = delete_instructor_level(olddata.id)

                            if (res) {

                                let index = olddata.tableData.id

                                let new_level_info_arr = [...state.level_info_arr]
                                new_level_info_arr.splice(index, 1)
                                let new_state = _.cloneDeep(state)
                                new_state.level_info_arr = new_level_info_arr
                                setState(new_state)
                                resolve()
                            }
                            else{
                                alert('delete failed')
                                
                            }

                        })
                    }}
                />

            </div>
        </div>
    )
}