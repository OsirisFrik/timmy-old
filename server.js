require('dotenv').config()

const express = require('express')
const firebase = require('firebase-admin')

const app = express()

firebase.initializeApp({
  credential: firebase.credential.applicationDefault(),
  databaseURL: process.env.DATABASE,
  storageBucket: process.env.BUCKET
})

app.get('/', (req, res) => res.send(true))

app.listen(process.env.PORT, () => {
  console.log(`Server listening in https://localhost:${process.env.PORT}`)  
  require('./bot')
})
