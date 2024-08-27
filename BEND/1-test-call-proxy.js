const { Web3 } = require('web3');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);
const InitializableImmutableAdminUpgradeabilityProxy = require('./artifacts/InitializableImmutableAdminUpgradeabilityProxy.json');
const LendingContract = require('./artifacts/LendingContract.json');

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

const main = async () => {
    const InitializableImmutableAdminUpgradeabilityProxyABI = InitializableImmutableAdminUpgradeabilityProxy.abi;
    const LendingContractABI = LendingContract.abi;
    let address = '0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03';
    let amount = '10';
    let interestRateMode = '2';
    let referralCode = '0';
    let onBehalfOf = '0x70Dbbcb694653313502250259A6757D690214193';

    // use attached proxy contract
    const proxyAddress = '0x30A3039675E5b5cbEA49d9a5eacbc11f9199B86D';
    const proxyContract = new web3.eth.Contract(LendingContractABI, proxyAddress);

    // call implementation contract method
    const result = await execute(
        account,
        privateKey,
        proxyAddress,
        LendingContractABI,
        'borrow',
        [address, amount, interestRateMode, referralCode, onBehalfOf]
    );

    console.log('result:', result);
}

main();