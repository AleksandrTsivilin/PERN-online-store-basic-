require('dotenv').config()
const express = require('express')

const sequelize = require('./db')

const models = require('./models/models.js')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routers/index')
const errorHandler  = require('./middleware/errorHandlingMiddleware')
const path = require('path')

const PORT = process.env.PORT || 5000

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname,'static')))
app.use(fileUpload({}))
app.use('/api', router)

// You must use errorHandler as last middleware
app.use(errorHandler)

app.get('/',(req, res)=>{
    res.status(200).json({message:'working'})
})

const start = async () => {
    try{
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, ()=>console.log(`Server started on port ${PORT}`))
    }catch(e){
        console.log('start: something went wrong',e)
    }
}

start()



