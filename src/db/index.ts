import sqlite3 from 'sqlite3'
sqlite3.verbose()

export const db = new sqlite3.Database('db.sqlite3', error => {
  if (error) {
    console.error('Connection error:', error)
  } else {
    console.log('Connected')
  }
})
