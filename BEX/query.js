const { Web3 } = require('web3');
const BeraCrocMultiSwapABI = require('./artifacts/BeraCrocMultiSwap.json');
const Erc20ABI = require('./artifacts/ERC20.json');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);

// CONFIG
const token_base = chainConfig.nativeToken;
const base_amount = '100000000000000000';
const token_quote = chainConfig.erc20Tokens.WETH;
const slippage = 5;
const is_buy = false;

const account = chainConfig.account;
const privateKey = chainConfig.privateKey;
const contractAddress = chainConfig.bexBeraCrocMultiSwap;
const contractABI = BeraCrocMultiSwapABI.abi;

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

const main = async () => {
    for (let i = 0; i < 2; i++) {
        const SwapStep = {
            poolIdx: '36001',
            base: chainConfig.nativeToken,
            quote: chainConfig.erc20Tokens.WETH,
            isBuy: true
        }

        // query previewMultiSwap
        const previewMultiSwapArgs = [
            [SwapStep],
            base_amount,
        ];

        console.log('previewMultiSwapArgs:', previewMultiSwapArgs);

        const previewMultiSwapResult = await query(
            contractAddress,
            contractABI,
            'previewMultiSwap',
            previewMultiSwapArgs
        );
        console.log('previewMultiSwapResult:', previewMultiSwapResult.out);
    }
};

main();