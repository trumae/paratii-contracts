import { getInfoFromLogs, NULL_HASH } from './utils.js'
const ParatiiRegistry = artifacts.require('./ParatiiRegistry')
const ParatiiToken = artifacts.require('./ParatiiToken')

contract('ParatiiRegistry', function (accounts) {
  let videoInfo

  it('should register a contract', async function () {
    let paratiiRegistry = await ParatiiRegistry.new()
    let paratiiToken = await ParatiiToken.new()
    let contractName = 'ParatiiToken'
    let tx = await paratiiRegistry.registerContract(contractName, paratiiToken.address)
    assert.equal(getInfoFromLogs(tx, '_address'), paratiiToken.address)

    videoInfo = await paratiiRegistry.getContract(contractName)
    assert.equal(videoInfo, paratiiToken.address)

    await paratiiRegistry.unregisterContract(contractName)
    videoInfo = await paratiiRegistry.getContract(contractName)
    assert.equal(videoInfo, NULL_HASH)
  })

  it('only owner can unregister a video [TODO]', async function () {
  })
})
