import React from 'react'
import { Table } from 'react-bootstrap'

import { QUERY_SUBSCRIPTIONS_GQL } from '../common/gql_defs'


class SubscriptionListView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: null
        }

        this.fetchdata = this.fetchdata.bind(this)
    }

    componentDidMount(){
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



        return <div>


            <Table>
                <thead>
                    <th>
                        id
                </th>
                    <th>client id</th>
                    <th>client name</th>

                    <th>rounds</th>
                    <th>total cost</th>
                </thead>
                <tbody>
                    {this.state.data.map((d, i) => {

                        return <tr>
                            <td>{d.id}</td>
                            <td>{d.clientid}</td>
                            <td>{d.clientname}</td>

                            <td>{d.rounds}</td>
                            <td>{d.totalcost}</td>
                        </tr>
                    })}
                </tbody>
            </Table>
        </div>
    }
}

export default SubscriptionListView