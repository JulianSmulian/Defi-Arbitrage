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
const PANCAKESWAP_FACTORY_ABI = require('./abis/pancakeswap/pancake_factory_abi.json')
const PANCAKESWAP_ROUTER_ABI = require('./abis/pancakeswap/pancake_router_abi.json')
const BURGERSWAP_FACTORY_ABI = require('./abis/burgerswap/burger_factory_abi.json')
const BURGERSWAP_ROUTER_ABI = require('./abis/burgerswap/burger_router_abi.json')
const flash_amount ='0100000000000000000'
const exchange_difference = .025
const bnbPrice = 545
let currentgasPrice
const est_gas  = 1000000

// SERVER CONFIG
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))
const exact_moment = require('moment') // import moment.js library
const now = exact_moment().unix() // fetch current unix timestamp
const DEADLINE = now + 15 // add 15 seconds

//Loop burgerswap factory contract ***allPairs 0-568
// for each element find ***getReserves in pairContract
// if getReserves has sufficent LIQUIDITY
// get tokn0 and tokn1 address and abi and get symbol from contract

const web3_binance = new Web3('https://bsc-dataseed1.binance.org:443');
//const web3_binance = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
//const binance_account = web3_binance.eth.accounts.create();
async function getBinanceInfo(){
//  const binance_gasPrice = await web3_binance.eth.getGasPrice()
//console.log('BINANCE ACCOUNT',binance_account, 'GAS PRICE', binance_gasPrice)
}
//const binance_receover_account = web3.eth.accounts.privateKeyToAccount("$private-key")

getBinanceInfo()

const PANCAKESWAP_FACTORY_ADDRESS = '0xbcfccbde45ce874adcb698cc183debcf17952812'
const pancakeFactoryContract = new web3_binance.eth.Contract(PANCAKESWAP_FACTORY_ABI, PANCAKESWAP_FACTORY_ADDRESS)

const PANCAKESWAP_ROUTER_ADDRESS = '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'
const pancakeRouterContract = new web3_binance.eth.Contract(PANCAKESWAP_ROUTER_ABI, PANCAKESWAP_ROUTER_ADDRESS)

const BURGERSWAP_FACTORY_ADDRESS = '0x8a1E9d3aEbBBd5bA2A64d3355A48dD5E9b511256'
const burgerFactoryContract = new web3_binance.eth.Contract(BURGERSWAP_FACTORY_ABI, BURGERSWAP_FACTORY_ADDRESS)

const BURGERSWAP_ROUTER_ADDRESS = '0xBf6527834dBB89cdC97A79FCD62E6c08B19F8ec0'
const burgerRouterContract = new web3_binance.eth.Contract(BURGERSWAP_ROUTER_ABI, BURGERSWAP_ROUTER_ADDRESS)


let num_pancake;
let num_burger;
let percentage_difference;
let _inputSymbol;
let _outputSymbol;
let _inputAddress = '0x'
let _outputAddress = '0x'
let obj
let highestProfit = -10

let peth =[{ symbol: 'WBNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'}]

let lowLiquidity_pairs= [
  { symbol: 'KUN',      address: '0x1A2fb0Af670D0234c2857FaD35b789F8Cb725584' },
]

let binance_pairs = [
  { symbol: 'BURGER',   address: '0xAe9269f27437f0fcBC232d39Ec814844a51d6b8f' },
  { symbol: 'USDT',     address: '0x55d398326f99059fF775485246999027B3197955' },
  { symbol: 'DOT',      address: '0x7083609fce4d1d8dc0c979aab8c869ea2c873402' },
  { symbol: 'FRIES',    address: '0x393B312C01048b3ed2720bF1B090084C09e408A1' },
  { symbol: 'KOGE',     address: '0xe6DF05CE8C8301223373CF5B969AFCb1498c5528' },
  { symbol: 'BTCB',     address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c' },
  { symbol: 'ETH',      address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8' },
  { symbol: 'WATCH',    address: '0x7a9f28eb62c791422aa23ceae1da9c847cbec9b0' },
  { symbol: 'WHIRL',    address: '0x7f479d78380ad00341fdd7322fe8aef766e29e5a' },
  { symbol: 'USDC' ,    address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d' },
  { symbol: 'ADA'  ,    address: '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47' },
  { symbol: 'AUTO' ,    address: '0xa184088a740c695e156f91f5cc086a06bb78b827' },
];

function financial(x) {
return Number.parseFloat(x).toFixed(2);
}

async function checkPairs(args) {
  const { position, inputSymbol, inputAddress, outputSymbol, outputAddress } = args
  let pancakeswapAmountsOut
  let burgerswapAmountsOut
  _inputSymbol = inputSymbol
  _outputSymbol = outputSymbol
  let est_gascost = currentgasPrice * (est_gas*2)
  let est_gascostUS = est_gascost * bnbPrice
  const gascost_inBNB = web3_binance.utils.fromWei(est_gascost.toString())
  let zero = 0
  let price
  let swapprofit_inBNB

  const panckeswapPair = await pancakeFactoryContract.methods.getPair(inputAddress, outputAddress).call()
  if(panckeswapPair== '0x0000000000000000000000000000000000000000'){
  num_pancake = 0
  }else{
  pancakeswapAmountsOut = await pancakeRouterContract.methods.getAmountsOut(flash_amount,[inputAddress,outputAddress]).call()
  num_pancake =pancakeswapAmountsOut[1]
  //console.log('Pancake returns', web3_binance.utils.fromWei(num_pancake), 'BNB')
  }

  const burgerswapPair = await burgerFactoryContract.methods.getPair(inputAddress, outputAddress).call()
  if(burgerswapPair== '0x0000000000000000000000000000000000000000'){
  num_burger = 0
  }else{
  burgerswapAmountsOut = await burgerRouterContract.methods.getAmountsOut(flash_amount,[inputAddress,outputAddress]).call()
  num_burger =burgerswapAmountsOut[1]
  //console.log('Burger returns', web3_binance.utils.fromWei(num_burger), 'BNB')
  }

  if (num_pancake > num_burger && num_burger>0){
    burgerswapAmountsOut = await burgerRouterContract.methods.getAmountsOut( pancakeswapAmountsOut[1],([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3_binance.utils.fromWei(burgerswapAmountsOut[1],'Ether')) - web3_binance.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Pa->Bu',financial(profit),'USD')
      //alertTerminal()
      //let time = moment().tz('America/Chicago').format()
      //create_record(_inputSymbol,_outputSymbol, profit, time)
    }else{
     console.log(_outputSymbol,'Pa->Bu',financial(profit),'USD')

    }
  }
  if (num_burger  > num_pancake && num_pancake>0){
    pancakeswapAmountsOut = await pancakeRouterContract.methods.getAmountsOut( burgerswapAmountsOut[1],([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3_binance.utils.fromWei(pancakeswapAmountsOut[1],'Ether')) - web3_binance.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Bu->Pa',financial(profit),'USD')
      //alertTerminal()
      //let time = moment().tz('America/Chicago').format()
      //create_record(_inputSymbol,_outputSymbol, profit, time)
    }else{
     console.log(_outputSymbol,'Bu->Pa',financial(profit),'USD')

    }
  }


/*
 console.table([{
   'Position': pa,'Input Token': _inputSymbol,
   'Output Token': _outputSymbol,
   'Timestamp': moment().tz('America/Chicago').format(),
   'AmountsOutPancake': financial((web3_binance.utils.fromWei(num_pancake))),
   'AmountsOutBurger': financial((web3_binance.utils.fromWei(num_burger))),
   'Estimated Gas Cost': web3_binance.utils.fromWei(est_gascostUS.toString()) }])
   */
    _inputAddress=inputAddress
    _outputAddress=outputAddress
}

let priceMonitor
let monitoringPrice = false


async function monitorPrice() {
  console.log('HIGHEST PROFIT SO FAR IS $', financial(highestProfit))
  currentgasPrice = await web3_binance.eth.getGasPrice()
  if(monitoringPrice) {return}
  monitoringPrice = true
  try {
    for (pa in binance_pairs) {
          await checkPairs({
          position: pa,
          inputSymbol: peth[0].symbol,
          inputAddress: peth[0].address,
          outputSymbol: binance_pairs[pa].symbol,
          outputAddress: binance_pairs[pa].address,
          inputAmount: web3_binance.utils.fromWei(flash_amount , 'ETHER')})
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
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 30000 // 15 seconds
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)
