import React from 'react'
import { Table, Button, Form, Spinner } from 'react-bootstrap'
// import InstructorInfoEditModal from './InstructorInfoEditModal'
import moment from 'moment'

import InstructorDetailModal from './InstructorDetailModal'



import {
    LIST_INSTRUCTOR_GQL,
    DELETE_INSTRUCTOR_GQL
} from '../common/gql_defs'


class ListInstructorPage extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            data: null,
            edit_target_instructor: null,
            detail_target_instructor: null,
            search_name: ""
        }

        this.fetchdata = this.fetchdata.bind(this)
    }

    fetchdata() {
        console.log('inside fetchdata')
        this.props.apolloclient.query({
            query: LIST_INSTRUCTOR_GQL,
            fetchPolicy: "no-cache"
        }).then(d => {
            console.log(d)
            if (d.data.fetch_instructors.success) {
                this.setState({
                    data: d.data.fetch_instructors.instructors
                })
                return
            }

            console.log('failed to fetch data')
            alert('fetch data failed')


        })
            .catch(e => {
                console.log(e)
                console.log(JSON.stringify(e))
                alert('failed to fetch data from server')
            })
    }

    componentDidMount() {
        this.fetchdata()
    }


    render() {

        let detail_view_modal = null

        if (this.state.detail_target_instructor != null) {
            detail_view_modal = <InstructorDetailModal
                apolloclient={this.props.apolloclient}
                instructor={this.state.detail_target_instructor}
                onCancel={() => this.setState({
                    detail_target_instructor: null
                })}
                onEditSuccess={() => {
                    this.setState({
                        detail_target_instructor: null
                    }, () => {
                        this.fetchdata()
                    })
                }}
            />
        }


        let visible_data
        if (this.state.search_name.trim() == "") {
            visible_data = this.state.data
        }
        else {
            visible_data = this.state.data.filter(d => d.name == this.state.search_name)
        }

        let table_area

        if (this.state.data == null) {
            table_area = <div className='row-gravity-center'>
                <Spinner animation='border' />
            </div>
        }
        else if (this.state.data != null) {
            table_area = <Table className='row-clickable-table'>
                <thead>
                    <td>id</td>
                    <td>name</td>
                    <td>phone</td>
                    <td>created</td>
                    <td>action</td>
                </thead>
                <tbody>
                    {visible_data.map(d => <tr onClick={e => this.setState({
                        detail_target_instructor: d
                    })}>
                        <td>{d.id}</td>
                        <td>{d.name}</td>
                        <td>{d.phonenumber}</td>
                        <td>{moment(new Date(parseInt(d.created))).format('YYYY-MM-DD HH:mm')}</td>
                        <td><div>

                            <Button onClick={e => {
                                e.stopPropagation()
                                let ret = confirm('delete?')
                                if (!ret) {
                                    return
                                }
                                this.props.apolloclient.mutate({
                                    mutation: DELETE_INSTRUCTOR_GQL,
                                    variables: {
                                        id: parseInt(d.id)
                                    }
                                }).then(d => {
                                    if (d.data.deleteinstructor.success) {
                                        this.fetchdata()
                                        return
                                    }

                                    console.log('failed to delete instructor')
                                    alert('failed to delete instructor')
                                }).catch(e => {
                                    console.log(JSON.stringify(e))
                                    console.log('error deleting instructor')
                                    alert('error deleteing instructor')

                                })

                            }}>delete</Button></div></td>
                    </tr>)}
                </tbody>
            </Table>
        }
        else {
            table_area = <div>no results</div>
        }



        return <div>
            {detail_view_modal}

            <div style={{ display: "flex", flexDirection: "row" }}>
                <span>이름검색</span>
                <Form.Control style={{ width: "200px" }} value={this.state.search_name} onChange={e => this.setState({
                    search_name: e.target.value
                })} />
            </div>
            {table_area}
        </div>
    }
}

export default ListInstructorPage