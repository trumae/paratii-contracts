import { NULL_ADDRESS, expectError, getInfoFromLogs, setupParatiiContracts, videoRegistry } from './utils.js'

var Videos = artifacts.require('./Videos.sol')

contract('Videos: ', function (accounts) {
  let videoOwner = accounts[2]
  let videoId = '1234'
  let price = 31415
  let ipfsHash = 'QmZW1CRFwc1RR7ceUtsaHjjb4zAjmXmkg29pQyipfsHash'
  let ipfsData = 'QmZW1CRFwc1RR7ceUtsaHjjb4zAjmXmkg29pQyipfsData'
  let videoInfo

  it('should register a video', async function () {
    await setupParatiiContracts()
    let tx = await videoRegistry.registerVideo(videoId, videoOwner, price, ipfsHash, ipfsData, {from: accounts[1]})
    assert.equal(getInfoFromLogs(tx, 'videoId'), videoId)
    assert.equal(getInfoFromLogs(tx, 'owner'), videoOwner)

    videoInfo = await videoRegistry.getVideoInfo(videoId)
    assert.equal(videoInfo[0], videoOwner)
    assert.equal(videoInfo[1], price)
    assert.equal(videoInfo[2], ipfsHash)
    assert.equal(videoInfo[3], ipfsData)
    // the registrar
    assert.equal(videoInfo[4], accounts[1])
  })

  it('anyone can register a video', async function () {
    let videoRegistry = await Videos.new()
    return videoRegistry.registerVideo(videoId, videoOwner, price, ipfsHash, ipfsData, {from: accounts[1]})
  })

  it('only registrar or the Avatar can unregister a video', async function () {
    let videoRegistry = await Videos.new()
    await videoRegistry.registerVideo(videoId, videoOwner, price, ipfsHash, ipfsData, {from: accounts[1]})

    // accounts[1] is the registrar
    videoInfo = await videoRegistry.getVideoInfo(videoId)
    assert.equal(videoInfo[4], accounts[1])

    await expectError(async function () {
      await videoRegistry.unregisterVideo(videoId, {from: accounts[2]})
    })
    // after this unsuccesful attempt, the information about the video is still there
    videoInfo = await videoRegistry.getVideoInfo(videoId)
    assert.equal(videoInfo[4], accounts[1])

    await videoRegistry.unregisterVideo(videoId, {from: accounts[1]})
    videoInfo = await videoRegistry.getVideoInfo(videoId)
    assert.equal(videoInfo[4], NULL_ADDRESS)
  })

  it('only registrar or the Avatar update the information of a video', async function () {
    let videoRegistry = await Videos.new()
    await videoRegistry.registerVideo(videoId, videoOwner, price, ipfsHash, ipfsData, {from: accounts[1]})

    videoInfo = await videoRegistry.getVideoInfo(videoId)
    assert.equal(videoInfo[2], ipfsHash) // the ipfsHash
    assert.equal(videoInfo[3], ipfsData) // the ipfsData

    await expectError(async function () {
      await videoRegistry.registerVideo(videoId, videoOwner, 0, 'new_hash_2', ipfsData, {from: accounts[2]})
    })

    videoInfo = await videoRegistry.getVideoInfo(videoId)
    assert.equal(videoInfo[2], ipfsHash) // the ipfsHAsh has not been changed

    // update by the regitrar should be unproblematic and register the changes
    await videoRegistry.registerVideo(videoId, videoOwner, 0, 'new_hash_1', 'new_hash_2', {from: accounts[1]})
    videoInfo = await videoRegistry.getVideoInfo(videoId)
    assert.equal(videoInfo[2], 'new_hash_1') // the new ipfsHash
    assert.equal(videoInfo[3], 'new_hash_2') // the new ipfsData
  })
})
