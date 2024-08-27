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
    const master_account = chainConfig.account;
    const master_privateKey = chainConfig.privateKey;

    // for (let i = 0; i < list_accounts.length; i++) {
    for (let i = 0; i < list_accounts.length; i++) {
        let address = list_accounts[i].split("-")[0];
        let amount = '0.1';
        // Get Gas Price
        const gasPrice = await web3.eth.getGasPrice();
        // Transfer BERA to each account using sendTransaction
        const txCount = await web3.eth.getTransactionCount(master_account);
        const rawTx = {
            nonce: web3.utils.toHex(txCount),
            gasLimit: web3.utils.toHex(25000),
            gasPrice: gasPrice,
            to: address,
            value: web3.utils.toHex(BigInt(web3.utils.toWei(amount, 'ether'))),
        }
        const tx = await web3.eth.accounts.signTransaction(rawTx, master_privateKey);
        const txHash = await web3.eth.sendSignedTransaction(tx.rawTransaction);

        console.log(`${i}: Transferred ${amount} BERA to ${address} completed`);
        console.log(`txHash: ${txHash.transactionHash}`);

    }
}

main();