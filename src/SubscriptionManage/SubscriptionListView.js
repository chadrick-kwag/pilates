import React from 'react'
import { Button, Table } from 'react-bootstrap'
import moment from 'moment'

import { QUERY_SUBSCRIPTIONS_GQL, DELETE_SUBSCRITION_GQL } from '../common/gql_defs'

import ViewSubscriptionDetailModal from './ViewSubscriptionDetailModal'


class SubscriptionListView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: null,
            delete_target_subscription: null,
            view_selected_subscription: null
        }

        this.fetchdata = this.fetchdata.bind(this)
    }

    componentDidMount() {
        this.fetchdata()
    }

    fetchdata() {

        this.props.apolloclient.query({
            query: QUERY_SUBSCRIPTIONS_GQL,
            fetchPolicy: 'no-cache'
        }).then(d => {
            console.log(d)
            if (d.data.query_subscriptions.success) {
                this.setState({
                    data: d.data.query_subscriptions.subscriptions
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




    render() {

        if (this.state.data == null) {
            return <div>no results</div>
        }


        let detail_view_modal = null
        if (this.state.view_selected_subscription != null) {
            detail_view_modal = <ViewSubscriptionDetailModal
                data={this.state.view_selected_subscription}
                onCancel={() => {
                    this.setState({
                        view_selected_subscription: null
                    })
                }} />
        }



        return <div>
            {detail_view_modal}


            <Table className="row-clickable-table">
                <thead>
                    <th>
                        id
                </th>
                    <th>client id</th>
                    <th>client name</th>

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
        </div>
    }
}

export default SubscriptionListView