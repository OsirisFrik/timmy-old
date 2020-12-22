import firebase from 'firebase-admin'
import env from './config'

firebase.initializeApp({
  credential: firebase.credential.applicationDefault(),
  databaseURL: env.DATABASE,
  storageBucket: env.BUCKET
})
