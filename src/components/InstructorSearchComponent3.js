// one line instructor card

import React, { createRef } from 'react'
import { Card, Table, Button, Form, Spinner } from 'react-bootstrap'


import { SEARCH_INSTRUCTOR_WITH_NAME } from '../common/gql_defs'
import client from '../apolloclient'
import Chip from '@material-ui/core/Chip';
import CancelIcon from '@material-ui/icons/Cancel';
import PhoneIcon from '@material-ui/icons/Phone';



class InstructorSearchComponent3 extends React.Component {


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
        this.get_absolute_dim = this.get_absolute_dim.bind(this)

        this.card = createRef()
        this.search_inputbox = createRef()
    }

    get_absolute_dim() {

        let out = 100

        if(this.card.current){
            let rect = this.card.current.getBoundingClient
        }
        return 100
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

        let instructor_search_result_area
        if (search_mode!==true){
            instructor_search_result_area = null
        }
        else if (this.state.instructor_search_result == null) {
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
                        this.props.instructorSelectedCallback?.(d)
                    }}>
                        <td>{d.id}</td>
                        <td>{d.name}</td>
                        <td>{d.phonenumber}</td>
                    </tr>)}
                </tbody>
            </Table>
        }

        return <Card className='profilecard' ref={this.card}>
            {search_mode ? <Card.Body>


                <div className='row-gravity-center'>
                    <span>강사이름</span>
                    <Form.Control ref={this.search_inputbox} value={this.state.instructor_name} onChange={e => this.setState({
                        instructor_name: e.target.value
                    })} 
                    onKeyDown={e => {
                        console.log(e)
                        if (e.nativeEvent.key === 'Enter') {
                            this.search_instructors()
                        }
                    }}
                    />
                    <Button onClick={e => this.search_instructors()}>검색</Button>
                    {this.state.selected_instructor == null ? null : <CancelIcon onClick={_ => this.setState({
                        force_search: false
                    })} />}


                </div>
                <div style={{
                    marginTop: '10px', position: 'absolute', zIndex: '100',
                    backgroundColor: 'white',
                    left: this.get_absolute_dim()

                }} className='col-gravity-center'>
                    {this.state.fetching ? <Spinner animation='border' /> : instructor_search_result_area}
                    {/* {instructor_search_result_area} */}

                </div>
            </Card.Body> : <Card.Body>
                    <div className='row-gravity-between'>
                        <span className='row-gravity-left'><Chip label="강사" /> {this.state.selected_instructor.name} (<PhoneIcon />{this.state.selected_instructor.phonenumber})</span>
                        <Button variant='outline-dark' size='sm'
                            onClick={e => this.setState({
                                force_search: true
                            })}>강사찾기</Button>
                    </div>

                </Card.Body> }
        </Card>

    }
}

export default InstructorSearchComponent3