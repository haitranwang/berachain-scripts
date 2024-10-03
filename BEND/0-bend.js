const { Web3 } = require('web3');
const fs = require("fs");
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);
const { execute, query, get_token_decimals, get_token_name, process_allowance } = require('../utils/functions');
const LendingContract = require('./artifacts/LendingContract.json');
const GetReward = require('./artifacts/GetRewardContract.json');
const Erc20ABI = require('../BEX/artifacts/Erc20.json');

// CONFIG
const TRADING_TIMES = 2;
let base_amount_percentage_range = [5, 15]; // take token balance percentage from 5% to 15% to trade
const delayInMillisecondsFrom = 150_000; //1000 - 1 second
const delayInMillisecondsTo = 600_000;
const supplyTokenList = [
    [chainConfig.erc20Tokens.WETH, '18'],
    // [chainConfig.erc20Tokens.WBTC, '8'],
    // [chainConfig.erc20Tokens.WBTC, '8']
]

const interestRateMode = '2';
const rateMode = '2';

const main = async () => {
    const LendingContractABI = LendingContract.abi;
    const GetRewardABI = GetReward.abi;

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
            // await delay_time();
            let random_number = Math.floor(Math.random() * supplyTokenList.length);
            let supplyToken = supplyTokenList[random_number][0];
            let referralCode = supplyTokenList[random_number][1];
            let supplyToken_decimals = await get_token_decimals(supplyToken);
            let supplyToken_name = await get_token_name(supplyToken);
            let base_amount = await get_base_amount(supplyToken, supplyToken_decimals, account);
            const proxyAddress = chainConfig.bendProxyContract;

            if (base_amount > 0) {
                console.log('-----SUPPLYING TOKEN:', supplyToken_name, 'BASE AMOUNT:', base_amount);
                // use attached proxy contract
                process_allowance(supplyToken, account, privateKey, proxyAddress, base_amount);
                // supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
                const supplyArgs = [
                    supplyToken,
                    base_amount.toString(),
                    account,
                    referralCode
                ]
                try {
                    const supplyResult = await execute(
                        account,
                        privateKey,
                        proxyAddress,
                        LendingContractABI,
                        'supply',
                        supplyArgs
                    );
                    if (supplyResult[0] == 1) {
                        console.log('\u001b[' + 32 + 'm' + 'SUCCESSFUL SUPPLY ' + parseFloat(parseFloat(base_amount) / (parseFloat(10) ** parseFloat(supplyToken_decimals))) + ' ' + supplyToken_name + '\nwith Tx Hash: ' + supplyResult[1] + '\u001b[0m\n')
                    } else {
                        console.log('\u001b[' + 31 + 'm' + 'FAILED SUPPLY ' + supplyToken_name + '\nwith Tx Hash: ' + supplyResult[1] + '\u001b[0m\n')
                    }

                    await delay_time();
                } catch (error) {
                    console.log('-----ERROR FOR SUPPLY:', error);
                }
                // query total amount of HONEY that user can borrow
                const totalHONEYAmountCanBorrow = await get_available_amount_borrow_HONEY(account, LendingContractABI);

                // make random percentage to borrow HONEY from base_amount_percentage_range
                let random_percentage = Math.floor(Math.random() * (base_amount_percentage_range[1] - base_amount_percentage_range[0] + 1)) + base_amount_percentage_range[0];
                let borrow_amount = parseFloat(totalHONEYAmountCanBorrow) * parseFloat(random_percentage / 100);
                // Round
                borrow_amount = customRound(parseFloat(borrow_amount));

                let referralCodeHONEY = 0;
                // borrow(address asset, uint256 amount, uint256 interesRateMode, uint16 referralCode, address onBehalfOf)
                const borrowArgs = [
                    chainConfig.erc20Tokens.HONEY,
                    borrow_amount.toString(),
                    interestRateMode,
                    referralCodeHONEY,
                    account,
                ]
                try {
                    const borrowResult = await execute(
                        account,
                        privateKey,
                        proxyAddress,
                        LendingContractABI,
                        'borrow',
                        borrowArgs
                    );

                    if (borrowResult[0] == 1) {
                        console.log('\u001b[' + 32 + 'm' + 'SUCCESSFUL BORROW ' + parseFloat(parseFloat(borrow_amount) / (parseFloat(10) ** 18)) + ' HONEY\nwith Tx Hash: ' + borrowResult[1] + '\u001b[0m\n')
                    } else {
                        console.log('\u001b[' + 31 + 'm' + 'FAILED BORROW HONEY\nwith Tx Hash: ' + borrowResult[1] + '\u001b[0m\n')
                    }

                    await delay_time();
                } catch (error) {
                    console.log('-----ERROR FOR BORROW:', error);
                }

                // getReward
                const getRewardArgs = [
                    account,
                ]
                try {
                    const getRewardResult = await execute(
                        account,
                        privateKey,
                        chainConfig.getRewardBENDContract,
                        GetRewardABI,
                        'getReward',
                        getRewardArgs
                    );

                    if (getRewardResult[0] == 1) {
                        console.log('\u001b[' + 32 + 'm' + 'SUCCESSFUL GET ALL REWARD\nwith Tx Hash: ' + getRewardResult[1] + '\u001b[0m\n')
                    }

                    await delay_time();
                } catch (error) {
                    console.log('-----ERROR FOR GET REWARD:', error);
                }

                let total_dept_base = await get_total_debt_base(account, LendingContractABI);
                console.log('-----Total dept base:', total_dept_base);

                // Repay random percentage of HONEY from base_amount_percentage_range
                let repay_amount = total_dept_base;

                // make random percentage to repay HONEY from base_amount_percentage_range
                let random_percentage_repay = Math.floor(Math.random() * (base_amount_percentage_range[1] - base_amount_percentage_range[0] + 1)) + base_amount_percentage_range[0];
                repay_amount = parseFloat(repay_amount) * parseFloat(random_percentage_repay / 100);
                console.log('-----REPAY AMOUNT:', repay_amount);
                process_allowance(chainConfig.erc20Tokens.HONEY, account, privateKey, proxyAddress, repay_amount);

                // repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf)
                const repayArgs = [
                    chainConfig.erc20Tokens.HONEY,
                    repay_amount.toString(),
                    rateMode,
                    account,
                ]
                try {
                    const repayResult = await execute(
                        account,
                        privateKey,
                        proxyAddress,
                        LendingContractABI,
                        'repay',
                        repayArgs
                    );

                    if (repayResult[0] == 1) {
                        console.log('\u001b[' + 32 + 'm' + 'SUCCESSFUL REPAY ' + parseFloat(parseFloat(repay_amount) / (parseFloat(10) ** 18)) + ' HONEY\nwith Tx Hash: ' + repayResult[1] + '\u001b[0m\n')
                    } else {
                        console.log('\u001b[' + 31 + 'm' + 'FAILED REPAY HONEY\nwith Tx Hash: ' + repayResult[1] + '\u001b[0m\n')
                    }
                } catch (error) {
                    console.log('-----ERROR FOR REPAY:', error);
                }

            } else {
                console.log('-----NOT ENOUGH BALANCE OF TOKEN:', base_amount, supplyToken_name);
                console.log('Check customRound function');
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

async function get_available_amount_borrow_HONEY(account, LendingContractABI) {
    const userAccountData = await query(
        chainConfig.bendProxyContract,
        LendingContractABI,
        'getUserAccountData',
        [account]
    );
    return parseFloat(userAccountData.availableBorrowsBase) * 10**10;
}

async function get_total_debt_base(account, LendingContractABI) {
    const userAccountData = await query(
        chainConfig.bendProxyContract,
        LendingContractABI,
        'getUserAccountData',
        [account]
    );
    return parseFloat(userAccountData.totalDebtBase) * 10**10;
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