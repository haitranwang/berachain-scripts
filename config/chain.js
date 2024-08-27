const bartio = {
    jsonRpcEndpoint: 'https://bartio.rpc.berachain.com/',
    currencySymbol: 'BERA',
    chainId: '80084',
    gasPrice: 1000000000,
    gasLimit: 2000000,
    broadcastTimeoutMs: 5000,
    broadcastPollIntervalMs: 1000,
    erc20Tokens: {
        'WBERA': '0x7507c1dc16935B82698e4C63f2746A2fCf994dF8',
        'HONEY': '0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03',
        'aHONEY': '0xD08391c5977ebF1a09bB5915908EF5cd95Edb7E0',
        'bHONEY': '0x1306D3c36eC7E38dd2c128fBe3097C2C2449af64',
        'USDC': '0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c',
        'USDT': '0x05D0dD5135E3eF3aDE32a9eF9Cb06e8D37A6795D',
        'DAI': '0x806Ef538b228844c73E8E692ADCFa8Eb2fCF729c',
        'WETH': '0xE28AfD8c634946833e89ee3F122C06d7C537E8A8',
    },
    BEXpools: {
        'HONEY-WBERA': '0xAB827b1Cc3535A9e549EE387A6E9C3F02F481B49',
    },
    nativeToken: '0x0000000000000000000000000000000000000000',
    bexBeraCrocMultiSwap: '0x21e2C0AFd058A89FCf7caf3aEA3cB84Ae977B73D',
    bexCrocSwapDex: '0xAB827b1Cc3535A9e549EE387A6E9C3F02F481B49',
    haloPancakeFactoryAddress: 'aura1lg3ppjltnaw59dkn904ud87xvsnurpq5xvu0qefj6qh36rxal55ql4vm2d',
    haloUniV3FactoryAddress: '0x6D826782Df65bE8E336433DF60b42247Cd80D479',
    haloPancakeRouterAddress: 'aura1y0ezfu7fkdcty5wx3v9rllw0k0n5rzvpzm2eucecsaa334cxmq7s0ugf0v',
    haloUniV3RouterAddress: '0x5B0C8dc77d18c73251A78c1CFCAd55c9fF08496d',
    haloUniV3Quoter: '0x75c02aC18755Dd6Fc2c0b0DcD05AdC309015675D',
};

let defaultChain = bartio;

defaultChain.privateKey = Buffer.from('c0646908d860a3d7fb85b685d9c2c64e51650a1ce345b841ee741ec422282273', 'hex');
defaultChain.account = '0x70Dbbcb694653313502250259A6757D690214193';

module.exports = {
    bartio,
    defaultChain,
};