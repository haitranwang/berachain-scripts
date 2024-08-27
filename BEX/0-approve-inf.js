const { Web3 } = require('web3');
const BeraCrocMultiSwapABI = require('./artifacts/BeraCrocMultiSwap.json');
const Erc20ABI = require('./artifacts/ERC20.json');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);

// CONFIG
const token_to_approve_contract = chainConfig.erc20Tokens.HONEY;
const spender = chainConfig.bexBeraCrocMultiSwap;
const amount = '115792089237316195423570985008687907853269984665640564039457584007913129639'

const account = chainConfig.account;
const privateKey = chainConfig.privateKey;

async function execute(
    account,
    privateKey,
    contractAddress,
    contractABI,
    contractMethodName,
    contractMethodArgs
) {
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const txCount = await web3.eth.getTransactionCount(account);

    let data = contract.methods[contractMethodName](...contractMethodArgs).encodeABI();

    // Transaction Object
    const rawTx = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(2000000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('0.00001', 'gwei')),
        to: contractAddress,
        data: data
    }

    // Sign the transaction
    const tx = await web3.eth.accounts.signTransaction(rawTx, privateKey);
    const txHash = await web3.eth.sendSignedTransaction(tx.rawTransaction);
    console.log('txHash:', txHash.transactionHash);
}

async function query(
    contractAddress,
    contractABI,
    contractMethodName,
    contractMethodArgs
) {
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    return result = await contract.methods[contractMethodName](...contractMethodArgs).call();
}

const main = async () => {
    const allowance = await query(
        token_to_approve_contract,
        Erc20ABI.abi,
        'allowance',
        [account, spender]
    );
    console.log('allowance:', allowance);

    if (allowance < amount) {
        await execute(
            account,
            privateKey,
            token_to_approve_contract,
            Erc20ABI.abi,
            'approve',
            [spender, amount]
        );
    }
};

main();