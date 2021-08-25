import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloProvider, } from '@apollo/react-hooks';
import client from './apolloclient'


import { HashRouter, Route, withRouter, Switch } from 'react-router-dom'
import PasswordLoginPage from './components/PasswordLoginPage'

import MainPage from './mainPage'
import AuthWrapper from './components/AuthWrapper'


class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            phase: "phonenumber",
            phonenumber: "",
            selected_client_info: null
        }

    }


    render() {
        return <div style={{ width: '100%', height: '100%' }}>
            <Switch>
                <Route path='/login'>
                    <PasswordLoginPage />
                </Route>

                <Route path='/'>
                    <AuthWrapper>

                        <MainPage />
                    </AuthWrapper>
                </Route>




            </Switch>
        </div>

    }
}



const _App = withRouter(App)

ReactDOM.render(<ApolloProvider client={client}>
    <HashRouter>
        <_App />
    </HashRouter>
</ApolloProvider>, document.getElementById('app'))