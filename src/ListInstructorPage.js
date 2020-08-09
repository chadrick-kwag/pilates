import React from 'react'
import { Table, Button, Form } from 'react-bootstrap'
import InstructorInfoEditModal from './InstructorInfoEditModal'



import {
    LIST_INSTRUCTOR_GQL,
    DELETE_INSTRUCTOR_GQL
} from './common/gql_defs'


class ListInstructorPage extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            data: [],
            edit_target_instructor: null,
            search_name: ""
        }

        this.fetchdata = this.fetchdata.bind(this)
    }

    fetchdata() {
        this.props.apolloclient.query({
            query: LIST_INSTRUCTOR_GQL,
            fetchPolicy: "network-only"
        }).then(d => {
            console.log(d)
            if (d.data.instructors) {
                this.setState({
                    data: d.data.instructors
                })
                return
            }

            console.log('failed to fetch data')


        })
            .catch(e => {
                console.log(e)
                alert('failed to fetch data from server')
            })
    }

    componentDidMount() {
        this.fetchdata()
    }


    render() {


        let visible_data
        if (this.state.search_name.trim() == "") {
            visible_data = this.state.data
        }
        else {
            visible_data = this.state.data.filter(d => d.name == this.state.search_name)
        }

        let table_area


        if (this.state.data != null) {
            table_area = <Table>
                <thead>
                    <td>id</td>
                    <td>name</td>
                    <td>phone</td>
                    <td>action</td>
                </thead>
                <tbody>
                    {visible_data.map(d => <tr>
                        <td>{d.id}</td>
                        <td>{d.name}</td>
                        <td>{d.phonenumber}</td>
                        <td><div>
                            <Button onClick={e => {
                                this.setState({
                                    edit_target_instructor: d
                                })
                            }}>edit</Button>
                            <Button onClick={e => {
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
                                }).catch(e => {
                                    console.log(JSON.stringify(e))
                                    console.log('error deleting instructor')

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
            {this.state.edit_target_instructor == null ? null : <InstructorInfoEditModal
                apolloclient={this.props.apolloclient}
                onSubmitSuccess={() => {
                    this.setState({
                        edit_target_instructor: null
                    }, ()=>{
                        this.fetchdata()
                    })
                }}
                instructor={this.state.edit_target_instructor}
                onCancelClick={() => {
                    this.setState({
                        edit_target_instructor: null
                    })
                }}
            />}
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