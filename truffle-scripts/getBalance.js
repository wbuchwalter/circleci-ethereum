module.exports = function(callback) {
    var account_one = '0x322BA17D251AfDB6d84fd288B5AEF518208CccB9'
    var account_two = '0xaBa48881CCdE800Ea6354583f491d195e60933Cf'

    var meta = MetaCoin.deployed();
    var res = meta.getBalance.call(account_two, {from: account_one}).then(data => console.log(data.valueOf())).catch(e => console.log(e))
}