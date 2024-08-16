const { Web3 } = require('web3');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);

const fs = require("fs");
// CONFIG
const NUMBER_OF_ACCOUNTS = 100;


const main = async () => {
    console.log("Reading accounts.txt file...");
    let list_accounts = fs.readFileSync("accounts.txt", "utf8");
    list_accounts = list_accounts.split("\n");
    list_accounts.pop();
    console.log(list_accounts);

    for (let i = 0; i < list_accounts.length; i++) {
        let address = list_accounts[i].split("-")[0];
        let amount = 1;
    }
}

main();