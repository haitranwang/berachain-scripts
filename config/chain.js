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
        'WBTC': '0x286F1C3f0323dB9c91D1E8f45c8DF2d065AB5fae',
    },
    BEXpools: {
        'HONEY-WBERA': '0xAB827b1Cc3535A9e549EE387A6E9C3F02F481B49',
    },
    nativeToken: '0x0000000000000000000000000000000000000000',
    bexBeraCrocMultiSwap: '0x21e2C0AFd058A89FCf7caf3aEA3cB84Ae977B73D',
    bexCrocSwapDex: '0xAB827b1Cc3535A9e549EE387A6E9C3F02F481B49',
    bendProxyContract: '0x30A3039675E5b5cbEA49d9a5eacbc11f9199B86D',
    getRewardBENDContract: '0x2E8410239bB4b099EE2d5683e3EF9d6f04E321CC',
    honeyVaultRouter: '0xAd1782b2a7020631249031618fB1Bd09CD926b31',
};

let defaultChain = bartio;

defaultChain.privateKey = Buffer.from('your private key', 'hex');
defaultChain.account = 'your address';

module.exports = {
    bartio,
    defaultChain,
};