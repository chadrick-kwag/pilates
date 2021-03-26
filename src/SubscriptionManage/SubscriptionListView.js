import React from 'react'
import { Button, Table, Form } from 'react-bootstrap'
import moment from 'moment'

import { QUERY_SUBSCRIPTIONS_BY_CLIENTID, SEARCH_CLIENT_WITH_NAME, DELETE_SUBSCRITION_GQL } from '../common/gql_defs'

import ViewSubscriptionDetailModal from './ViewSubscriptionDetailModal'
import { activity_type_to_kor, grouping_type_to_kor } from '../common/consts'
import numeral from 'numeral'



class SubscriptionListView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: null,
            delete_target_subscription: null,
            view_selected_subscription: null,
            search_client_name: "",
            search_client_id: null,
            client_candidates: []


        }

        this.fetchdata = this.fetchdata.bind(this)
        this.check_search_input = this.check_search_input.bind(this)
        this.fetchclient = this.fetchclient.bind(this)
    }


    fetchclient() {
        // fetch client info based on client search name.
        // if there is only one, then proceed to calling fetchdata.
        // if there are mulltiple clients with that name, then update `client_candidates` and do NOT proceed to `fetchdata()`

        this.props.apolloclient.query({
            query: SEARCH_CLIENT_WITH_NAME,
            variables: {
                name: this.state.search_client_name
            },
            fetchPolicy: 'no-cache'
        }).then(res => {

            console.log(res)

            let client_infos = res.data.search_client_with_name

            if (client_infos.length == 0) {
                alert('no client found by that name')
            }
            else if (client_infos.length == 1) {
                let client_id = client_infos[0].id
                console.log('need to proceed!')
                this.setState({
                    search_client_id: client_id
                })
                this.fetchdata(parseInt(client_id))
            }
            else {
                // multiple clients found
                this.setState({
                    client_candidates: client_infos,
                    data: null
                })
            }
        }).catch(e => {
            console.log(e)
            console.log(JSON.stringify(e))

            alert('search client error')
        })
    }

    fetchdata(_clientid) {

        let v = {
            clientid: _clientid
        }

        console.log(v)

        this.props.apolloclient.query({
            query: QUERY_SUBSCRIPTIONS_BY_CLIENTID,
            variables: v,
            fetchPolicy: 'no-cache'
        }).then(res => {
            console.log(res)

            if (res.data.query_subscriptions_by_clientid.success) {
                this.setState({
                    client_candidates: [],
                    data: res.data.query_subscriptions_by_clientid.subscriptions.sort(a => -parseInt(a.created))
                })
            }
            else {
                alert('query fail')
                this.setState({
                    client_candidates: []
                })
            }

        }).catch(e => {
            console.log(JSON.stringify(e))
            alert('query error')
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
                        data: null,
                        view_selected_subscription: null
                    }, this.fetchdata(parseInt(this.state.search_client_id)))
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

                        this.setState({
                            client_candidates: [],
                            data: null,
                            search_client_id: null
                        }, () => {
                            this.fetchclient()
                        })

                    }
                }}>search</Button>
            </div>

            {this.state.client_candidates.length == 0 ? (this.state.data === null ? <div>no results</div> :

                <div>
                    <Table className="row-clickable-table">
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
                                    <td>{numeral(d.totalcost).format('0,0')}원</td>
                                    <td>{moment(new Date(parseInt(d.created))).format('YYYY-MM-DD HH:mm')}</td>
                                    <td><div>
                                        <Button
                                            variant='danger'
                                            onClick={e => {
                                                let result = confirm("플랜을 삭제하시겠습니까?")
                                                if (result) {
                                                    this.props.apolloclient.mutate({
                                                        mutation: DELETE_SUBSCRITION_GQL,
                                                        variables: {
                                                            id: parseInt(d.id)
                                                        }
                                                    }).then(d => {
                                                        console.log(d)

                                                        if (d.data.delete_subscription.success) {
                                                            this.fetchdata(parseInt(this.state.search_client_id))
                                                        }
                                                        else {
                                                            let msg = d.data.delete_subscription.msg
                                                            alert(`failed to delete. ${msg}`)
                                                        }
                                                    }).catch(e => {
                                                        console.log(e)
                                                        alert('error while deleting')
                                                    })
                                                }

                                                e.stopPropagation()
                                            }}>삭제</Button>
                                    </div></td>
                                </tr>
                            })}
                        </tbody>
                    </Table>
                </div>
            )
                :
                <div>
                    <div className="row-gravity-center">
                        <p><b>please select client</b></p>
                    </div>


                    <Table className="row-clickable-table">
                        <thead>
                            <th>id</th>
                            <th>name</th>
                            <th>phone number</th>
                        </thead>
                        <tbody>
                            {this.state.client_candidates.map(d => {
                                return <tr onClick={() => {
                                    this.setState({
                                        search_client_id: d.id
                                    })
                                    this.fetchdata(parseInt(d.id))
                                }}>
                                    <td>{d.id}</td>
                                    <td>{d.name}</td>
                                    <td>{d.phonenumber}</td>
                                </tr>
                            })}
                        </tbody>
                    </Table>
                </div>}



        </div>
    }
}

export default SubscriptionListView