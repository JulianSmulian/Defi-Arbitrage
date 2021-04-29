https://sushiswap.vision/home  //sushiswap Pairs
https://ethereumdev.io/trading-and-arbitrage-on-ethereum-dex-get-the-rates-part-1/ nice tutorial on 1inch
https://messari.io/article/arbitraging-uniswap-and-sushiswap-in-node-js tutorial sushi and uni
https://medium.com/@epheph/using-uniswap-v2-oracle-with-storage-proofs-3530e699e1d3 Read this before Jan 26

c1 = coin 1 price
c2 = coin 2 price

tr1 = transaction 1 cost(gas & fees)
tr2 = transaction 2 cost(gas & fees)

e1 = exchange 1
e2 = exchange 2

c1.e1  --->  c2.e1  --->  c2.e2   ---> c1.e2

if( (c1.e2 - c1.e1) > (tr1 + tr2) ){Arbitrage}

1) c1 should be a stable coin UNLESS you are looking to accumulate c1.
***In a scenario where c2.e2 > c2.e1 because c2 price is falling for some reason you can still lose money(from a falling knife). c2 price may be falling across all exchanges making the loss the cost of gas AND the difference in price.
****


So basically

DONE 1) Cycle through array of coin addresses against ETH  -I.E Eth/Sushi, Eth/Aave, Eth/Comp etc.
DONE 2) Get price information from each pair using similar Uni and Sushi exchanges abi's.
DONE 3) Check if price difference between sushi and uni > .075%
4) Check against the lowest returning exchange reversing the pair -IE Eth.sushi on sushi pays 100 and Eth.sushi on uni pays 95

5) Check that difference against the total cost of gas, and the amount aave will charge.
6) If there is some amount left then initiate the transaction.     
