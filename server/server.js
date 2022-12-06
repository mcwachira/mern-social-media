const express = require('express')

const app = express()

const port = 8001
app.listen(port, (req, res) => {
    console.log(`hello at port ${port}`)
})