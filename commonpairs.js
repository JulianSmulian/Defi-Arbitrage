require('dotenv').config()
//const BigNumber = require('bignumber.js');
const express = require('express')
var fs = require('fs');
const bodyParser = require('body-parser')
const http = require('http')
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const moment = require('moment-timezone')
const numeral = require('numeral')
const _ = require('lodash')
const axios = require('axios')
const UNISWAP_ROUTER_ABI = require('./abis/uniswap/uni_router_abi.json')
const UNISWAP_FACTORY_ABI = require('./abis/uniswap/uni_factory_abi.json')
const UNI_PAIR_ABI = require('./abis/uniswap/uni_pair_abi.json')
const SUSHI_ROUTER_ABI = require('./abis/sushiswap/sushi_router_abi.json')
const SUSHI_FACTORY_ABI =require('./abis/sushiswap/sushi_factory_abi.json')
const SUSHI_PAIR_ABI = require('./abis/sushiswap/sushi_pair_abi.json')
const KYBER_EXCHANGE_ABI = require('./abis/kyberswap/kyber_exchange_abi.json')
const ONEINCH_ABI = require('./abis/oneinch/oneinch_abi.json')
const AAVE_FLASHLOAN_ABI = require('./abis/aave/aave_flashloan_abi.json')
const ERC20_ABI = require('./abis/erc20/erc20_abi.json')


let pairsize = 50
const sushi_pairArray =[]
const uni_pairArray = []
const combined_Array = []
// SERVER CONFIG
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))

const web3 = new Web3(process.env.RPC_URL)

const UNISWAP_FACTORY_ADDRESS = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
const uniswapFactoryContract = new web3.eth.Contract(UNISWAP_FACTORY_ABI, UNISWAP_FACTORY_ADDRESS)

// Uniswap Factory Contract: https://etherscan.io/address/0xc0a47dfe034b400b47bdad5fecda2621de6c4d95#code
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const uniswapRouterContract = new web3.eth.Contract(UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS)

const SUSHI_FACTORY_ADDRESS = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
const sushiFactoryContract = new web3.eth.Contract(SUSHI_FACTORY_ABI, SUSHI_FACTORY_ADDRESS)

const SUSHI_ROUTER_ADDRESS = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
const sushiRouterContract = new web3.eth.Contract(SUSHI_ROUTER_ABI,SUSHI_ROUTER_ADDRESS)

const KYBER_EXCHANGE_ADDRESS = '0x818e6fecd516ecc3849daf6845e3ec868087b755'
const kyberRateContract = new web3.eth.Contract(KYBER_EXCHANGE_ABI, KYBER_EXCHANGE_ADDRESS)




async function getSushiPairs(){
 let pairLength = await sushiFactoryContract.methods.allPairsLength().call()
 for (let i = 0; i < pairsize; i++) {
   let pair = await sushiFactoryContract.methods.allPairs(i).call()
   let SUSHI_PAIR_ADDRESS = pair
   let sushiPairContract = new web3.eth.Contract(SUSHI_PAIR_ABI,SUSHI_PAIR_ADDRESS)
   //let liquidity = await sushiPairContract.methods.getReserves().call()
   //let real_liquidity = web3.utils.fromWei(liquidity[1])
   //console.log('LIQUIDITY', web3.utils.fromWei(liquidity[1]),'Ether');
   try{
   let pairs0 = await sushiPairContract.methods.token0().call()
   let PAIR_ADDRESS0 = pairs0
   let sushiPairToken0Contract = new web3.eth.Contract(ERC20_ABI,PAIR_ADDRESS0)
   let pairs0symbol = await sushiPairToken0Contract.methods.symbol().call()

   let pairs1 = await sushiPairContract.methods.token1().call()
   let PAIR_ADDRESS1 = pairs1
   let sushiPairToken1Contract = new web3.eth.Contract(ERC20_ABI,PAIR_ADDRESS1)
   let pairs1symbol = await sushiPairToken1Contract.methods.symbol().call()


  console.log('Pair',i, pairs0symbol,pairs1symbol)
  const sushi_pair = pairs0symbol+'-'+pairs1symbol
  sushi_pairArray.push({sushi_pair})
}catch(e){
  console.log(e)
  continue;

}}
sushi_pairArray.sort(function(a,b){
    return a.pairings.localeCompare(b.pairings);
})


}

getSushiPairs()

async function getUniPairs(){
 let pairLength = await uniswapFactoryContract.methods.allPairsLength().call()
 for (let i = 0; i < pairsize; i++) {
   let pair = await uniswapFactoryContract.methods.allPairs(i).call()
   let UNI_PAIR_ADDRESS = pair
   let uniPairContract = new web3.eth.Contract(UNI_PAIR_ABI,UNI_PAIR_ADDRESS)

   //let liquidity = await uniPairContract.methods.getReserves().call()
   //let real_liquidity = web3.utils.fromWei(liquidity[1])
   //console.log('LIQUIDITY', web3.utils.fromWei(liquidity[1]),'Ether');
   try{
   let pairs0 = await uniPairContract.methods.token0().call()
   let PAIR_ADDRESS0 = pairs0
   let uniPairToken0Contract = new web3.eth.Contract(ERC20_ABI,PAIR_ADDRESS0)
   let pairs0symbol = await uniPairToken0Contract.methods.symbol().call()

   let pairs1 = await uniPairContract.methods.token1().call()
   let PAIR_ADDRESS1 = pairs1
   let uniPairToken1Contract = new web3.eth.Contract(ERC20_ABI,PAIR_ADDRESS1)
   let pairs1symbol = await uniPairToken1Contract.methods.symbol().call()


  console.log('Pair',i, pairs0symbol,pairs1symbol)
  const uni_pair = pairs0symbol+'-'+pairs1symbol
  uni_pairArray.push({uni_pair})
}catch(e){
  console.log(e)
  continue;

}}

combined_Array.push(sushi_pairArray.concat(uni_pairArray));
combined_Array.sort(function(a,b){
    return a.pairings.localeCompare(b.pairings);
})
console.log(combined_Array)
fs.writeFileSync('./abis/erc20/pairs.txt', JSON.stringify(combined_Array));
}
getUniPairs()

async function pairfile(arr){
await fs.writeFileSync('./abis/erc20/pairs.txt', arr.join('\n'));
}
