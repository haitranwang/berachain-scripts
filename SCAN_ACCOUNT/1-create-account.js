const { Web3 } = require('web3');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);

const fs = require("fs");
// CONFIG
const NUMBER_OF_ACCOUNTS = 10;


const main = async () => {
    // create account
    for (let i = 0; i < NUMBER_OF_ACCOUNTS; i++) {
        const account = web3.eth.accounts.create();
        const balance = await web3.eth.getBalance(account.address);
        console.log(i, ': account.address:', account.address, ' - ', balance);
        // get balance of account
        fs.appendFileSync('accounts.txt', `${account.address}-${account.privateKey}-${balance}\n`);}
}

main();