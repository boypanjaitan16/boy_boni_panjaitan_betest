#! /usr/bin/env node
'use strict'

const main  = require('../')

module.exports = main({
    port: process.env.PORT || 8000,
    host: process.env.HOST || '0.0.0.0',
    testing : true
})
