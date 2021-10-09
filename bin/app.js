#! /usr/bin/env node
'use strict'

const db    = require('../db')
const main  = require('../')

db.connect()
  .then(() => {
    main({
      port: process.env.PORT || 8000,
      host: process.env.HOST || '0.0.0.0'
    })
  })
