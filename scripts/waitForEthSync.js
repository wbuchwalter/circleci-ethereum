const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

const waitForSync = _ =>  { 
    if(web3.eth.syncing) {
        console.log('Sync in progress')
        waitForSync()
    } else {
        console.log('Sync completed')
    }
}

waitForSync()


web3.eth.isSyncing(function(error, sync){
    if(!error) {
        // stop all app activity
        if(sync === true) {
           console.log('sync == true')

        // show sync info
        } else if(sync) {
           console.log('sync == false') 
           console.log(sync.currentBlock);

        // re-gain app operation
        } else {
            // run your app init function...
           console.log('sync is null')
        }
    }
});

console.log(`Status: `)
console.log(`Connected: ${web3.isConnected()}`)
console.log(`Syncing: ${web3.syncing}`)
console.log(`Block#: ${web3.eth.blockNumber}`)




