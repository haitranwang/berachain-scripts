const { Web3 } = require('web3');
const fs = require("fs");
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);
const { execute, query, get_token_decimals, get_token_name, process_allowance } = require('../utils/functions');
const HoneyVaultRouter = require('./artifacts/HoneyVaultRouter.json');
const Erc20ABI = require('../BEX/artifacts/Erc20.json');

// CONFIG
const TRADING_TIMES = 2;
let base_amount_percentage_range = [5, 15]; // take token balance percentage from 5% to 15% to trade
const delayInMillisecondsFrom = 10_000; //1000 - 1 second
const delayInMillisecondsTo = 25_000;
const redeemAssetList = [
    [chainConfig.erc20Tokens.HONEY],
]
const redeemToken = chainConfig.erc20Tokens.USDC;

const mintAssetList = [
    [chainConfig.erc20Tokens.USDC],
]

const mintToken = chainConfig.erc20Tokens.HONEY;

const main = async () => {
    const HoneyVaultRouterABI = HoneyVaultRouter.abi;

    let list_accounts = fs.readFileSync("../config/accounts-main.txt", "utf8");
    list_accounts = list_accounts.split("\n");
    list_accounts.pop();
    for (let acc = 0; acc < list_accounts.length; acc++) {
    // for (let acc = 0; acc < 1; acc++) {
        let account = list_accounts[acc].split("-")[0].toString();
        let privateKey = list_accounts[acc].split("-")[1].toString();
        // remove \r from privateKey
        privateKey = privateKey.replace('\r', '');

        // let account = chainConfig.account;
        // let privateKey = chainConfig.privateKey;
        console.log('-----Processing wallet:', account);
        console.log('-----Processing privatekey:', privateKey)
        for (let i = 0; i < TRADING_TIMES; i++) {
            await delay_time();
            let random_number = Math.floor(Math.random() * redeemAssetList.length);
            let redeemAsset = redeemAssetList[random_number][0];
            let redeemAsset_decimals = await get_token_decimals(redeemAsset);
            let redeemAsset_name = await get_token_name(redeemAsset);
            let base_amount_redeem = await get_base_amount(redeemAsset, redeemAsset_decimals, account);
            if (base_amount_redeem > 0) {
                process_allowance(redeemAsset, account, privateKey, chainConfig.honeyVaultRouter, base_amount_redeem);
                // redeem
                const redeemArgs = [
                    redeemToken,
                    base_amount_redeem.toString(),
                    account
                ]

                try {
                    const redeemResult = await execute(
                        account,
                        privateKey,
                        chainConfig.honeyVaultRouter,
                        HoneyVaultRouterABI,
                        'redeem',
                        redeemArgs
                    );
                    if (redeemResult[0] == 1) {
                        console.log('\u001b[' + 32 + 'm' + 'SUCCESSFUL REDEEM ' + parseFloat(parseFloat(base_amount_redeem) / (parseFloat(10) ** 18)) + ' HONEY\nwith Tx Hash: ' + redeemResult[1] + '\u001b[0m\n')
                    } else {
                        console.log('\u001b[' + 31 + 'm' + 'FAILED REDEEM \nwith Tx Hash: ' + redeemResult[1] + '\u001b[0m\n')
                    }
                } catch (error) {
                    console.log('REDEEM', redeemAsset_name, 'FAILED:', error);
                }
            }
            await delay_time();
            random_number = Math.floor(Math.random() * mintAssetList.length);
            let mintAsset = mintAssetList[random_number][0];
            let mintAsset_decimals = await get_token_decimals(mintAsset);
            let mintAsset_name = await get_token_name(mintAsset);
            let base_amount_mint = await get_base_amount(mintAsset, mintAsset_decimals, account);
            if (base_amount_mint > 0) {
                process_allowance(mintAsset, account, privateKey, chainConfig.honeyVaultRouter, base_amount_mint);
                // mint
                const mintArgs = [
                    mintAsset,
                    base_amount_mint.toString(),
                    account
                ]

                try {
                    const mintResult = await execute(
                        account,
                        privateKey,
                        chainConfig.honeyVaultRouter,
                        HoneyVaultRouterABI,
                        'mint',
                        mintArgs
                    );
                    console.log('mintResult:', mintResult);
                    if (mintResult[0] == 1) {
                        console.log('\u001b[' + 32 + 'm' + 'SUCCESSFUL MINT ' + parseFloat(parseFloat(base_amount_mint) / (parseFloat(10) ** 6)) + ' HONEY\nwith Tx Hash: ' + mintResult[1] + '\u001b[0m\n')
                    } else {
                        console.log('\u001b[' + 31 + 'm' + 'FAILED MINT \nwith Tx Hash: ' + mintResult[1] + '\u001b[0m\n')
                    }
                } catch (error) {
                    console.log('MINT', mintAsset_name, 'FAILED:', error);
                }
            }
        }
    }
}

function customRound(number) {
    if (number < 1) {
        return Number(number.toFixed(6));  // Round to 3 decimal places
    } else if (number < 10) {
        return Number(number.toFixed(1));  // Round to 2 decimal places
    } else {
        return Math.round(number);  // Round to the nearest integer
    }
}

async function delay_time() {
    let delay_time = Math.floor(Math.random() * (delayInMillisecondsTo - delayInMillisecondsFrom + 1)) + delayInMillisecondsFrom;
    // convert delay_time to mm:ss
    let minutes = Math.floor(delay_time / 60000);
    let seconds = ((delay_time % 60000) / 1000).toFixed(0);
    console.log('DELAY TIME:', minutes + ':' + (seconds < 10 ? '0' : '') + seconds);
    await new Promise(r => setTimeout(r, delay_time));
}

async function get_base_amount(token_base, token_base_decimals, account) {
    let total_balance;
    if (token_base != chainConfig.nativeToken) {
        // query balance in token base of account
        total_balance = await query(
            token_base,
            Erc20ABI.abi,
            'balanceOf',
            [account]
        );
        // convert total_balance divide by decimals
        total_balance = parseFloat(total_balance) / (10 ** parseFloat(token_base_decimals));
    } else {
        // query balance in token base of account
        total_balance = await web3.eth.getBalance(account);
        // convert total_balance divide by decimals
        total_balance = parseFloat(total_balance) / (10 ** 18);
    }

    // make a random percentage to choose base amount
    let random_percentage = Math.floor(Math.random() * (base_amount_percentage_range[1] - base_amount_percentage_range[0] + 1)) + base_amount_percentage_range[0];
    base_amount = parseFloat(total_balance) * parseFloat(random_percentage / 100);
    console.log('RANDOME PERCENTAGE:', Math.floor(Math.random() * (base_amount_percentage_range[1] - base_amount_percentage_range[0] + 1)) + base_amount_percentage_range[0]);
    // Round to 2 after comma
    // base_amount = base_amount.toFixed(0);

    if (token_base != chainConfig.nativeToken) {
        base_amount = customRound(parseFloat(base_amount)) * (10 ** parseFloat(token_base_decimals));
    } else {
        base_amount = customRound(parseFloat(base_amount)) * (10 ** 18);
    }

    return Math.floor(base_amount);
}

main();