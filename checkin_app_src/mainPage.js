import React, { useState } from 'react'

import PhonenumberInput from './components/PhonenumberInput'
import SelectCheckIn from './components/SelectCheckIn'

import SelectClient from './components/SelectClient'

function MainPage() {

    console.log('inside mainpage')
    
    const [phase, setPhase] = useState('phonenumber')
    const [selectedClientInfo, setSelectedClientInfo] = useState(null)
    const [candidateClients, setCandidateClients] = useState([])


    const reset = () => {
        
        setPhase('phonenumber')
        setSelectedClientInfo(null)
        setCandidateClients([])
        
    }

    if (phase === 'phonenumber') {
        return <PhonenumberInput onSubmit={(fetchedClients) => {
            if (fetchedClients.length == 1) {
                setSelectedClientInfo(fetchedClients[0])
                setPhase('select-lesson')

            }
            else {
                setCandidateClients(fetchedClients)
                setPhase('select-client')

            }
        }} />
    }
    else if (phase === 'select-client') {
        return <SelectClient clients={candidateClients} onSelected={(c) => {

            setCandidateClients([])
            setSelectedClientInfo(c)
            setPhase('select-lesson')
        }} onCancel={() => reset()} />
    }
    else if (phase === 'select-lesson') {
        return <SelectCheckIn clientid={selectedClientInfo.id} onSuccess={() => reset()}
            onToFirstScreen={() => reset()}
        />
    }
    else{
        return null
    }
}


export default MainPage