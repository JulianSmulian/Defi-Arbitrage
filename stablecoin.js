require('dotenv').config()
//const BigNumber = require('bignumber.js');
const express = require('express')
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
const SUSHI_ROUTER_ABI = require('./abis/sushiswap/sushi_router_abi.json')
const SUSHI_FACTORY_ABI =require('./abis/sushiswap/sushi_factory_abi.json')

const flash_amount ='1000'
const exchange_difference = .025

// SERVER CONFIG
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))

const exact_moment = require('moment') // import moment.js library
const now = exact_moment().unix() // fetch current unix timestamp
const DEADLINE = now + 15 // add 15 seconds


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



let num_uni;
let num_sushi;
let percentage_difference;
let _inputSymbol;
let _outputSymbol;
let _inputAddress = '0x'
let _outputAddress = '0x'
let ethPrice = '1000000000000000000'
let obj
let usdc = [
  { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
  { symbol: 'DAI' , address: '0x6b175474e89094c44da98b954eedeac495271d0f' }
];

let stable_pairs = [
  //{ symbol: 'BAND', address: '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55' },
  { symbol: 'SUSHI',address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2' },

]


function financial(x) {
return Number.parseFloat(x).toFixed(2);
}
//1st Check pairs at Uniswap and Sushiswap
async function checkPair(args) {
  const { position, inputSymbol, inputAddress, outputSymbol, outputAddress } = args
  let uniswapAmountsOut
  let sushiswapAmountsOut
  _inputSymbol = inputSymbol
  _outputSymbol = outputSymbol
  let time = moment().tz('America/Chicago').format()
  uniswapAmountsOut = await uniswapRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
  num_uni =uniswapAmountsOut[1]
  sushiswapAmountsOut = await sushiRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
  num_sushi =sushiswapAmountsOut[1]


  const gasPrice = await web3.eth.getGasPrice()
  const est_gas  = 120000
  let est_gascost = gasPrice * est_gas
  let est_gascostUS = est_gascost * ethPrice
  const gascost_toETH = web3.utils.fromWei(est_gascostUS.toString(), 'Ether')
  let cut = -20
  let zero = 0
  let price
  let before_gas_profit
  if (num_uni   > num_sushi && num_sushi>0){
    sushiswapAmountsOut = await sushiRouterContract.methods.getAmountsOut( uniswapAmountsOut[1],([outputAddress,inputAddress])).call()
    before_gas_profit = sushiswapAmountsOut[1] - flash_amount
    let profit = (before_gas_profit*ethPrice) - gascost_toETH
  if(profit < cut){
  stable_pairs.splice(position, 1);
  }
  if(profit > zero){
  console.log(_outputSymbol,'Un->Su',financial(profit),'USD')
   alertTerminal()
   create_record(_inputSymbol,_outputSymbol, profit, time)
 }else{
   console.log(_outputSymbol,'Un->Su',financial(profit),'USD')

 }

  }
  if (num_sushi > num_uni && num_uni>0){
    uniswapAmountsOut = await uniswapRouterContract.methods.getAmountsOut(sushiswapAmountsOut[1],([outputAddress,inputAddress])).call()
    before_gas_profit = uniswapAmountsOut[1] - flash_amount
    let profit = (before_gas_profit*ethPrice) - gascost_toETH
  if(profit < cut){
    stable_pairs.splice(position, 1);
  }
  if(profit > zero){
   console.log(_outputSymbol,'Su->Un',financial(profit),'USD')
   alertTerminal()
   create_record(_inputSymbol,_outputSymbol, profit, time)
 }else{
  console.log(_outputSymbol,'Su->Un',financial(profit),'USD')

 }
 }

    _inputAddress=inputAddress
    _outputAddress=outputAddress
}


let priceMonitor
let monitoringPrice = false


async function monitorPrice() {
  if(monitoringPrice) {return}
  monitoringPrice = true
  try {
    for (p in stable_pairs) {
          await checkPair({
          position: p,
          inputSymbol: usdc[p].symbol,
          inputAddress: usdc[p].address,
          outputSymbol: stable_pairs[p].symbol,
          outputAddress: stable_pairs[p].address,
          inputAmount: flash_amount })
    }


} catch (error) {
console.error(error)
monitoringPrice = false
clearInterval(priceMonitor)
return
}



monitoringPrice = false
}


function alertTerminal(){
  console.log("\007");
}
async function swapExactEthforTokens(){
    let address_pair = [_inputAddress,_outputAddress ]
      const moment = require('moment') // import moment.js library
      const now = moment().unix() // fetch current unix timestamp
      const DEADLINE = now + 60 // add 60 seconds
      console.log("Deadline", DEADLINE)
      // Transaction Settings
      const SETTINGS_1 = {
        gasLimit: 200000, // Override gas settings: https://github.com/ethers-io/ethers.js/issues/469
        //gasPrice: web3.utils.toWei('10', 'Gwei'),
        from: process.env.ACCOUNT, // Use your account here
        value: web3.utils.toWei(flash_amount, 'Ether') // Amount of Ether to Swap
      }

      // Perform Swap
      console.log('Performing swap...')
      let result = await uniswapRouterContract.methods.swapExactETHForTokens(1,address_pair,meAddress, DEADLINE).send(SETTINGS_1)
      console.log(`Successful Swap: https://ropsten.etherscan.io/tx/${result.transactionHash}`)
 };

async function swapExactTokensforEth(){
  let address_pair = [_outputAddress,_inputAddress ]
  // Set Deadline 1 minute from now
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  console.log("Deadline", DEADLINE)
  const SETTINGS_2 = {
    gasLimit: 200000, // Override gas settings: https://github.com/ethers-io/ethers.js/issues/469
    //gasPrice: web3.utils.toWei('10', 'Gwei'),
    from: process.env.ACCOUNT, // Use your account here
    //value: web3.utils.toWei('1', 'Ether') // Amount of Ether to Swap
  }
  let result2 = await uniswapRouterContract.methods.swapExactTokensForETH(web3.utils.toWei('100', 'Ether'),0,address_pair,meAddress, DEADLINE).send(SETTINGS_2)
  console.log(`Successful Swap: https://ropsten.etherscan.io/tx/${result2.transactionHash}`)

};

async function create_record(inputSymbol, outputSymbol, difference, time){
  const random = Math.floor((Math.random() * 10000) + 1);
  const obj = {inputSymbol, outputSymbol, difference, time}
  const fs = require('fs');
  fs.writeFile("/Users/Julian Airhawk/Desktop/Price/arbi_ops/arbi_op."+inputSymbol+"-"+outputSymbol+random+".txt", JSON.stringify(obj), function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}



// Check markets every n seconds
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 15000 // 15 seconds
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)
