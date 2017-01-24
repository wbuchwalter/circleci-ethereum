module.exports = function(callback) {
    var account_one = '0x322BA17D251AfDB6d84fd288B5AEF518208CccB9'
    var account_two = '0xd1A3cAb68591323DE33d5342C2f9290C4D8D5398'

    var meta = MetaCoin.deployed();
    meta.sendCoin(account_two, 10, {from: account_one}).then(function(tx_id) { console.log("Transaction successful!")}).catch(function(e) {console.log('error')})
}