import React from 'react'
import { Button, Table, DropdownButton, Form } from 'react-bootstrap'
import moment from 'moment'

import { QUERY_SUBSCRIPTIONS_GQL, DELETE_SUBSCRITION_GQL, QUERY_SUBSCRIPTION_OF_CLIENTNAME } from '../common/gql_defs'

import ViewSubscriptionDetailModal from './ViewSubscriptionDetailModal'
import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'


class SubscriptionListView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: null,
            delete_target_subscription: null,
            view_selected_subscription: null,
            search_client_name: ""
        }

        this.fetchdata = this.fetchdata.bind(this)
        this.check_search_input = this.check_search_input.bind(this)
    }

    // componentDidMount() {
    //     this.fetchdata()
    // }

    // fetchdata() {

    //     this.props.apolloclient.query({
    //         query: QUERY_SUBSCRIPTIONS_GQL,
    //         fetchPolicy: 'no-cache'
    //     }).then(d => {
    //         console.log(d)
    //         if (d.data.query_subscriptions.success) {
    //             this.setState({
    //                 data: d.data.query_subscriptions.subscriptions
    //             })
    //         }
    //         else {
    //             alert('failed to fetch data')
    //         }
    //     }).catch(e => {
    //         console.log(e)
    //         console.log(JSON.stringify(e))
    //         alert('error fetch data')
    //     })

    // }

    fetchdata() {

        this.props.apolloclient.query({
            query: QUERY_SUBSCRIPTION_OF_CLIENTNAME,
            variables: {
                clientname: this.state.search_client_name
            },
            fetchPolicy: 'no-cache'
        }).then(d => {
            console.log(d)
            if (d.data.query_subscriptions_of_clientname.success) {
                this.setState({
                    data: d.data.query_subscriptions_of_clientname.subscriptions
                })
            }
            else {
                alert('failed to fetch data')

            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))
            alert('error fetch data')
        })

    }


    check_search_input() {

        if (this.state.search_client_name === undefined) {
            return false
        }
        if (this.state.search_client_name.trim() === "") {
            return false
        }

        return true
    }



    render() {



        let detail_view_modal = null
        if (this.state.view_selected_subscription != null) {
            detail_view_modal = <ViewSubscriptionDetailModal
                apolloclient={this.props.apolloclient}
                data={this.state.view_selected_subscription}
                onCancel={() => {
                    this.setState({
                        view_selected_subscription: null
                    })
                }} />
        }



        return <div>
            {detail_view_modal}

            <div className='row-gravity-center'>
                <span>회원이름</span>
                <Form.Control value={this.state.search_client_name} onChange={e => this.setState({ search_client_name: e.target.value })} />
                <Button onClick={_ => {
                    let check = this.check_search_input()

                    if (check) {
                        this.fetchdata()
                    }
                }}>search</Button>
            </div>

            {this.state.data === null ? <div>no results</div> : <Table className="row-clickable-table">
                <thead>
                    <th>
                        id
                </th>
                    <th>client id</th>
                    <th>client name</th>
                    <th>type</th>

                    <th>rounds</th>
                    <th>total cost</th>
                    <th>created</th>
                    <th>action</th>
                </thead>
                <tbody>
                    {this.state.data.map((d, i) => {

                        return <tr onClick={e => {
                            this.setState({
                                view_selected_subscription: d
                            })
                        }}>
                            <td>{d.id}</td>
                            <td>{d.clientid}</td>
                            <td>{d.clientname}</td>
                            <td>{activity_type_to_kor[d.activity_type]}/{grouping_type_to_kor[d.grouping_type]}</td>

                            <td>{d.rounds}</td>
                            <td>{d.totalcost}</td>
                            <td>{moment(new Date(parseInt(d.created))).format('YYYY-MM-DD HH:mm')}</td>
                            <td><div>
                                <Button onClick={e => {
                                    let result = confirm("delete?")
                                    if (result) {
                                        this.props.apolloclient.mutate({
                                            mutation: DELETE_SUBSCRITION_GQL,
                                            variables: {
                                                id: parseInt(d.id)
                                            }
                                        }).then(d => {
                                            console.log(d)

                                            if (d.data.delete_subscription.success) {
                                                this.fetchdata()
                                            }
                                            else {
                                                alert('failed to delete')
                                            }
                                        }).catch(e => {
                                            console.log(e)
                                            alert('error while deleting')
                                        })
                                    }

                                    e.stopPropagation()
                                }}>delete</Button>
                            </div></td>
                        </tr>
                    })}
                </tbody>
            </Table>

            }

        </div>
    }
}

export default SubscriptionListView