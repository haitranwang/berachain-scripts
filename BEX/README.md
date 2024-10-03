# berachain-scripts for BEX
## How to use
1. Config all your accounts in accounts-main.txt file with the following format:
```address-privatekey```
Example:
```0x1234567890abcdef-0x1234567890abcdef```
2. Config script with your scenario in 0-wash-trade-with-scenario.js file with the following format:
```javascript
// CONFIG
const TRADING_TIMES = 5;
let base_amount_percentage_range = [5, 15]; // take token balance percentage from 5% to 15% to trade
const slippage = 35;
const is_buy_range = [true, false, true, false];
const spender = chainConfig.bexBeraCrocMultiSwap;
const delayInMillisecondsFrom = 10_000; //1000 - 1 second
const delayInMillisecondsTo = 200_000;
```



3. Run the script with the following command:
```node ./0-wash-trade-with-scenario.js```