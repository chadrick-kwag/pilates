const express = require('express');
const app = express();
const path = require('path')
const { MAIN_SERVE_PORT } = require('../config')

app.get('/', (req, res) => {
    return res.sendFile(path.resolve(__dirname, '../puc_html/page_under_construction.html'))
})

app.get('/checkin', (req, res) => {
    return res.sendFile(path.resolve(__dirname, '../puc_html/page_under_construction.html'))
})

app.get('/openschedule', (req, res) => {
    return res.sendFile(path.resolve(__dirname, '../puc_html/page_under_construction.html'))
})

app.use('/static', express.static(path.resolve(__dirname, '../puc_html')))

app.listen(MAIN_SERVE_PORT, () => {
    console.log('>> puc server running on port: ' + MAIN_SERVE_PORT)
})