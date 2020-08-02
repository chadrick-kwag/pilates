import React from 'react'
import { Table, Button } from 'react-bootstrap'
import { gql } from '@apollo/client'



const LIST_CLIENT_GQL = gql`{
    clients{
        id
        name
        phonenumber
    }
}`

const DELETE_CLIENT_GQL = gql`mutation DeleteClient($id:Int!){
    deleteclient(id: $id){
        success
    }
}`

class ListClientPage extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            data: []
        }

        this.refetch_data = this.refetch_data.bind(this)
    }

    refetch_data() {
        this.props.apolloclient.query({
            query: LIST_CLIENT_GQL,
            fetchPolicy: "network-only"
        }).then(d => {
            console.log(d)
            if (d.data.clients) {
                this.setState({
                    data: d.data.clients
                })
                return
            }

            console.log('failed to fetch client data')


        })
        .catch(e => {
            console.log(e)
        })
    }

    componentDidMount() {
        this.refetch_data()
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
                        <td><Button onClick={e => {
                            console.log('try deleting ' + d.id)
                            this.props.apolloclient.mutate({
                                mutation: DELETE_CLIENT_GQL,
                                variables: {
                                    id: parseInt(d.id)
                                },
                                errorPolicy: "all"
                            }).then(d => {
                                console.log(d)
                                if (d.data.deleteclient.success) {
                                    this.refetch_data()
                                }
                                else {
                                    console.log('failed to delete')
                                }
                            }).catch(e => {
                                console.log(e)
                                console.log(e.data)
                                console.log(JSON.stringify(e, null, 2));
                            })
                        }}>delete</Button></td>
                    </tr>)}
                </tbody>
            </Table>
        </div>
    }
}

export default ListClientPage