// Swap (RANDOM-RANDOM) random amount (from 0.1 to 0.35) from BEX
// Delay random time (from 5 to 15 minutes)
const { Web3 } = require('web3');
const BeraCrocMultiSwapABI = require('./artifacts/BeraCrocMultiSwap.json');
const Erc20ABI = require('./artifacts/ERC20.json');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);

// CONFIG
const TRADING_TIMES = 5;
let base_amount_percentage_range = [5, 15];
const slippage = 20;
const is_buy_range = [true, false];
const spender = chainConfig.bexBeraCrocMultiSwap;

// token base, token quote
const pairs_list = [
    [chainConfig.erc20Tokens.HONEY, chainConfig.erc20Tokens.WBERA, '36000'],
    [chainConfig.erc20Tokens.WBERA, chainConfig.erc20Tokens.USDC, '36000'],
    [chainConfig.erc20Tokens.WBERA, chainConfig.erc20Tokens.DAI, '36002'],
    // [chainConfig.nativeToken, chainConfig.erc20Tokens.WETH, '36001'],
]

const account = chainConfig.account;
const privateKey = chainConfig.privateKey;
const contractAddress = chainConfig.bexBeraCrocMultiSwap;
const contractABI = BeraCrocMultiSwapABI.abi;

const main = async () => {
    for (let i = 0; i < TRADING_TIMES; i++) {
        // make a random number to choose token base and token quote
        let randome_number = Math.floor(Math.random() * pairs_list.length);
        let token_base = pairs_list[randome_number][0];
        let token_quote = pairs_list[randome_number][1];
        let poolIdx = pairs_list[randome_number][2];
        let is_buy = is_buy_range[Math.floor(Math.random() * is_buy_range.length)];
        if (is_buy == true) {
            process_trade(token_base, token_quote, poolIdx);
        } else {
            process_trade(token_quote, token_base, poolIdx);
        }
    }
}

async function process_trade(
    token_1,
    token_2,
    poolIdx,
) {

}

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
        gasPrice: web3.utils.toHex(web3.utils.toWei('0.0000001', 'gwei')),
        to: contractAddress,
        data: data
    }

    // Sign the transaction
    const tx = await web3.eth.accounts.signTransaction(rawTx, privateKey);
    const txHash = await web3.eth.sendSignedTransaction(tx.rawTransaction);

    // Get the transaction status SUCCESS or FAILED
    const receipt = await web3.eth.getTransactionReceipt(txHash.transactionHash);

    return [receipt.status.toString(), txHash.transactionHash.toString()];
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

main();