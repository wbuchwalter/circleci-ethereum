const Web3 = require('web3')
attemptConnection('http://0.0.0.0:8545').then(waitForSync).catch(console.log)

function attemptConnection(uri){
    return new Promise((resolve, reject) => {
        const maxConnectionTries = 10
        let attemptNumber = 0
        const connect = () => {
            try {
                attemptNumber += 1
                let web3 = new Web3(new Web3.providers.HttpProvider(uri))
                console.log('Connection to provider successful')
                resolve(web3)
            } catch(err) {
                console.log(err)
                if(attemptNumber < maxConnectionTries) {
                    console.log('Connection to provider failed, retrying...')
                    setTimeout(() => connect(), 2000)
                } else {
                    reject('Could not connect to provider.')
                }
            }
        }
        connect()
    })
}

var firstPass = true
function waitForSync(web3) {
    if (web3.isConnected() && !web3.eth.syncing && web3.eth.blockNumber > 0) {
        console.log('Done')
    } else {
        if (firstPass) {
            console.log('Waiting for sync to finish...')
            firstPass = false
        }
        setTimeout(() => waitForSync(web3), 2000)
    }
}

