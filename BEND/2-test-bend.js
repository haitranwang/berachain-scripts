const { Web3 } = require('web3');
const chainConfig = require('../config/chain').defaultChain;
const web3 = new Web3 (chainConfig.jsonRpcEndpoint);
const { execute, query } = require('../utils/functions');
const InitializableImmutableAdminUpgradeabilityProxy = require('./artifacts/InitializableImmutableAdminUpgradeabilityProxy.json');
const LendingContract = require('./artifacts/LendingContract.json');
const GetReward = require('./artifacts/GetRewardContract.json');


const account = chainConfig.account;
const privateKey = chainConfig.privateKey;

const main = async () => {
    const LendingContractABI = LendingContract.abi;
    const GetRewardABI = GetReward.abi;
    const lendingToken = chainConfig.erc20Tokens.HONEY;
    const supplyToken = chainConfig.erc20Tokens.WETH;
    const amount = '50000000000000';
    const interestRateMode = '2';
    const referralCode = '0';
    const rateMode = '2';
    const onBehalfOf = chainConfig.account;

    // use attached proxy contract
    const proxyAddress = chainConfig.bendProxyContract;

    const getRewardBENDAddress = chainConfig.getRewardBENDContract;
    // supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
    const supplyArgs = [
        supplyToken,
        amount,
        onBehalfOf,
        '18'
    ]

    // supply
    const supplyResult = await execute(
        account,
        privateKey,
        proxyAddress,
        LendingContractABI,
        'supply',
        supplyArgs
    );

    // console.log(supplyResult);

    // // borrow
    // const borrowResult = await execute(
    //     account,
    //     privateKey,
    //     proxyAddress,
    //     LendingContractABI,
    //     'borrow',
    //     [lendingToken, amount, interestRateMode, referralCode, onBehalfOf]
    // );

    // console.log(borrowResult);

    // getReward
    // const getRewardArgs = [
    //     account,
    // ]

    // const getRewardResult = await execute(
    //     account,
    //     privateKey,
    //     getRewardBENDAddress,
    //     GetRewardABI,
    //     'getReward',
    //     getRewardArgs
    // );

    // console.log(getRewardResult);

    // repay
    // const repayArgs = [
    //     lendingToken,
    //     amount,
    //     rateMode,
    //     onBehalfOf,
    // ]

    // const repayResult = await execute(
    //     account,
    //     privateKey,
    //     proxyAddress,
    //     LendingContractABI,
    //     'repay',
    //     repayArgs
    // );

    // console.log(repayResult);

    // withdraw
    const withdrawArgs = [
        supplyToken,
        amount,
        onBehalfOf,
    ]

    const withdrawResult = await execute(
        account,
        privateKey,
        proxyAddress,
        LendingContractABI,
        'withdraw',
        withdrawArgs
    );

    console.log(withdrawResult);

}

main();