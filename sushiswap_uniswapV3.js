require('dotenv').config()
const Tx = require('ethereumjs-tx').Transaction
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
const KYBER_EXCHANGE_ABI = require('./abis/kyberswap/kyber_exchange_abi.json')
const ONEINCH_ABI = require('./abis/oneinch/oneinch_abi.json')
const AAVE_FLASHLOAN_ABI = require('./abis/aave/aave_flashloan_abi.json')
let highestProfit = -100
const meAddress = '0x8b12bacf44bd9a2a06fd09f326a0d8e70741e3c1'
const flash_amount ='0100000000000000000'
const est_gas  = 120000
let ethPrice = '2280'
let currentgasPrice
let priceMonitor
let monitoringPrice = false
let pairs_priceMonitor
let pairs_monitoringPrice = false
const pairs = [

];
let token
let num_uni;
let num_sushi;
let _inputSymbol;
let _outputSymbol;
let _inputAddress = '0x'
let _outputAddress = '0x'
let weth = [
  { symbol: 'WETH', address: ''},
];
let eth_pairs = [

];
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))
const web3 = new Web3(new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL) )
const UNISWAP_FACTORY_ADDRESS = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
const uniswapFactoryContract = new web3.eth.Contract(UNISWAP_FACTORY_ABI, UNISWAP_FACTORY_ADDRESS)
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const uniswapRouterContract = new web3.eth.Contract(UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS)
const SUSHI_FACTORY_ADDRESS = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
const sushiFactoryContract = new web3.eth.Contract(SUSHI_FACTORY_ABI, SUSHI_FACTORY_ADDRESS)
const SUSHI_ROUTER_ADDRESS = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
const sushiRouterContract = new web3.eth.Contract(SUSHI_ROUTER_ABI,SUSHI_ROUTER_ADDRESS)

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
  //DO NOT DELETE - CHECK PAIR WHEN ADDED NEW ADDRESSES BUT HIDE WHEN DONE
  //const uniswapPair = await uniswapFactoryContract.methods.getPair(inputAddress, outputAddress).call()
  //if(uniswapPair == '0x0000000000000000000000000000000000000000'){
  //  num_uni = '1';}
  //else{
     uniswapAmountsOut = await uniswapRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
     num_uni =uniswapAmountsOut[1]
//  }
  //const sushiswapPair = await sushiFactoryContract.methods.getPair(inputAddress, outputAddress).call()
  //if(sushiswapPair.includes('Error')){
  //  num_sushi = '1';}
  //else{
    sushiswapAmountsOut = await sushiRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
    num_sushi =sushiswapAmountsOut[1]
//  }

  let est_gascost = currentgasPrice * (est_gas*2)
  let est_gascostUS = est_gascost * ethPrice
  const gascost_inETH = web3.utils.fromWei(est_gascost.toString())
  //console.log('Total swap cost in dollars $',web3.utils.fromWei(est_gascostUS.toString()))
  //console.log('Total swap cost in eth',(gascost_inETH))

  let cut = -100
  let zero = 0
  let price
  let swapprofit_inETH
  if (num_uni   > num_sushi && num_sushi>0){
    sushiswapAmountsOut = await sushiRouterContract.methods.getAmountsOut( uniswapAmountsOut[1],([outputAddress,inputAddress])).call()
    swapprofit_inETH = (web3.utils.fromWei(sushiswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inETH - gascost_inETH)*ethPrice
    //console.log('PROFIT IN ETH', (swapprofit_inETH-gascost_inETH), 'PROFIT IN USD', profit, 'SWAPPROFIT', swapprofit_inETH, 'SWAPCOST', gascost_inETH)
  if(profit>highestProfit){
    highestProfit = profit
  }
  if(profit < cut){
  //console.log('Cutting', position, _outputSymbol)
  eth_pairs.splice(position, 1);
  }
  if(profit > zero){
    swapEth_UNI()
    console.log(_outputSymbol,'Un->Su',financial(profit),'USD')
    alertTerminal()
    let time = moment().tz('America/Chicago').format()
    create_record(_inputSymbol,_outputSymbol, profit, time)
 }else{
   console.log(_outputSymbol,'Un->Su',financial(profit),'USD')

 }  }
  if (num_sushi > num_uni && num_uni>0){
   uniswapAmountsOut = await uniswapRouterContract.methods.getAmountsOut(sushiswapAmountsOut[1],([outputAddress,inputAddress])).call()
   swapprofit_inETH = (web3.utils.fromWei(uniswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
   let profit = (swapprofit_inETH - gascost_inETH)*ethPrice
   //console.log('PROFIT IN ETH', (swapprofit_inETH-gascost_inETH), 'PROFIT IN USD', profit, 'SWAPPROFIT', swapprofit_inETH, 'SWAPCOST', gascost_inETH)
   if(profit>highestProfit){
     highestProfit = profit
   }
  if(profit < cut){
   //console.log('Cutting', position, _outputSymbol)
   eth_pairs.splice(position, 1);
  }
  if(profit > zero){
   swapEth_SUSHI()
  console.log(_outputSymbol,'Su->Un',financial(profit),'USD')
  alertTerminal()
  let time = moment().tz('America/Chicago').format()
  create_record(_inputSymbol,_outputSymbol, profit, time)
}else{
 console.log(_outputSymbol,'Su->Un',financial(profit),'USD')

}
}
    _inputAddress=inputAddress
    _outputAddress=outputAddress
}

async function monitorPrice() {
  //currentgasPrice = 030000000000
  currentgasPrice = await web3.eth.getGasPrice()
  console.log('CHECKING ALL PAIRS - ETH GAS IS ', currentgasPrice, 'WEI')
  console.log('HIGHEST PROFIT SO FAR IS $', financial(highestProfit))
  if(monitoringPrice) {return}
  monitoringPrice = true
  try {
    for (p in eth_pairs) {
          await checkPair({
          position: p,
          inputSymbol: weth[0].symbol,
          inputAddress: weth[0].address,
          outputSymbol: eth_pairs[p].symbol,
          outputAddress: eth_pairs[p].address,
          inputAmount: web3.utils.fromWei(flash_amount , 'ETHER')})
    }


} catch (error) {
console.error(error)
monitoringPrice = false
clearInterval(priceMonitor)
return
}

monitoringPrice = false
}

async function pairs_monitorPrice() {
  if(pairs_monitoringPrice) {return}
  pairs_monitoringPrice = true
  console.log('Restarting Program')
  eth_pairs.splice(0, eth_pairs.length)
  for (var i of pairs) {
    eth_pairs.push(i);
  }
  pairs_monitoringPrice = false
}
function alertTerminal(){
  console.log("\007");
}

async function swapEth_SUSHI() {
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [_inputAddress,_outputAddress]//
  const web3 = new Web3(process.env.RPC_URL);//
  const networkId = await web3.eth.net.getId();
  const myContract = await sushiRouterContract.methods.swapExactETHForTokens(0,address_pair,meAddress, DEADLINE)//.send(SETTINGS_1)//
  const gas = 200000;
  const gasPrice = await web3.eth.getGasPrice();
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(100e9), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  value: web3.utils.toHex(1e17)
}

  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(meAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'mainnet' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
  })

  const receipt = await sendRawTransaction(txData)
  const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)
  console.log('INFO', info)

  let data_info = await info.logs[4].data.toString()
  //console.log('INFO', data_info)
  data_info = data_info.substring(0, data_info.length-64);
  data_info = data_info.substr(data_info.length - 17).toString() // => "Tabs1"
  token = web3.utils.hexToNumberString(data_info)
  console.log('TOKEN AMOUNT', token)
  swapTokenToETH()
}

async function swapEth_UNI() {
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [_inputAddress,_outputAddress]//
  const web3 = new Web3(process.env.RPC_URL);//
  const networkId = await web3.eth.net.getId();
  const myContract = await uniswapRouterContract.methods.swapExactETHForTokens(0,address_pair,meAddress, DEADLINE)//.send(SETTINGS_1)//
  const gas = 200000;
  const gasPrice = await web3.eth.getGasPrice();
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(100e9), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  value: web3.utils.toHex(1e17)
}

  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(meAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'mainnet' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
  })

  const receipt = await sendRawTransaction(txData)
  const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)
  console.log('INFO', info)

  let data_info = await info.logs[4].data.toString()
  //console.log('INFO', data_info)
  data_info = data_info.substring(0, data_info.length-64);
  data_info = data_info.substr(data_info.length - 17).toString() // => "Tabs1"
  token = web3.utils.hexToNumberString(data_info)
  console.log('TOKEN AMOUNT', token)
  swapTokenToETH()
}

async function swapToken_UNI() {
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [_outputAddress,_inputAddress]//
  let myContract = await uniswapRouterContract.methods.swapExactTokensForETH(token,0,address_pair,meAddress, DEADLINE)
  const gas = 200000;
  const gasPrice = await web3.eth.getGasPrice();
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(100e9), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  value: web3.utils.toHex(1e17)
  }

  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(meAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'mainnet' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
      })
    const receipt = await sendRawTransaction(txData)
    const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)
    console.log(info)
}

async function swapToken_SUSHI() {
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [_outputAddress,_inputAddress]//
  let myContract = await sushiRouterContract.methods.swapExactTokensForETH(token,0,address_pair,meAddress, DEADLINE)
  const gas = 200000;
  const gasPrice = await web3.eth.getGasPrice();
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(100e9), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  value: web3.utils.toHex(1e17)
  }

  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(meAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'mainnet' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
      })
    const receipt = await sendRawTransaction(txData)
    const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)
    console.log(info)
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


const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 30000 // 30 seconds
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)

const PAIRS_POLLING_INTERVAL = process.env.POLLING_INTERVAL || 110000 // 120 seconds
pairs_priceMonitor = setInterval(async () => { await pairs_monitorPrice() }, PAIRS_POLLING_INTERVAL)
