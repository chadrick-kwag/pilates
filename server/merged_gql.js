const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
// const { importSchema } = require('graphql-import');
const { readFileSync } = require('fs')

// const lesson_typedefs = require('./typedefs/lesson_typedefs')
// const client_typedefs = require('./typedefs/client_typedefs')
// const subscription_typedefs = require('./typedefs/subscription_typedefs')
// const instructor_typedefs = require('./typedefs/instructor_typedefs')
// const common_typedefs = require('./typedefs/common_typedefs')
// const apprentice_course_typedefs = require('./typedefs/apprentince_course_typedefs')
// const apprentice_instructor_typedefs = require('./typedefs/apprentice_instructor_typedefs')
// const apprentice_plan_typedefs = require('./typedefs/apprentice_plan_typedefs')
// const apprentice_lesson_typedefs = require('./typedefs/apprentice_lesson_typedefs')
// const special_schedule_typedefs = require('./typedefs/special_schedule_typedefs')
// const normal_checkin_typedefs = require('./typedefs/normal_lesson_checkin_typedefs')


const login_typedefs = readFileSync('server/typedefs/login.gql').toString('utf-8')
const adminconfig_typedefs = readFileSync('server/typedefs/adminconfig.gql').toString('utf-8')
const master_instructor_typedefs = readFileSync('server/typedefs/masterinstructor.gql').toString('utf-8')
const person_typedefs = readFileSync('server/typedefs/person.gql').toString('utf-8')
const apprentice_plan_typedefs = readFileSync('server/typedefs/apprentice_plan_typedefs.gql').toString('utf-8')
const normal_checkin_typedefs = readFileSync('server/typedefs/normal_lesson_checkin_typedefs.gql').toString('utf-8')
const lesson_typedefs = readFileSync('server/typedefs/lesson_typedefs.gql').toString('utf-8')
const common_typedefs = readFileSync('server/typedefs/common_typedefs.gql').toString('utf-8')
const apprentice_lesson_typedefs = readFileSync('server/typedefs/apprentice_lesson_typedefs.gql').toString('utf-8')
const subscription_typedefs = readFileSync('server/typedefs/subscription_typedefs.gql').toString('utf-8')
const special_schedule_typedefs = readFileSync('server/typedefs/special_schedule_typedefs.gql').toString('utf-8')
const instructor_typedefs = readFileSync('server/typedefs/instructor_typedefs.gql').toString('utf-8')
const client_typedefs = readFileSync('server/typedefs/client_typedefs.gql').toString('utf-8')
const apprentice_course_typedefs = readFileSync('server/typedefs/apprentice_course_typedefs.gql').toString('utf-8')
const apprentice_instructor_typedefs = readFileSync('server/typedefs/apprentice_instructor_typedefs.gql').toString('utf-8')
const instructor_teach_history_typedefs = readFileSync('server/typedefs/instructor_teach_history_typedefs.gql').toString('utf-8')
const instructor_app_login_typedefs = readFileSync('server/typedefs/instructor_app_login.gql').toString('utf-8')
const instructor_app_others_typedefs = readFileSync('server/typedefs/instructor_app_others.gql').toString('utf-8')




const lesson_resolver = require('./resolvers/lesson_resolvers')
const client_resolver = require('./resolvers/client_resolvers')
const subscription_resolver = require('./resolvers/subscription_resolvers')
const instructor_resolver = require('./resolvers/instructor_resolvers')
const apprentice_course_resolver = require('./resolvers/apprentice_course_resolvers')
const apprentice_instructor_resolver = require('./resolvers/apprentice_instructor_resolvers')
const apprentice_plan_resolver = require('./resolvers/apprentice_plan_resolvers')
const apprentice_lesson_resolver = require('./resolvers/apprentice_lesson_resolvers')
const special_schedule_resolver = require('./resolvers/special_schedule_resolvers')
const normal_checkin_resolver = require('./resolvers/normal_lesson_checkin_resolvers')
const login_resolver = require('./resolvers/login_resolvers')
const adminconfig_resolver = require('./resolvers/adminconfig_resolvers')
const master_instructor_resolver = require('./resolvers/master_instructor_resolvers')
const person_resolver = require('./resolvers/person_resolvers')
const instructor_teach_history_resolver = require('./resolvers/instructor_teach_history_resolver')
const instructor_app_login_resolver = require('./resolvers/instructor_app_login_resolvers')
const instructor_app_others_resolver = require('./resolvers/instructor_app_others_resolvers')


const typeDefs = mergeTypeDefs([lesson_typedefs, client_typedefs, subscription_typedefs, instructor_typedefs, common_typedefs, apprentice_course_typedefs, apprentice_instructor_typedefs, apprentice_plan_typedefs, apprentice_lesson_typedefs, special_schedule_typedefs, normal_checkin_typedefs, login_typedefs, adminconfig_typedefs, master_instructor_typedefs, person_typedefs, instructor_teach_history_typedefs, instructor_app_login_typedefs, instructor_app_others_typedefs])


const resolvers = mergeResolvers([lesson_resolver, client_resolver, subscription_resolver, instructor_resolver, apprentice_course_resolver, apprentice_instructor_resolver, apprentice_plan_resolver, apprentice_lesson_resolver, special_schedule_resolver, normal_checkin_resolver, login_resolver, adminconfig_resolver, master_instructor_resolver, person_resolver, instructor_teach_history_resolver, instructor_app_login_resolver,instructor_app_others_resolver])


module.exports = {
    typeDefs,
    resolvers
}