import React from 'react'
import {Table, Button, Form} from 'react-bootstrap'
import {gql} from '@apollo/client'


const SEARCH_INSTRUCTOR_WITH_NAME = gql`query search_instructors($name: String!){
    search_instructor_with_name(name: $name){
        id
        name
        phonenumber
    }
}`

class InstructorSearchComponent extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            instructor_name: "",
            instructor_search_result: null
            
        }

        this.search_instructors = this.search_instructors.bind(this)
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



        let instructor_search_result_area

        if (this.state.instructor_search_result == null) {
            instructor_search_result_area = null
        }
        else if (this.state.instructor_search_result.length == 0) {
            instructor_search_result_area = <div>no results found</div>
        }
        else {
            instructor_search_result_area = <Table>
                <thead>
                    <th>id</th>
                    <th>name</th>
                    <th>phone</th>
                </thead>
                <tbody>
                    {this.state.instructor_search_result.map(d => <tr onClick={e => {

                        this.props.instructorSelectedCallback(d)
                    }}>
                        <td>{d.id}</td>
                        <td>{d.name}</td>
                        <td>{d.phonenumber}</td>
                    </tr>)}
                </tbody>
            </Table>
        }

        console.log(instructor_search_result_area)
        console.log(this.state.instructor_search_result)

        return <div>
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
}

export default InstructorSearchComponent