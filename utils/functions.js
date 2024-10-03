const { Web3 } = require('web3');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);
const Erc20ABI = require('../BEX/artifacts/Erc20.json');

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

async function process_allowance(token_base, account, privateKey, spender, base_amount) {
    if (token_base != chainConfig.nativeToken) {
        token_to_approve_contract = token_base;
        // query allowance of token base with spender
        allowance = await query(
            token_base,
            Erc20ABI.abi,
            'allowance',
            [account, spender]
        );
        // console.log('-----ALLOWANCE:', allowance);

        // get balance of token base in account
        let balance = await query(
            token_base,
            Erc20ABI.abi,
            'balanceOf',
            [account]
        );
        // console.log('-----BALANCE:', balance);

        // if allowance is not enough, approve
        if (allowance < base_amount ) {
            let appr = await execute(
                account,
                privateKey,
                token_to_approve_contract,
                Erc20ABI.abi,
                'approve',
                [spender, balance]
            );
            console.log('-----APPROVE:', appr);
            // Delay 5 seconds
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

async function get_token_decimals(token) {
    if (token != chainConfig.nativeToken) {
        // query token base decimals
        return await query(
            token,
            Erc20ABI.abi,
            'decimals',
            []
        );
    } else {
        return 18;
    }
}

async function get_token_name(token) {
    if (token != chainConfig.nativeToken) {
        // query token base decimals
        return await query(
            token,
            Erc20ABI.abi,
            'name',
            []
        );
    } else {
        return 'BERA';
    }
}

module.exports = {
    execute,
    query,
    process_allowance,
    get_token_decimals,
    get_token_name,
};