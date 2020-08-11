import React from 'react'
import { Form, Table, Button } from 'react-bootstrap'


import { LIST_CLIENT_GQL, DELETE_CLIENT_GQL } from './common/gql_defs'

import ClientInfoEditModal from './ClientInfoEditModal'
import moment from 'moment'



class ListClientPage extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            search_name: "",
            data: [],
            edit_target_client: null
        }

        this.refetch_data = this.refetch_data.bind(this)
    }

    refetch_data() {
        this.props.apolloclient.query({
            query: LIST_CLIENT_GQL,
            fetchPolicy: "no-cache"
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

        let show_data = []

        if (this.state.search_name == "") {
            show_data = this.state.data
        }
        else {
            show_data = this.state.data.filter(d => d.name == this.state.search_name)
        }

        return <div>

            {this.state.edit_target_client == null ? null : <ClientInfoEditModal apolloclient={this.props.apolloclient}
                onSubmitSuccess={() => {
                    console.log('submit success called')
                    this.setState({
                        edit_target_client: null
                    }, () => {
                        this.refetch_data()
                    })
                }}
                client={this.state.edit_target_client}
                onCancelClick={()=>{
                    this.setState({
                        edit_target_client : null
                    })
                }}
            />}

            <div style={{ display: "flex", flexDirection: "row" }}>
                <span>이름검색</span>
                <Form.Control style={{ width: "200px" }} value={this.state.search_name} onChange={e => {
                    this.setState({
                        search_name: e.target.value
                    })
                }}></Form.Control>
            </div>
            {show_data.length == 0 ? <div>no results</div> : <Table>
                <thead>
                    <th>id</th>
                    <th>name</th>
                    <th>phone</th>
                    <th>created time</th>
                    <th>action</th>
                </thead>
                <tbody>
                    {show_data.map(d => <tr>
                        <td>{d.id}</td>
                        <td>{d.name}</td>
                        <td>{d.phonenumber}</td>
                    <td>{moment(new Date(parseInt(d.created))).format('YYYY-MM-DD HH:mm')}</td>
                        <td>
                            <div>
                                <Button onClick={e=>{
                                    this.setState({
                                        edit_target_client: d
                                    })
                                }}>edit</Button>
                                <Button onClick={e => {
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
                            }}>delete</Button>
                            </div>
                        </td>
                    </tr>)}
                </tbody>
            </Table>}

        </div>
    }
}

export default ListClientPage