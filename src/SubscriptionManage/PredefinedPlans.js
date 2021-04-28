const PREDEFINED_PLANS = {
    'PILATES': {
        'INDIVIDUAL': [
            {
                rounds: 1,
                cost: 99000,
                expire_countdown: '1개월',
                expire_days: 30

            }, {
                rounds: 10,
                cost: 880000,
                expire_countdown: '1개월',
                expire_days: 30

            },
            {
                rounds: 21,
                cost: 1760000,
                expire_countdown: '3개월',
                expire_days: 90
            },
            {
                rounds: 33,
                cost: 2640000,
                expire_countdown: '3개월',
                expire_days: 90
            }
        ],
        'SEMI': [
            {
                rounds: 1,
                cost: 60000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 10,
                cost: 500000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 21,
                cost: 1000000,
                expire_countdown: '3개월',
                expire_days: 30
            },
            {
                rounds: 33,
                cost: 1500000,
                expire_countdown: '3개월',
                expire_days: 30
            }
        ],
        'GROUP': [
            {
                rounds: 1,
                cost: 40000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 4,
                cost: 120000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 8,
                cost: 230000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 12,
                cost: 320000,
                expire_countdown: '3개월',
                expire_days: 90
            },
            {
                rounds: 24,
                cost: 620000,
                expire_countdown: '3개월',
                expire_days: 90
            }, {
                rounds: 36,
                cost: 864000,
                expire_countdown: '3개월',
                expire_days: 90
            }
        ]
    },

    'GYROTONIC': {
        'INDIVIDUAL': [
            {
                rounds: 1,
                cost: 99000,
                expire_countdown: '1개월',
                expire_days: 30

            }, {
                rounds: 10,
                cost: 88000,
                expire_countdown: '1개월',
                expire_days: 30

            },
            {
                rounds: 21,
                cost: 1760000,
                expire_countdown: '3개월',
                expire_days: 90
            },
            {
                rounds: 33,
                cost: 2640000,
                expire_countdown: '3개월',
                expire_days: 90
            }
        ],
        'SEMI': [
            {
                rounds: 1,
                cost: 60000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 10,
                cost: 500000,
                expire_countdown: '1개월',
                expire_days: 30
            }, {
                rounds: 21,
                cost: 1000000,
                expire_countdown: '3개월',
                expire_days: 90
            },
            {
                rounds: 33,
                cost: 1500000,
                expire_countdown: '3개월',
                expire_days: 90
            }
        ],
        'GROUP': [
            {
                rounds: 1,
                cost: 40000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 4,
                cost: 140000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 8,
                cost: 270000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 12,
                cost: 370000,
                expire_countdown: '3개월',
                expire_days: 90
            },
            {
                rounds: 24,
                cost: 729000,
                expire_countdown: '3개월',
                expire_days: 90
            },
            {
                rounds: 36,
                cost: 1026000,
                expire_countdown: '3개월',
                expire_days: 90
            }
        ]
    },
    'BALLET': {
        'INDIVIDUAL': [
            {
                rounds: 1,
                cost: 65000,
                expire_countdown: '1개월',
                expire_days: 30

            }, {
                rounds: 5,
                cost: 270000,
                expire_countdown: '1개월',
                expire_days: 30

            },
            {
                rounds: 10,
                cost: 480000,
                expire_countdown: '1개월',
                expire_days: 30
            }

        ],
        'SEMI': [
            {
                rounds: 1,
                cost: 40000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 5,
                cost: 180000,
                expire_countdown: '1개월',
                expire_days: 30
            }, {
                rounds: 10,
                cost: 300000,
                expire_countdown: '1개월',
                expire_days: 30
            }

        ],
        'GROUP': [
            {
                rounds: 1,
                cost: 30000,
                expire_countdown: '1개월',
                expire_days: 30

            },
            {
                rounds: 4,
                cost: 100000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 8,
                cost: 160000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 12,
                cost: 210000,
                expire_countdown: '3개월',
                expire_days: 90
            },
            {
                rounds: 16,
                cost: 240000,
                expire_countdown: '3개월',
                expire_days: 90

            },
            {
                rounds: 20,
                cost: 270000,
                expire_countdown: '3개월',
                expire_days: 90
            },
            {
                rounds: 40,
                cost: 450000,
                expire_countdown: '3개월',
                expire_days: 90
            }
        ]
    },
    'GYROKINESIS': {
        'INDIVIDUAL': [
            {
                rounds: 1,
                cost: 65000,
                expire_countdown: '1개월',
                expire_days: 30

            }, {
                rounds: 5,
                cost: 270000,
                expire_countdown: '1개월',
                expire_days: 30

            },
            {
                rounds: 10,
                cost: 480000,
                expire_countdown: '1개월',
                expire_days: 30
            }

        ],
        'SEMI': [
            {
                rounds: 1,
                cost: 40000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 5,
                cost: 180000,
                expire_countdown: '1개월',
                expire_days: 30
            }, {
                rounds: 10,
                cost: 300000,
                expire_countdown: '1개월',
                expire_days: 30
            }

        ],
        'GROUP': [
            {
                rounds: 1,
                cost: 30000,
                expire_countdown: '1개월',
                expire_days: 30

            },
            {
                rounds: 4,
                cost: 100000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 8,
                cost: 160000,
                expire_countdown: '1개월',
                expire_days: 30
            },
            {
                rounds: 12,
                cost: 210000,
                expire_countdown: '3개월',
                expire_days: 90
            },
            {
                rounds: 16,
                cost: 240000,
                expire_countdown: '3개월',
                expire_days: 90

            },
            {
                rounds: 20,
                cost: 270000,
                expire_countdown: '3개월',
                expire_days: 90
            },
            {
                rounds: 40,
                cost: 450000,
                expire_countdown: '3개월',
                expire_days: 90
            }
        ]
    }
}

export default PREDEFINED_PLANS