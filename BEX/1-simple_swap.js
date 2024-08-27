const { Web3 } = require('web3');
const BeraCrocMultiSwapABI = require('./artifacts/BeraCrocMultiSwap.json');
const Erc20ABI = require('./artifacts/ERC20.json');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);

// CONFIG
const token_base = chainConfig.erc20Tokens.HONEY;
const base_amount = '10000000000000000';
const token_quote = chainConfig.erc20Tokens.WBERA;
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

const main = async () => {
    // query token base name
    const tokenBaseName = await query(
        token_base,
        Erc20ABI.abi,
        'name',
        []
    );

    // query token base decimals
    const tokenBaseDecimals = await query(
        token_base,
        Erc20ABI.abi,
        'decimals',
        []
    );

    // query token quote name
    const tokenQuoteName = await query(
        token_quote,
        Erc20ABI.abi,
        'name',
        []
    );

    // query token quote decimals
    const tokenQuoteDecimals = await query(
        token_quote,
        Erc20ABI.abi,
        'decimals',
        []
    );
    for (let i = 0; i < 2; i++) {
        const SwapStep = {
            poolIdx: '36000',
            base: token_base,
            quote: token_quote,
            isBuy: is_buy
        }

        // query previewMultiSwap
        const previewMultiSwapArgs = [
            [SwapStep],
            '10000000000000',
        ];

        const previewMultiSwapResult = await query(
            contractAddress,
            contractABI,
            'previewMultiSwap',
            previewMultiSwapArgs
        );

        const multiSwapArgs = [
            [SwapStep],
            '10000000000000000',
            (previewMultiSwapResult.out - BigInt(parseInt(parseFloat(previewMultiSwapResult.out) * slippage / 100))).toString()
        ];

        let result = await execute(
            account,
            privateKey,
            contractAddress,
            contractABI,
            'multiSwap',
            multiSwapArgs
        );

        if (result[0] == 1) {
            console.log('\u001b[' + 32 + 'm' + 'SUCCESSFUL SWAP ' + parseFloat(parseFloat(base_amount) / (parseFloat(10) ** parseFloat(tokenBaseDecimals))) + ' ' + tokenBaseName + ' for ' + tokenQuoteName + '\nwith Tx Hash: ' + result[1] + '\u001b[0m\n')
        } else {
            console.log('\u001b[' + 31 + 'm' + 'FAILED SWAP ' + tokenBaseName / tokenBaseDecimals + ' for ' + tokenQuoteName + '\nwith Tx Hash: ' + result[1] + '\u001b[0m\n')
        }
    }
};

main();