import React from 'react'
import { Table, Button, Form, Spinner } from 'react-bootstrap'


import { SEARCH_INSTRUCTOR_WITH_NAME, FETCH_INSTRUCTOR_INFO_BY_INSTRUCTOR_ID } from '../common/gql_defs'



class InstructorSearchComponent3 extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            init_instructor_id: props.init_instructor_id == null ? null : props.init_instructor_id,
            init_instructor_load_done: props.init_instructor_id == null ? true : false,
            instructor_name: "",
            instructor_search_result: null,
            selected_instructor: null,
            force_search: false

        }

        this.search_instructors = this.search_instructors.bind(this)
        this.fetch_init_instructor = this.fetch_init_instructor.bind(this)
    }


    fetch_init_instructor() {

        if (this.state.init_instructor_id != null) {

            console.log({
                id: this.state.init_instructor_id
            })

            this.props.apolloclient.query({
                query: FETCH_INSTRUCTOR_INFO_BY_INSTRUCTOR_ID,
                variables: {
                    id: this.state.init_instructor_id
                },
                fetchPolicy: 'no-cache'
            }).then(d => {
                console.log(d)

                if (d.data.fetch_instructor_with_id.success) {
                    this.setState({
                        selected_instructor: d.data.fetch_instructor_with_id.instructor,
                        init_instructor_load_done: true
                    })
                }
                else {
                    alert('failed to fetch init instructor')
                }
            })
                .catch(e => {
                    console.log(JSON.stringify(e))
                    alert('error fetching init instructor')
                })
        }

    }

    componentDidMount() {
        this.fetch_init_instructor()
    }

    search_instructors() {

        if (this.state.instructor_name == "") {
            console.log("instructor name is empty")
            return
        }

        this.props.apolloclient.query({
            query: SEARCH_INSTRUCTOR_WITH_NAME,
            variables: {
                name: this.state.instructor_name
            },
            fetchPolicy: 'no-cache'
        }).then(d => {
            console.log(d)
            let fetched_data = d.data.search_instructor_with_name

            this.setState({
                instructor_search_result: fetched_data
            })

        }).catch(e => {
            console.log(JSON.stringify(e))

        })
    }

    render() {


        if (!this.state.init_instructor_load_done) {
            return <div>
                <Spinner animation='border' />
            </div>
        }

        let search_mode = false

        if (this.state.force_search || this.state.selected_instructor == null) {
            search_mode = true
        }

        if (search_mode) {

            let instructor_search_result_area

            if (this.state.instructor_search_result == null) {
                instructor_search_result_area = null
            }
            else if (this.state.instructor_search_result.length == 0) {
                instructor_search_result_area = <div>no results found</div>
            }
            else {
                instructor_search_result_area = <Table className="row-clickable-table">
                    <thead>
                        <th>id</th>
                        <th>name</th>
                        <th>phone</th>
                    </thead>
                    <tbody>
                        {this.state.instructor_search_result.map(d => <tr onClick={e => {
                            this.setState({
                                force_search: false,
                                selected_instructor: d
                            })
                            this.props.instructorSelectedCallback(d)
                        }}>
                            <td>{d.id}</td>
                            <td>{d.name}</td>
                            <td>{d.phonenumber}</td>
                        </tr>)}
                    </tbody>
                </Table>
            }


            return <div>
                {this.state.selected_instructor == null ? null : <div><Button onClick={e => this.setState({
                    force_search: false
                })}>close</Button></div>
                }
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <span>강사이름</span>
                    <Form.Control value={this.state.instructor_name} onChange={e => this.setState({
                        instructor_name: e.target.value
                    })} style={{ width: "200px" }} />
                    <Button onClick={e => this.search_instructors()}>search</Button>
                </div>
                <div>
                    {instructor_search_result_area}
                </div>
            </div>
        }
        else {

            return <div>
                <div>
                    <Button onClick={e => this.setState({
                        force_search: true
                    })}>강사찾기</Button>
                </div>
                <span>강사정보</span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>id: {this.state.selected_instructor.id}</span>
                    <span>name: {this.state.selected_instructor.name}</span>
                </div>
            </div>
        }


    }
}

export default InstructorSearchComponent3