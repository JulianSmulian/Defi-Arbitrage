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
const UNISWAP_ROUTER_ABI = require('./abis/testNetworks/uniswap/uni_router_abi.json')
const UNISWAP_FACTORY_ABI = require('./abis/testNetworks/uniswap/uni_factory_abi.json')
const SUSHI_ROUTER_ABI = require('./abis/testNetworks/sushiswap/sushi_router_abi.json')
const SUSHI_FACTORY_ABI =require('./abis/testNetworks/sushiswap/sushi_factory_abi.json')
const ERC20_TOKEN_ABI = require('./abis/testNetworks/ropsten_erc20_abi.json')
//const PANCAKE_ROUTER_ABI = require('./abis/testNetworks/pancakeswap/pancake_router_abi.json')
//const KYBER_EXCHANGE_ABI = require('./abis/kyberswap/kyber_exchange_abi.json')
//const ONEINCH_ABI = require('./abis/oneinch/oneinch_abi.json')
//const AAVE_FLASHLOAN_ABI = require('./abis/aave/aave_flashloan_abi.json')
let networkisBusy = 'false'
let highestProfit = -100
const myEthAddress = '0x8b12bacf44bd9a2a06fd09f326a0d8e70741e3c1'
const flash_amount ='0000100000000000000'
const est_gas  = 120000
let ethPrice = '2280'
let currentgasPrice
let priceMonitor
let monitoringPrice = false
let pairs_priceMonitor
let pairs_monitoringPrice = false
let approved = false
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
  { symbol: 'WETH' , address: '0xc778417E063141139Fce010982780140Aa0cD5Ab'},
];
let eth_pairs = [
  //{ symbol: '', address: ''},
  { symbol: 'DAI'  , address: '0xad6d458402f60fd3bd25163575031acdce07538d'},
  { symbol: 'USDC' , address: '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c'},
];
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))
const web3 = new Web3(new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL) )
const UNISWAP_FACTORY_ADDRESS = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
const uniswapFactoryContract = new web3.eth.Contract(UNISWAP_FACTORY_ABI, UNISWAP_FACTORY_ADDRESS)
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const uniswapRouterContract = new web3.eth.Contract(UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS)
const SUSHI_FACTORY_ADDRESS = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
const sushiFactoryContract = new web3.eth.Contract(SUSHI_FACTORY_ABI, SUSHI_FACTORY_ADDRESS)
const SUSHI_ROUTER_ADDRESS = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
const sushiRouterContract = new web3.eth.Contract(SUSHI_ROUTER_ABI,SUSHI_ROUTER_ADDRESS)
let gasPrice

function financial(x) {
return Number.parseFloat(x).toFixed(2);
}

async function checkPair(args) {
  monitoringPrice = false
  const { position, inputSymbol, inputAddress, outputSymbol, outputAddress } = args
  crypto_position = position
  let uniswapAmountsOut
  let sushiswapAmountsOut
  _inputSymbol = inputSymbol
  _outputSymbol = outputSymbol
  _inputAddress=inputAddress
  _outputAddress=outputAddress

  uniswapAmountsOut = await uniswapRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
  num_uni =uniswapAmountsOut[1]
  sushiswapAmountsOut = await sushiRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
  num_sushi =sushiswapAmountsOut[1]

  let est_gascost = currentgasPrice * (est_gas*2)
  const gascost_inETH = web3.utils.fromWei(est_gascost.toString())

  let cut = -20
  let zero = -5
  let price
  let swapprofit_inETH
  if (num_uni   > num_sushi && num_sushi>0){
    sushiswapAmountsOut = await sushiRouterContract.methods.getAmountsOut( uniswapAmountsOut[1],([outputAddress,inputAddress])).call()
    swapprofit_inETH = (web3.utils.fromWei(sushiswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inETH - gascost_inETH)*ethPrice_inDai
  if(profit>highestProfit && profit <500){
    highestProfit = profit
  }
  if(profit < cut){
  eth_pairs.splice(position, 1);
  }
  if(profit > zero && profit <500){
    if(profit>50 && profit <500){
      gasPrice = (await web3.eth.getGasPrice())*2
      console.log('GAS PRICE FAST TRANSACTION', gasPrice)
    }else{
      gasPrice = await web3.eth.getGasPrice()
      console.log('GAS PRICE NORMAL TRANSACTION', gasPrice)
    }
      monitoringPrice = true
      console.log('MAKING TRADE FOR',_outputSymbol, outputAddress)
      swapEth_UNI(outputAddress,sushiswapAmountsOut[1])
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record('Un-Su',_inputSymbol,_outputSymbol, profit, time)
      networkisBusy = true
 }else{
   console.log(_outputSymbol,'Un->Su',financial(profit),'USD')

 }  }
  if (num_sushi > num_uni && num_uni>0){
   uniswapAmountsOut = await uniswapRouterContract.methods.getAmountsOut(sushiswapAmountsOut[1],([outputAddress,inputAddress])).call()
   swapprofit_inETH = (web3.utils.fromWei(uniswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
   let profit = (swapprofit_inETH - gascost_inETH)*ethPrice_inDai
   if(profit>highestProfit && profit <500){
     highestProfit = profit
   }
  if(profit < cut){
   eth_pairs.splice(position, 1);
  }
  if(profit > zero && profit <500){
    if(profit>50 && profit <500){
      gasPrice = (await web3.eth.getGasPrice())*2
      console.log('GAS PRICE FAST TRANSACTION', gasPrice)
    }else{
      gasPrice = await web3.eth.getGasPrice()
      console.log('GAS PRICE NORMAL TRANSACTION', gasPrice)
    }
      monitoringPrice = true
      trading_address = outputAddress
      console.log('MAKING TRADE FOR',_outputSymbol, outputAddress)
      swapEth_SUSHI(outputAddress,uniswapAmountsOut[1])
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record('Su-Un',_inputSymbol,_outputSymbol, profit, time)
      networkisBusy = true

 }else{
 console.log(_outputSymbol,'Su->Un',financial(profit),'USD')
 }
 }

}

async function monitorPrice() {
  ethPrice_inDai = await uniswapRouterContract.methods.getAmountsIn(flash_amount,(['0xad6d458402f60fd3bd25163575031acdce07538d','0xc778417E063141139Fce010982780140Aa0cD5Ab'])).call()
  ethPrice_inDai = web3.utils.fromWei(ethPrice_inDai[0].toString())
  let time = moment().tz('America/Chicago').format()
  currentgasPrice = await web3.eth.getGasPrice()
  console.log('CHECKING ALL PAIRS - ETH GAS IS ', currentgasPrice, 'WEI')
  console.log('HIGHEST PROFIT SO FAR IS $', financial(highestProfit))
  if(currentgasPrice>200000000000){
    console.log('GAS IS TOO HIGH, WILL RESTART IN 60 seconds', time)
    return
  }
  else
  {
  if(monitoringPrice) {return}
  monitoringPrice = true
  try {
    for (p in eth_pairs) {
      if(networkisBusy=='false'){
          await checkPair({
          position: p,
          inputSymbol: weth[0].symbol,
          inputAddress: weth[0].address,
          outputSymbol: eth_pairs[p].symbol,
          outputAddress: eth_pairs[p].address,
          inputAmount: web3.utils.fromWei(flash_amount , 'ETHER')})
        }else{
          networkisBusy = 'true'
        }
    }
} catch (error) {
console.error(error)
monitoringPrice = false
clearInterval(priceMonitor)
return
}
}

monitoringPrice = false
}

async function pairs_monitorPrice() {
  if(networkisBusy=='false'){
  if(pairs_monitoringPrice) {return}
  pairs_monitoringPrice = true
  console.log('Restarting Program')
  eth_pairs.splice(0, eth_pairs.length)
  for (var i of pairs) {
    eth_pairs.push(i);
  }
  pairs_monitoringPrice = false
}else{
  networkisBusy = 'false'
  priceMonitor = setInterval(async () => { await monitorPrice() }, 60000) //60 seconds
}
}

function alertTerminal(){
  console.log("\007");
}

async function checkTokenApproval(tokenAddress, exchange){
  const erc20TokenContract = new web3.eth.Contract(ERC20_TOKEN_ABI, tokenAddress)

  if(exchange== 'sushi'){
      let allowance = await erc20TokenContract.methods.allowance(myEthAddress,SUSHI_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT SUSHI',allowance, token,tokenAddress)
      await swapToken_SUSHI(tokenAddress)
  }else{
      const approvedToken = await erc20TokenContract.methods.approve(SUSHI_ROUTER_ADDRESS,token).send({ from: myEthAddress });
      console.log('APPROVING TOKEN WITH SUSHI',allowance, token,tokenAddress)
      await swapToken_SUSHI(tokenAddress)
  }}

  if(exchange == 'uni'){
      let allowance = await erc20TokenContract.methods.allowance(myEthAddress,UNISWAP_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT UNI',allowance, token,tokenAddress)
      await swapToken_UNI(tokenAddress)
  }else{
      const approvedToken = await erc20TokenContract.methods.approve(UNISWAP_ROUTER_ADDRESS,token).send({ from: myEthAddress });
      console.log('APPROVING TOKEN WITH UNI',allowance, token,tokenAddress)
      await swapToken_UNI(tokenAddress)
  }}
}

async function swapEth_SUSHI(trading_address,expectedAmount) {
  networkisBusy = true
  monitoringPrice = false
  pairs_monitoringPrice = false
  clearInterval(priceMonitor)
  clearInterval(pairs_monitorPrice)
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [_inputAddress,trading_address]//
  const web3 = new Web3(process.env.RPC_URL);//
  const networkId = await web3.eth.net.getId();
  const myContract = await sushiRouterContract.methods.swapExactETHForTokens(expectedAmount,address_pair,myEthAddress, DEADLINE)//.send(SETTINGS_1)//
  const gas = 160000;
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: SUSHI_ROUTER_ADDRESS,
  from: myEthAddress,
  data: web3.utils.toHex(data),
  value: web3.utils.toHex(flash_amount) //or 1E14
}
console.log(
  'Transaction Action, SWAP',
  web3.utils.fromWei(flash_amount), _inputSymbol,
  'for',
  web3.utils.fromWei(expectedAmount),
  _outputSymbol,
  'on SUSHI',
  'Expected Transaction Fee',
  (gas * .75)*web3.utils.fromWei(gasPrice),
  'ETH with gas price of',
   web3.utils.fromWei(gasPrice),
  'and gas of',
  gas)
  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(myEthAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'ropsten' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
  })

  const receipt = await sendRawTransaction(txData)
  const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)
  //console.log('THIS IS THE BULLSHIT THAT KEEPS CRASHING THE PROGRAM', info)
  let data_info = await info.logs[2].data.toString()
  token = web3.utils.hexToNumberString(data_info)
  monitoringPrice = true
  pairs_monitoringPrice = true
  priceMonitor = setInterval(async () => { await monitorPrice() }, 60000) //60 seconds
  pairs_priceMonitor = setInterval(async () => { await pairs_monitorPrice() }, 310000) //310 seconds

  checkTokenApproval(trading_address,'uni')
}

async function swapEth_UNI(trading_address,expectedAmount) {
  networkisBusy = true
  monitoringPrice = false
  pairs_monitoringPrice = false
  clearInterval(priceMonitor)
  clearInterval(pairs_monitorPrice)
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [_inputAddress,trading_address]//
  const web3 = new Web3(process.env.RPC_URL);//
  const networkId = await web3.eth.net.getId();
  const myContract = await uniswapRouterContract.methods.swapExactETHForTokens(expectedAmount,address_pair,myEthAddress, DEADLINE)//.send(SETTINGS_1)//
  const gas = 160000;
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: myEthAddress,
  data: web3.utils.toHex(data),
  value: web3.utils.toHex(flash_amount)
}
console.log(
  'Transaction Action, SWAP',
  web3.utils.fromWei(flash_amount), _inputSymbol,
  'for',
  web3.utils.fromWei(expectedAmount),
  _outputSymbol,
  'on UNI',
  'Expected Transaction Fee',
  (gas * .75)*web3.utils.fromWei(gasPrice),
  'ETH with gas price of',
   web3.utils.fromWei(gasPrice),
  'and gas of',
  gas)
  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(myEthAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'ropsten' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
  })

  const receipt = await sendRawTransaction(txData)
  const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)
  console.log('THIS IS THE BULLSHIT THAT KEEPS CRASHING THE PROGRAM', info)
  let data_info = await info.logs[2].data.toString()
  token = web3.utils.hexToNumberString(data_info)

  monitoringPrice = true
  pairs_monitoringPrice = true
  priceMonitor = setInterval(async () => { await monitorPrice() }, 60000) //60 seconds
  pairs_priceMonitor = setInterval(async () => { await pairs_monitorPrice() }, 310000) //310 seconds

  checkTokenApproval(trading_address,'sushi')
}

async function swapToken_UNI(trading_address) {
 try{
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [trading_address,_inputAddress]//
  let myContract = await uniswapRouterContract.methods.swapExactTokensForETH(token,'0',address_pair,myEthAddress, DEADLINE)
  const gas = 160000;
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: myEthAddress,
  data: web3.utils.toHex(data),
  //value: web3.utils.toHex(1e17)
  }

  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(myEthAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'ropsten' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
      })
    const receipt = await sendRawTransaction(txData)
    const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)
    console.log(info)
    networkisBusy = false
  }catch (error) {
  console.error(error);

  }
}

async function swapToken_SUSHI(trading_address) {
  try{
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  console.log('THIS IS TRADING INFO', trading_address, _inputAddress)
  let address_pair = [trading_address,_inputAddress]//
  let myContract = await sushiRouterContract.methods.swapExactTokensForETH(token,'0',address_pair,myEthAddress, DEADLINE)
  const gas = 160000;
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: SUSHI_ROUTER_ADDRESS,
  from: myEthAddress,
  data: web3.utils.toHex(data),
  //value: web3.utils.toHex(1e17)
  }

  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(myEthAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'ropsten' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
      })
    const receipt = await sendRawTransaction(txData)
    const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)
    console.log(info)
    networkisBusy = false
  }catch (error) {
  console.error(error);

}
}

async function create_record(exchangepath, inputSymbol, outputSymbol, difference, time){
  const random = Math.floor((Math.random() * 10000) + 1);
  const obj = {inputSymbol, outputSymbol, difference, time}
  const fs = require('fs');
  fs.writeFile("/Users/Julian Airhawk/Desktop/Price/arbi_ops/arbi_op."+exchangepath+"-"+inputSymbol+"-"+outputSymbol+random+".txt", JSON.stringify(obj), function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}


priceMonitor = setInterval(async () => { await monitorPrice() }, 75000) //75 seconds 6 hours of infura
pairs_priceMonitor = setInterval(async () => { await pairs_monitorPrice() }, 310000) //310 seconds
