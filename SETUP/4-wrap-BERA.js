const { Web3 } = require('web3');
const WBERAABI = require('../BEX/artifacts/WBERA.json');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);

const fs = require("fs");
// CONFIG
const number_for_wrap = 0.025;


const account = chainConfig.account;
const privateKey = chainConfig.privateKey;
const contractAddress = chainConfig.erc20Tokens.WBERA;
const contractABI = WBERAABI.abi;

async function execute(
    account,
    privateKey,
    contractAddress,
    contractABI,
    contractMethodName,
    contractMethodArgs,
    value,
) {
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const txCount = await web3.eth.getTransactionCount(account);
    const gasPrice = await web3.eth.getGasPrice();

    let data = contract.methods[contractMethodName](...contractMethodArgs).encodeABI();

    // Transaction Object
    const rawTx = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(2000000),
        gasPrice: gasPrice,
        to: contractAddress,
        data: data,
        value: value,
    }

    // Sign the transaction
    const tx = await web3.eth.accounts.signTransaction(rawTx, privateKey);
    const txHash = await web3.eth.sendSignedTransaction(tx.rawTransaction);

    // Get the transaction status SUCCESS or FAILED
    const receipt = await web3.eth.getTransactionReceipt(txHash.transactionHash);

    return [receipt.status.toString(), txHash.transactionHash.toString()];
}

const main = async () => {
    console.log("Reading accounts.txt file...");
    let list_accounts = fs.readFileSync("accounts.txt", "utf8");
    list_accounts = list_accounts.split("\n");
    list_accounts.pop();

    for (let i = 0; i < list_accounts.length; i++) {
        const address = list_accounts[i].split("-")[0];
        const privateKey = list_accounts[i].split("-")[1];
        const amount = number_for_wrap;
        // Get Gas Price
        const gasPrice = await web3.eth.getGasPrice();
        // Deposit BERA to each account using sendTransaction
        const result = await execute(
            address,
            privateKey,
            contractAddress,
            contractABI,
            'deposit',
            [],
            web3.utils.toHex(BigInt(web3.utils.toWei(amount.toString(), 'ether'))),
        );
        if (result[0] === '1') {
            console.log('\u001b[' + 32 + 'm' + i + '. SUCCESSFUL WRAP ' + ' ' + amount + ' BERA ' + ' for ' + address + '\nwith Tx Hash: ' + result[1] + '\u001b[0m\n')
        } else {
            console.log('\u001b[' + 31 + 'm' + i + '. FAILED WRAP ' + ' ' + amount+ ' BERA ' + ' for ' + address + '\nwith Tx Hash: ' + result[1] + '\u001b[0m\n')
        }
    }




};

main();