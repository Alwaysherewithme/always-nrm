#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const pkg = require('../package.json')


const obj2file = dataObj => {
  fs.writeFileSync(
    path.resolve(__dirname, './data.json'),
    JSON.stringify(dataObj)
  )
}

const file2obj = filePath => {
  filePath = path.resolve(__dirname, filePath)
  return JSON.parse(fs.readFileSync(filePath).toString())
}

const dataObj = file2obj('./data.json')

let argv = process.argv

if (argv.indexOf('-v') !== -1) {
  console.log(`${pkg.name} v${pkg.version}`)
} else if (argv.indexOf('ls') !== -1) {
  // The child_process module provides the ability to spawn subprocesses
  const { exec } = require('child_process')
  // exec: spawns a shell and runs a command within that shell, passing the stdout and stderr to a callback function when complete
  exec(`npm config get registry`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    dataObj.data.forEach(item => {
      for (key in item) {
        let str = ' '
        if (item[key].trim() === stdout.trim()) {
          str = '*'
        }
        console.log(`${str} ${(key+' ').padEnd('20', '-')} ${item[key]}`)
      }
    })
  })
} else if (argv.indexOf('add') !== -1) {
  let index = argv.indexOf('add')
  let key = argv[index+1]
  let value = argv[index+2]
  let res = dataObj.data.filter(item => item[key])
  if (res.length === 0) {
    let item = {}
    item[key] = value
    dataObj.data.push(item)
    obj2file(dataObj)
    console.log('Successfully added registry!')
  } else {
    console.log(`The ${key} has already been in list.`)
  }
} else if (argv.indexOf('del') !== -1) {
  let index = argv.indexOf('del')
  let key = argv[index+1]
  dataObj.data = dataObj.data.filter(item => !item[key])
  obj2file(dataObj)
  console.log('Successfully deleted registry!')
} else if (argv.indexOf('use') !== -1) {
  let index = argv.indexOf('use')
  let key = argv[index+1]
  let res = dataObj.data.filter(item => item[key])
  if (res.length > 0) {
    const { exec } = require('child_process')
    exec(`npm config set registry ${res[0][key]}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        return
      }
      console.log(`Set registry '${res[0][key]}' successfully!`)
    })
  } else {
    console.log(`The ${key} is not in the list.`)
  }
}

