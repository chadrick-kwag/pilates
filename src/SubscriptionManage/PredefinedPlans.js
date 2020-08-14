const PREDEFINED_PLANS = {
    'PILATES': {
        'INDIVIDUAL': [
            {
                rounds: 1,
                cost: 99000

            }, {
                rounds: 10,
                cost: 88000

            },
            {
                rounds: 21,
                cost: 1760000
            },
            {
                rounds: 33,
                cost: 2640000
            }
        ],
        'SEMI': [
            {
                rounds: 1,
                cost: 60000
            },
            {
                rounds: 10,
                cost: 500000
            }, {
                rounds: 21,
                cost: 1000000
            },
            {
                rounds: 33,
                cost: 1500000
            }
        ],
        'GROUP': [
            {
                rounds: 1,
                cost: 40000
            },
            {
                rounds: 4,
                cost: 120000
            },
            {
                rounds: 8,
                cost: 230000
            },
            {
                rounds: 12,
                cost: 320000,
                expire_duration: 30
            },
            {
                rounds: 12,
                cost: 324000,
                expire_duration: 90

            },
            {
                rounds: 24,
                cost: 620000,
                expire_duration: 90
            }, {
                rounds: 36,
                cost: 864000,
                expire_duration: 90
            }
        ]
    },

    'GYROTONIC': {
        'INDIVIDUAL': [
            {
                rounds: 1,
                cost: 99000

            }, {
                rounds: 10,
                cost: 88000

            },
            {
                rounds: 21,
                cost: 1760000
            },
            {
                rounds: 33,
                cost: 2640000
            }
        ],
        'SEMI': [
            {
                rounds: 1,
                cost: 60000
            },
            {
                rounds: 10,
                cost: 500000
            }, {
                rounds: 21,
                cost: 1000000
            },
            {
                rounds: 33,
                cost: 1500000
            }
        ],
        'GROUP': [
            {
                rounds: 1,
                cost: 40000
            },
            {
                rounds: 4,
                cost: 140000
            },
            {
                rounds: 8,
                cost: 270000
            },
            {
                rounds: 12,
                cost: 380000,
                expire_duration: 30
            },
            {
                rounds: 12,
                cost: 378000,
                expire_duration: 90

            },
            {
                rounds: 24,
                cost: 729000,
                expire_duration: 90
            }, {
                rounds: 36,
                cost: 1026000,
                expire_duration: 90
            }
        ]
    },
    'BALLET': {
        'INDIVIDUAL': [
            {
                rounds: 1,
                cost: 65000

            }, {
                rounds: 5,
                cost: 270000

            },
            {
                rounds: 10,
                cost: 480000
            }
            
        ],
        'SEMI': [
            {
                rounds: 1,
                cost: 40000
            },
            {
                rounds: 5,
                cost: 180000
            }, {
                rounds: 10,
                cost: 300000
            }
            
        ],
        'GROUP': [
            {
                rounds: 1,
                cost: 30000,
                expire_duration: 30

            },
            {
                rounds: 4,
                cost: 100000,
                expire_duration: 30
            },
            {
                rounds: 8,
                cost: 160000,
                expire_duration: 30
            },
            {
                rounds: 12,
                cost: 210000,
                expire_duration: 30
            },
            {
                rounds: 16,
                cost: 240000,
                expire_duration: 30

            },
            {
                rounds: 20,
                cost: 270000,
                expire_duration: 30
            }, 
            {
                rounds: 40,
                cost: 450000,
                expire_duration: 30
            }
        ]
    }
}

export default PREDEFINED_PLANS