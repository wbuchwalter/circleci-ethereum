const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

console.log(`web3 status: ${web3}`)
const waitForSync = _ =>  { if(web3.eth.syncing) { waitForSync() } }
waitForSync()
console.log('Sync completed')