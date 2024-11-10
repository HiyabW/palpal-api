const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('mongodb connected.')
    })
    .catch((err) => {
        console.log(err.message)
    })

mongoose.connection.on('connected', () => {
    console.log('mongoose connected')
})

mongoose.connection.on('error', (err) => {
    console.log(err.message)
})

mongoose.connection.on('disconnect', () => {
    console.log('mongoose disconnected')
})


// // if press ctrl-c, close connection before terminating program
// process.on('SIGINT', async () => {
//     await mongoose.connection.close()
//     process.exit(0)
// })