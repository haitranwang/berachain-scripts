// Swap (RANDOM-RANDOM) random amount (from 0.1 to 0.35) from BEX
// Delay random time (from 5 to 15 minutes)
const { Web3 } = require('web3');
const fs = require("fs");
const BeraCrocMultiSwapABI = require('./artifacts/BeraCrocMultiSwap.json');
const Erc20ABI = require('./artifacts/Erc20.json');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);
const { execute, query } = require('../utils/functions');

// CONFIG
const TRADING_TIMES = 5;
let base_amount_percentage_range = [5, 15]; // take token balance percentage from 5% to 15% to trade
const slippage = 35;
const is_buy_range = [true, false, true, false];
const spender = chainConfig.bexBeraCrocMultiSwap;
const delayInMillisecondsFrom = 100_000; //1000 - 1 second
const delayInMillisecondsTo = 1000_000;
// token base, token quote
const pairs_list = [
    [chainConfig.erc20Tokens.HONEY, chainConfig.erc20Tokens.WBERA, '36000'],
    [chainConfig.erc20Tokens.WBERA, chainConfig.erc20Tokens.USDC, '36000'],
    [chainConfig.erc20Tokens.WBERA, chainConfig.erc20Tokens.DAI, '36002'],
    [chainConfig.erc20Tokens.WBERA, chainConfig.erc20Tokens.WETH, '36001'],
    [chainConfig.erc20Tokens.USDT, chainConfig.erc20Tokens.USDC, '36000'],
    [chainConfig.erc20Tokens.USDT, chainConfig.erc20Tokens.bHONEY, '36002'],
    [chainConfig.erc20Tokens.DAI, chainConfig.erc20Tokens.aHONEY, '36000'],
]

const contractAddress = chainConfig.bexBeraCrocMultiSwap;
const contractABI = BeraCrocMultiSwapABI.abi;

const main = async () => {
    let list_accounts = fs.readFileSync("../config/accounts-main.txt", "utf8");
    list_accounts = list_accounts.split("\n");
    list_accounts.pop();
    for (let acc = 0; acc < list_accounts.length; acc++) {
        let account = list_accounts[acc].split("-")[0].toString();
        let privateKey = list_accounts[acc].split("-")[1].toString();
        // remove \r from privateKey
        privateKey = privateKey.replace('\r', '');
        console.log('-----Processing wallet:', account);
        console.log('-----Processing privatekey:', privateKey)
        for (let i = 0; i < TRADING_TIMES; i++) {
            // update delay time
            let delay_time = Math.floor(Math.random() * (delayInMillisecondsTo - delayInMillisecondsFrom + 1)) + delayInMillisecondsFrom;
            // convert delay_time to mm:ss
            let minutes = Math.floor(delay_time / 60000);
            let seconds = ((delay_time % 60000) / 1000).toFixed(0);
            console.log('DELAY TIME:', minutes + ':' + (seconds < 10 ? '0' : '') + seconds);
            await new Promise(r => setTimeout(r, delay_time));
            console.log('TRADING TIME:', i + 1);
            // make a random number to choose token base and token quote
            let random_number = Math.floor(Math.random() * pairs_list.length);
            let token_base = pairs_list[random_number][0];
            let token_quote = pairs_list[random_number][1];
            let poolIdx = pairs_list[random_number][2];

            // make a random number to choose is_buy
            let is_buy = is_buy_range[Math.floor(Math.random() * is_buy_range.length)];

            let base_amount = 0;
            let tokenBaseDecimals;
            if (is_buy == true) {
                // query token base decimals
                tokenBaseDecimals = await get_token_decimals(token_base);
                // convert tokenBaseDecimals to string
                tokenBaseDecimals = tokenBaseDecimals.toString();

                base_amount = await get_base_amount(token_base, tokenBaseDecimals, account);
                try {
                    await process_allowance(token_base, account, privateKey, spender, base_amount);
                } catch (error) {
                    console.log('Error:', error);
                }
            } else {
                // query token base decimals
                tokenBaseDecimals = await get_token_decimals(token_quote);
                // convert tokenBaseDecimals to string
                tokenBaseDecimals = tokenBaseDecimals.toString();
                base_amount = await get_base_amount(token_quote, tokenBaseDecimals, account);
                try {
                    await process_allowance(token_quote, account, privateKey, spender, base_amount);
                } catch (error) {
                    console.log('Error:', error);
                }
            }
            if (base_amount == 0) {
                console.log('Base amount is 0. Skip this round');
            } else {
                process_swap_step(poolIdx, token_base, token_quote, is_buy, base_amount, tokenBaseDecimals, account, privateKey);
            }
        }
    }
};

async function process_swap_step(poolIdx, token_base, token_quote, is_buy, base_amount, tokenBaseDecimals, account, privateKey) {
    // query token base name
    let tokenBaseName = await get_token_name(token_base);
    console.log('1. Token Base Name:', tokenBaseName);
    // query token quote name
    let tokenQuoteName = await get_token_name(token_quote);
    console.log('2. Token Quote Name:', tokenQuoteName);

    let SwapStep = {
        poolIdx: poolIdx,
        base: token_base,
        quote: token_quote,
        isBuy: is_buy
    }

    // console.log('Swap Step:', SwapStep);

    // query previewMultiSwap
    const previewMultiSwapArgs = [
        [SwapStep],
        base_amount,
    ];

    console.log('Preview Multi Swap Args:', previewMultiSwapArgs);
    let previewMultiSwapResult;
    try {
        previewMultiSwapResult = await query(
            contractAddress,
            contractABI,
            'previewMultiSwap',
            previewMultiSwapArgs
        );
    } catch (error) {
        console.log('Error:', error);
    }
    console.log('3. Preview Multi Swap Result:', previewMultiSwapResult);

    // console.log('Preview Multi Swap Result:', previewMultiSwapResult);

    const multiSwapArgs = [
        [SwapStep],
        base_amount,
        (previewMultiSwapResult.out - BigInt(parseInt(parseFloat(previewMultiSwapResult.out) * slippage / 100))).toString()
    ];

    console.log('Swap Step2:', multiSwapArgs);

    try {
        console.log('4. Processing Swap...');
        let result = await execute(
            account,
            privateKey,
            contractAddress,
            contractABI,
            'multiSwap',
            multiSwapArgs
        );

        if (is_buy == false) {
            let tmp = tokenBaseName;
            tokenBaseName = tokenQuoteName;
            tokenQuoteName = tmp;
        }

        if (result[0] == 1) {
            console.log('\u001b[' + 32 + 'm' + 'SUCCESSFUL SWAP ' + parseFloat(parseFloat(base_amount) / (parseFloat(10) ** parseFloat(tokenBaseDecimals))) + ' ' + tokenBaseName + ' for ' + tokenQuoteName + '\nwith Tx Hash: ' + result[1] + '\u001b[0m\n')
        } else {
            console.log('\u001b[' + 31 + 'm' + 'FAILED SWAP ' + tokenBaseName / tokenBaseDecimals + ' for ' + tokenQuoteName + '\nwith Tx Hash: ' + result[1] + '\u001b[0m\n')
        }
    } catch (error) {
        if (is_buy == false) {
            let tmp = tokenBaseName;
            tokenBaseName = tokenQuoteName;
            tokenQuoteName = tmp;
        }
        console.log('Error:', error);
        console.log('\u001b[' + 31 + 'm' + 'FAILED SWAP 2 ' + tokenBaseName + ' for ' + tokenQuoteName + '\nwith Tx Hash: ' + result[1] + '\u001b[0m\n')
    }
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

        // get balance of token base in account
        let balance = await query(
            token_base,
            Erc20ABI.abi,
            'balanceOf',
            [account]
        );

        // if allowance is not enough, approve
        if (allowance < base_amount ) {
            await execute(
                account,
                privateKey,
                token_to_approve_contract,
                Erc20ABI.abi,
                'approve',
                [spender, balance]
            );
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

function customRound(number) {
    if (number < 1) {
        return Number(number.toFixed(3));  // Round to 3 decimal places
    } else if (number < 10) {
        return Number(number.toFixed(2));  // Round to 2 decimal places
    } else {
        return Math.round(number);  // Round to the nearest integer
    }
}

main();