const { ApolloServer, gql } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./merged_gql')
const { get_account_id_for_token } = require('./tokenCache')
const { check_token } = require('./checkintokencache')
const {get_instructor_app_personid_for_token} = require('./InstructorAppTokenCache')

const server = new ApolloServer({
    typeDefs, resolvers,
    context: ({ req }) => {

        const domain = req.headers.authdomain || '';
        const token = req.headers.authorization || '';


        if (domain === '') {
            // ADMIN TOKEN
            let account_id = get_account_id_for_token(token)

            return {
                account_id
            }

        }
        else if (domain === 'checkin') {
            
            if(check_token(token)){
                return {
                    checkinAuthorized: true
                }
            }
            else{
                return {
                    checkinAuthorized: false
                }
            }
            
        }
        else if(domain === 'instructor-app'){

            let instructor_personid = get_instructor_app_personid_for_token(token)

            return {
                instructor_personid
            }

        }

    }
});


module.exports = server