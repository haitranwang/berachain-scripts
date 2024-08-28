const { Web3 } = require('web3');
const BeraSwapDexABI = require('./artifacts/BeraCrocSwapDex.json');
const Erc20ABI = require('./artifacts/ERC20.json');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);
const { WarmPathEncoder } = require('@crocswap-libs/sdk');

// CONFIG
const poolContract = chainConfig.BEXpools['HONEY-WBERA'];
const tokenBase = chainConfig.erc20Tokens.HONEY;
const tokenQuote = chainConfig.erc20Tokens.WBERA;
const amountTokenBase = '10000001630841553';
const callPath = '128';
const fixedAmountDeposits = {
    '0.01-BERA-HONEY': '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000e4aaf1351de4c0264c5c7056ef3777b41bd8e0300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008ca00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008d72dc4d2d28000000000000000000000000000000000000000000000007d36c4d45f808000000000000000000000000000000000000000000000000000834f5067631b400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d28d852cbcc68dcec922f6d5c7a8185dbaa104b7',
    '0.02-BERA-HONEY': '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000e4aaf1351de4c0264c5c7056ef3777b41bd8e0300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008ca0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000834f2bb9ba35100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d28d852cbcc68dcec922f6d5c7a8185dbaa104b7',

}

const account = chainConfig.account;
const privateKey = chainConfig.privateKey;
const contractAddress = chainConfig.bexCrocSwapDex;
const contractABI = BeraSwapDexABI.abi;

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

async function makeEncoder(baseToken, quoteToken, poolIndex) {
    return new WarmPathEncoder(baseToken, quoteToken, poolIndex);
}

const main = async () => {
    // add LP to pool contract
    // encodeMintConc(lowerTick: number, upperTick: number, qty: bigint, qtyIsBase: boolean, limitLow: number, limitHigh: number, useSurplus: number): string;
    let lowerTick = 0;
    let upperTick = 0;
    let qty = BigInt(amountTokenBase);
    let qtyIsBase = false;
    let limitLow = 0;
    let limitHigh = 100;
    let useSurplus = 123;

    let userCmdMintConc = (await makeEncoder(tokenBase, tokenQuote, '36000')).encodeMintConc(lowerTick, upperTick, qty, qtyIsBase, limitLow, limitHigh, useSurplus);
    console.log('userCmdMintConc:', userCmdMintConc);
    // encodeMintAmbient(qty: bigint, qtyIsBase: boolean, limitLow: number, limitHigh: number, useSurplus: number): string;
    let userCmdencodeMintAmbient = (await makeEncoder(tokenBase, tokenQuote, '36000')).encodeMintAmbient(qty, qtyIsBase, limitLow, limitHigh, useSurplus);
    console.log('userCmdencodeMintAmbient:', userCmdencodeMintAmbient);
    // const receipt = await execute(
    //     account,
    //     privateKey,
    //     contractAddress,
    //     contractABI,
    //     'userCmd',
    //     [callPath, fixedAmountDeposits['0.02-BERA-HONEY']]
    // );
    // console.log('receipt:', receipt);
};

main();