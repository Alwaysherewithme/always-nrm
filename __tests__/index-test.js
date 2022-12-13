const { exec } = require('child_process')

test('always-nrm -v', () => {
  const { name, version } = require('../package.json')
  exec(`node bin/index.js -v`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    expect(stdout).toContain(`${name} v${version}`)
  })
})

test('always-nrm ls', () => {
  const { data } = require('../bin/data.json')
  exec(`node bin/index.js ls`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    data.forEach(item => {
      for (key in item) {
        expect(stdout).toContain(item[key])
      }
    })
  })
})

test('always-nrm add key value', () => {
  const key = `github`
  const value = 'https://github.com'
  exec(`node bin/index.js add ${key} ${value}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    expect(stdout).toContain(`Successfully added registry!`)
  })
  exec(`node bin/index.js ls`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    expect(stdout).toContain(value)
  })
})

test('always-nrm del key', () => {
  const key = `github`
  exec(`node bin/index.js del ${key}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    expect(stdout).toContain('Successfully deleted registry!')
  })
  exec(`node bin/index.js ls`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    expect(stdout).not.toContain(key)
  })
})

expect.extend({
  anyContain: (received, resArr) => {
    // usage: expect(received).anyContain(resArr)
    let res = resArr.filter(item => received.indexOf(item) !== -1).length > 0
    if (res) {
      return {
        message: () => `${received} success`,
        pass: true
      }
    } else {
      return {
        message: () => `${received} error`,
        pass: false
      }
    }
  }
})

test('always-nrm use key', () => {
  const key = `taobao`
  exec(`node bin/index.js use ${key}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    expect(stdout).anyContain([
      `Set registry '${key}' successfully!`,
      `The ${key} is not in the list.`
    ])
  })
  exec(`npm config get registry`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    const { data } = require('../bin/data.json')
    let res = data.filter(item => item[key])[0]
    if (res) {
      expect(stdout).toContain(res[key])
    } else {
      throw(`The ${key} is not in the list.`)
    }
  })
})
