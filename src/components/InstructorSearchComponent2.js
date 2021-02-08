import React from 'react'
import { Card, Table, Button, Form, Spinner } from 'react-bootstrap'


import { SEARCH_INSTRUCTOR_WITH_NAME } from '../common/gql_defs'
import client from '../apolloclient'





class InstructorSearchComponent2 extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            instructor_name: "",
            instructor_search_result: null,
            selected_instructor: null,
            force_search: false,
            fetching: false

        }

        this.search_instructors = this.search_instructors.bind(this)
    }



    search_instructors() {

        if (this.state.instructor_name == "") {
            console.log("instructor name is empty")
            return
        }

        this.setState({
            fetching: true
        })

        client.query({
            query: SEARCH_INSTRUCTOR_WITH_NAME,
            variables: {
                name: this.state.instructor_name
            },
            fetchPolicy: 'no-cache'
        }).then(d => {
            console.log(d)
            let fetched_data = d.data.search_instructor_with_name.filter(a => {
                return a.disabled === true ? false : true
            })

            this.setState({
                instructor_search_result: fetched_data,
                fetching: false
            })

        }).catch(e => {
            console.log(JSON.stringify(e))

        })
    }

    render() {

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


            return <Card className='profilecard'>
                <Card.Body>
                    {this.state.selected_instructor == null ? null : <div className="row-gravity-left profilecard-top-area"><Button size='sm' variant='outline-dark' onClick={e => this.setState({
                        force_search: false
                    })}>close</Button></div>
                    }
                    <div className='row-gravity-center'>
                        <span>강사이름</span>
                        <Form.Control value={this.state.instructor_name} onChange={e => this.setState({
                            instructor_name: e.target.value
                        })} style={{ width: "200px" }} />
                        <Button onClick={e => this.search_instructors()}>search</Button>
                    </div>
                    <div style={{ marginTop: '10px' }} className='col-gravity-center'>
                        {this.state.fetching ? <Spinner animation='border' /> : instructor_search_result_area}

                    </div>
                </Card.Body>
            </Card>
        }
        else {

            return <Card className='profilecard'>
                <Card.Body>
                    <div className="row-gravity-left profilecard-top-area">
                        <Button variant='outline-dark' size='sm'
                            onClick={e => this.setState({
                                force_search: true
                            })}>강사찾기</Button>
                    </div>

                    <div className='row-gravity-center profilecard-bigname'><span>{this.state.selected_instructor.name}</span></div>
                    <div className='col-gravity-center'>
                        <span>연락처 {this.state.selected_instructor.phonenumber}</span>
                    </div>
                </Card.Body>
            </Card>
        }


    }
}

export default InstructorSearchComponent2