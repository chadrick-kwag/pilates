import React from 'react'
import { Table, Button } from 'react-bootstrap'
import { gql } from '@apollo/client'



const LIST_INSTRUCTOR_GQL = gql`{
    instructors{
        id
        name
        phonenumber
    }
} `

class ListInstructorPage extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            data: []
        }
    }

    componentDidMount() {
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
            })
    }


    render() {
        return <div>
            <Table>
                <thead>
                    <td>id</td>
                    <td>name</td>
                    <td>phone</td>
                    <td>action</td>
                </thead>
                <tbody>
                    {this.state.data.map(d => <tr>
                        <td>{d.id}</td>
                        <td>{d.name}</td>
                        <td>{d.phonenumber}</td>
                        <td><Button>delete</Button></td>
                    </tr>)}
                </tbody>
            </Table>
        </div>
    }
}

export default ListInstructorPage