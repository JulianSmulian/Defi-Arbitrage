require('dotenv').config()
const Tx = require("ethereumjs-tx").Transaction

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
const ERC20_TOKEN_ABI = require('./abis/erc20/erc20_abi.json')
//const KYBER_ROUTER_ABI = require('./abis/kyberswap/kyber_router_abi.json')
let highestProfit = -100
let highestProfitSymbol = 'Julian'
//Change meAddress below, flashamount and value in txData
const meAddress = '0xdcAAb152fd53c3Ca7514dcB85b2a9D31700A36B5'
const flash_amount ='0030000000000000000'
const est_gas  = 250000
const test_gas = 120000
let slippage = .97 // Returns at least 97% of what is expected
let ethPrice
let currentgasPrice
let priceMonitor
let monitoringPrice = false
let pairs_priceMonitor
let pairs_monitoringPrice = false
let pairs = [
  { symbol: 'DAI'  , address: '0xad6d458402f60fd3bd25163575031acdce07538d'},
  { symbol: 'USDC' , address: '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c'},
  { symbol: 'BAT' , address: '0x443fd8d5766169416ae42b8e050fe9422f628419'},
  { symbol: 'USDT' , address: '0x110a13fc3efe6a245b50102d2d79b3e76125ae83'},
  { symbol: 'UNI'  , address: '0x71d82eb6a5051cff99582f4cdf2ae9cd402a4882'},
  { symbol: 'stMATIC' , address: '0xf4ee686ec2944160306e00e29c3614c9d346c866'}
];
let token
let num_uni;
let num_sushi;
let num_kyber;
let _inputSymbol;
let _outputSymbol;
let _inputAddress = '0x'
let _outputAddress = '0x'
let approved = false

let weth = [
  { symbol: 'WETH' , address: '0xc778417E063141139Fce010982780140Aa0cD5Ab'},
];
let eth_pairs = [
  //{ symbol: '', address: ''},
  { symbol: 'DAI'  , address: '0xad6d458402f60fd3bd25163575031acdce07538d'},
  { symbol: 'USDC' , address: '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c'},
  { symbol: 'BAT' , address: '0x443fd8d5766169416ae42b8e050fe9422f628419'},
  { symbol: 'USDT' , address: '0x110a13fc3efe6a245b50102d2d79b3e76125ae83'},
  { symbol: 'UNI'  , address: '0x71d82eb6a5051cff99582f4cdf2ae9cd402a4882'},
  { symbol: 'stMATIC' , address: '0xf4ee686ec2944160306e00e29c3614c9d346c866'}
];

const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))
const web3 = new Web3(new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL))
//const UNISWAP_FACTORY_ADDRESS = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
//const uniswapFactoryContract = new web3.eth.Contract(UNISWAP_FACTORY_ABI, UNISWAP_FACTORY_ADDRESS)
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const uniswapRouterContract = new web3.eth.Contract(UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS)
//const SUSHI_FACTORY_ADDRESS = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
//const sushiFactoryContract = new web3.eth.Contract(SUSHI_FACTORY_ABI, SUSHI_FACTORY_ADDRESS)
const SUSHI_ROUTER_ADDRESS = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
const sushiRouterContract = new web3.eth.Contract(SUSHI_ROUTER_ABI,SUSHI_ROUTER_ADDRESS)
//const KYBER_ROUTER_ADDRESS = '0x9AAb3f75489902f3a48495025729a0AF77d4b11e'
//const kyberRouterContract = new web3.eth.Contract(KYBER_ROUTER_ABI,KYBER_ROUTER_ADDRESS)
let networkisBusy = 'false'
let gasPrice
let profit
let receipt
function financial(x) {
return Number.parseFloat(x).toFixed(2);
}

async function checkPair(args) {
  monitoringPrice = true
  const { position, inputSymbol, inputAddress, outputSymbol, outputAddress } = args
  crypto_position = position
  let uniswapAmountsOut
  let sushiswapAmountsOut
  _inputSymbol = inputSymbol
  _outputSymbol = outputSymbol
  _inputAddress=inputAddress
  _outputAddress=outputAddress
  let cut =  5
  let zero = 5
  let price
  let swapprofit_inETH
  let est_gascost = (currentgasPrice*1) * (test_gas*2)
  const gascost_inETH = web3.utils.fromWei(est_gascost.toString())

 try{
  uniswapAmountsOut = await uniswapRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
  num_uni =uniswapAmountsOut[1]
  //console.log('Return for UNI:',outputSymbol,num_uni)


  sushiswapAmountsOut = await sushiRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
  num_sushi =sushiswapAmountsOut[1]
  //console.log('Return for SUSHI:',outputSymbol,num_sushi)
}catch(e){
  //console.log(outputSymbol, 'has little or no liquidity')
  return
}
  if (num_uni  > num_sushi>0){
    sushiswapAmountsOut = await sushiRouterContract.methods.getAmountsOut( num_uni,([outputAddress,inputAddress])).call()
    swapprofit_inETH = (web3.utils.fromWei(sushiswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
  //  console.log(num_uni,outputSymbol,outputAddress,'AMOUNTS OUT SUSHI',web3.utils.fromWei(sushiswapAmountsOut[1],'Ether'),'- FLASH AMOUNT', web3.utils.fromWei(flash_amount))
    profit = (swapprofit_inETH - gascost_inETH)*ethPrice_inDai
  //  console.log(outputSymbol,outputAddress,'PROFIT = SWAP PROFIT',swapprofit_inETH,'MINUS GAS COST IN ETH',gascost_inETH,'TIMES ETH PRICE IN DAI',ethPrice_inDai, profit)
  let expectedAmount = toPlainString(Math.round(num_uni*slippage))

  let ethprofit = swapprofit_inETH - gascost_inETH
  if(profit>highestProfit && profit <200){
    highestProfit = profit
    highestProfitSymbol = outputSymbol
  }
  if(profit < cut){
  eth_pairs.splice(position, 1);
  }
  if(profit > zero && profit <10000){
    console.log(outputSymbol,'Un->Su',financial(profit),'USD')
      gasPrice = await web3.eth.getGasPrice()
      console.log('GAS PRICE NORMAL TRANSACTION', gasPrice, 'TRANASCTION COST = ',(((((gasPrice*1.2)/1000000000000000000)*est_gas)*2)*ethPrice_inDai))

      monitoringPrice = true
      if (currentgasPrice>=1000000000){
      console.log('MAKING TRADE FOR',outputSymbol,outputAddress, 'UNI->SUSHI')
      swapEth_UNI(outputAddress,expectedAmount)
      alertTerminal()}else{
        console.log('GAS IS TOO LOW, TOO RISKY')
      }
      let time = moment().tz('America/Chicago').format()
      create_record('Un-Su',inputSymbol,outputSymbol, profit, time)
      networkisBusy = true
 }else{
   console.log(outputSymbol,'Un->Su',financial(profit),'USD', '-------------------Uni gives',financial(web3.utils.fromWei(num_uni)),'and Sushi gives',(web3.utils.fromWei(sushiswapAmountsOut[1])-web3.utils.fromWei(flash_amount)), 'after flash amount is taken out')

 }  }

  if (num_sushi > num_uni >0){
   uniswapAmountsOut = await uniswapRouterContract.methods.getAmountsOut(num_sushi,([outputAddress,inputAddress])).call()
   swapprofit_inETH = (web3.utils.fromWei(uniswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
   //console.log(num_sushi,outputSymbol,outputAddress,'AMOUNTS OUT UNI',web3.utils.fromWei(uniswapAmountsOut[1],'Ether'),'- FLASH AMOUNT', web3.utils.fromWei(flash_amount))
   profit = (swapprofit_inETH - gascost_inETH)*ethPrice_inDai
   //console.log(outputSymbol,outputAddress,'PROFIT = SWAP PROFIT',swapprofit_inETH,'MINUS GAS COST IN ETH',gascost_inETH,'TIMES ETH PRICE IN DAI',ethPrice_inDai, profit)
   let ethprofit = swapprofit_inETH - gascost_inETH
   let expectedAmount = toPlainString(Math.round(num_sushi*slippage))
   if(profit>highestProfit && profit <200){
     highestProfit = profit
     highestProfitSymbol = outputSymbol
   }
   if(profit < cut){
   eth_pairs.splice(position, 1);
   }

   if(profit > zero && profit <10000){
    console.log(_outputSymbol,'Su->Un',financial(profit),'USD')
      gasPrice = await web3.eth.getGasPrice()
      console.log('GAS PRICE NORMAL TRANSACTION', gasPrice,'TRANASCTION COST = ',(((((gasPrice*1.2)/100000000000000000)*est_gas)*2)*ethPrice_inDai))
      monitoringPrice = true
      trading_address = _outputAddress
      if (currentgasPrice>=1000000000){
      console.log('MAKING TRADE FOR',outputSymbol,outputAddress, 'SUSHI->UNI')
      swapEth_SUSHI(outputAddress,expectedAmount)
      alertTerminal() }else{
        console.log('GAS IS TOO LOW, TOO RISKY')
      }
      let time = moment().tz('America/Chicago').format()
      create_record('Su-Un',inputSymbol,outputSymbol, profit, time)
      networkisBusy = true

 }else{
   console.log(outputSymbol,'Su->Un',financial(profit),'USD', '-------------------Sushi gives',financial(web3.utils.fromWei(num_sushi)),'and Uni gives',(web3.utils.fromWei(uniswapAmountsOut[1])-web3.utils.fromWei(flash_amount)), 'after flash amount is taken out')
 }
 }

  if ((eth_pairs.length - eth_pairs[p]) == 0){
    monitoringPrice == false
  }
}

async function monitorPrice() {
  var bal = await web3.eth.getBalance(meAddress);
  if(bal < flash_amount){
  console.log('ETH BALANCE IS GOOD', web3.utils.fromWei(bal))
}else{
  console.log('ETH BALANCE IS TOO LOW', web3.utils.fromWei(bal))
  monitoringPrice = false
  clearInterval(priceMonitor)
  return
}
  if(monitoringPrice) {return}
  ethPrice_inDai = await uniswapRouterContract.methods.getAmountsIn('1000000000000000000',(['0xad6d458402f60fd3bd25163575031acdce07538d','0xc778417E063141139Fce010982780140Aa0cD5Ab'])).call()
  ethPrice_inDai = web3.utils.fromWei(ethPrice_inDai[0].toString())
  let time = moment().tz('America/Chicago').format()
  currentgasPrice = await web3.eth.getGasPrice()

  console.log('CHECKING ALL PAIRS - STANDARD ETH GAS IS', currentgasPrice, 'WEI', 'ETH PRICE IS', '$', ethPrice_inDai)
  console.log('HIGHEST PROFIT SO FAR IS $', financial(highestProfit), highestProfitSymbol)
  if(currentgasPrice>300000000000){
    console.log('GAS IS TOO HIGH, WILL RESTART IN 60 seconds', time)
    return
  }
  else
  {

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
  let infinite_tokens = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
  const erc20TokenContract = new web3.eth.Contract(ERC20_TOKEN_ABI, tokenAddress)

  if(exchange== 'sushi'){
      let allowance = await erc20TokenContract.methods.allowance(meAddress,SUSHI_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT SUSHI',allowance, token,tokenAddress)
      await swapToken_SUSHI(tokenAddress)
  }else{
      const approvedToken = await erc20TokenContract.methods.approve(SUSHI_ROUTER_ADDRESS,infinite_tokens).send({ from: meAddress });
      console.log('APPROVING TOKEN WITH SUSHI',allowance, token,tokenAddress)
      await swapToken_SUSHI(tokenAddress)
  }}

  if(exchange == 'uni'){
      let allowance = await erc20TokenContract.methods.allowance(meAddress,UNISWAP_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT UNI',allowance, token,tokenAddress)
      await swapToken_UNI(tokenAddress)
  }else{
      const approvedToken = await erc20TokenContract.methods.approve(UNISWAP_ROUTER_ADDRESS,infinite_tokens).send({ from: meAddress });
      console.log('APPROVING TOKEN WITH UNI',allowance, token,tokenAddress)
      await swapToken_UNI(tokenAddress)
  }}
}

async function swapEth_SUSHI(trading_address,expectedAmount) {
  if(profit>10){
  gasPrice = (Math.round(currentgasPrice*1.25)).toString()
  }else{
  gasPrice = (Math.round(currentgasPrice*1.25)).toString()}
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
  const myContract = await sushiRouterContract.methods.swapExactETHForTokens(expectedAmount,address_pair,meAddress, DEADLINE)//.send(SETTINGS_1)//
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(est_gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: SUSHI_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  value: web3.utils.toHex(3e16) //100000000000000000
}
  console.log(
  'Transaction Action, SWAP',
  web3.utils.fromWei(flash_amount), _inputSymbol,
  'for',
  web3.utils.fromWei(expectedAmount),
  _outputSymbol,
  'on SUSHI',
  'Expected Transaction Fee',
  (est_gas * .75)*web3.utils.fromWei(gasPrice),
  'ETH with gas price of',
   web3.utils.fromWei(gasPrice),
  'and gas of',
  est_gas)
  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(meAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'ropsten' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
  })

  receipt = await sendRawTransaction(txData)
  forceReceipt()
  monitoringPrice = true
  pairs_monitoringPrice = true
  priceMonitor = setInterval(async () => { await monitorPrice() }, 60000) //60 seconds
  pairs_priceMonitor = setInterval(async () => { await pairs_monitorPrice() }, 310000) //310 seconds

  checkTokenApproval(trading_address,'uni')
}

async function forceReceipt(){
  try{
  const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)
  console.log('THIS IS THE BULLSHIT THAT KEEPS CRASHING THE PROGRAM', info)
  let data_info = info.logs[2].data.toString()
  token = web3.utils.hexToNumberString(data_info)}
  catch(e){
    forceReceipt()
  }
}

async function swapEth_UNI(trading_address,expectedAmount) {
  if(profit>10){
  gasPrice = (Math.round(currentgasPrice*1.25)).toString()
  }else{
  gasPrice = (Math.round(currentgasPrice*1.25)).toString()}
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
  const myContract = await uniswapRouterContract.methods.swapExactETHForTokens(expectedAmount,address_pair,meAddress, DEADLINE)//.send(SETTINGS_1)//
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(est_gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  value: web3.utils.toHex(3e16)
}
console.log(
  'Transaction Action, SWAP',
  web3.utils.fromWei(flash_amount), _inputSymbol,
  'for',
  web3.utils.fromWei(expectedAmount),
  _outputSymbol,
  'on UNI',
  'Expected Transaction Fee',
  (est_gas * .75)*web3.utils.fromWei(gasPrice),
  'ETH with gas price of',
   web3.utils.fromWei(gasPrice),
  'and gas of',
  est_gas)
  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(meAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'ropsten' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
  })

  receipt = await sendRawTransaction(txData)
  forceReceipt()


  monitoringPrice = true
  pairs_monitoringPrice = true
  priceMonitor = setInterval(async () => { await monitorPrice() }, 80000) //60 seconds
  pairs_priceMonitor = setInterval(async () => { await pairs_monitorPrice() }, 310000) //310 seconds

  checkTokenApproval(trading_address,'sushi')
}

async function swapToken_UNI(trading_address) {
 try{
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [trading_address,_inputAddress]//
  let myContract = await uniswapRouterContract.methods.swapExactTokensForETH(token,flash_amount,address_pair,meAddress, DEADLINE)
  const data = myContract.encodeABI();
  gasPrice = (Math.round(currentgasPrice*1)).toString()
  const txData = {
  gasLimit: web3.utils.toHex(est_gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  //value: web3.utils.toHex(1e17)
  }

  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(meAddress).then(txCount => {
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
    networkisBusy = 'false'
    monitoringPrice = false
    await monitorPrice()
  }catch (error) {
  console.error(error);
  token = toPlainString(Math.round(token*.95))
  swapToken_UNI(trading_address)
  }
}

async function swapToken_SUSHI(trading_address) {
  try{
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [trading_address,_inputAddress]//
  let myContract = await sushiRouterContract.methods.swapExactTokensForETH(token,flash_amount,address_pair,meAddress, DEADLINE)
  gasPrice = (Math.round(currentgasPrice*1)).toString()
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(est_gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: SUSHI_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  //value: web3.utils.toHex(1e17)
  }

  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(meAddress).then(txCount => {
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
    networkisBusy = 'false'
    monitoringPrice = false
    await monitorPrice()
  }catch (error) {
  console.error(error);
  token = toPlainString(Math.round(token*.95))
  swapToken_UNI(trading_address)
}
await monitorPrice()
}

async function create_record(exchangepath, inputSymbol, outputSymbol, difference, time){
  const random = Math.floor((Math.random() * 10000) + 1);
  const obj = {inputSymbol, outputSymbol, difference, time}
  const fs = require('fs');
  fs.writeFile("/Users/julian/Desktop/Price/arbi_ops/arbi_op."+exchangepath+"-"+inputSymbol+"-"+outputSymbol+random+".txt", JSON.stringify(obj), function(err) {
      if(err) {
  return console.log(err);
      }

      console.log("The file was saved!");
  });
}

priceMonitor = setInterval(async () => { await monitorPrice() }, 10000) //75 seconds 6 hours of infura
pairs_priceMonitor = setInterval(async () => { await pairs_monitorPrice() }, 310000) //310 seconds

function toPlainString(num) {
  return (''+ +num).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
    function(a,b,c,d,e) {
      return e < 0
        ? b + '0.' + Array(1-e-c.length).join(0) + c + d
        : b + c + d + Array(e-d.length+1).join(0);
    });
}

/*
async function FASTcheckTokenApproval(tokenAddress, exchange){
  let infinite_tokens = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
  const erc20TokenContract = new web3.eth.Contract(ERC20_TOKEN_ABI, tokenAddress)

  if(exchange == 'sushi'){
      let allowance = await erc20TokenContract.methods.allowance(meAddress,SUSHI_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT SUSHI',allowance, token,tokenAddress)
      await swapToken_SUSHI(tokenAddress)
  }else{
      const approvedToken = await erc20TokenContract.methods.approve(SUSHI_ROUTER_ADDRESS,infinite_tokens)//.send({ from: meAddress });
      console.log('APPROVING TOKEN WITH SUSHI',allowance, token,tokenAddress)
      const data = approvedToken.encodeABI();
      const txData = {
      gasLimit: web3.utils.toHex(90000),
      gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
      to: SUSHI_ROUTER_ADDRESS,
      from: meAddress,
      data: web3.utils.toHex(data),
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
      await swapToken_SUSHI(tokenAddress)
  }
}
  if(exchange == 'uni'){
      let allowance = await erc20TokenContract.methods.allowance(meAddress,UNISWAP_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT UNI',allowance, token,tokenAddress)
      await swapToken_UNI(tokenAddress)
  }else{
      const approvedToken = await erc20TokenContract.methods.approve(UNISWAP_ROUTER_ADDRESS,infinite_tokens)//.send({ from: meAddress });
      console.log('APPROVING TOKEN WITH UNI',allowance, token,tokenAddress)
      const data = approvedToken.encodeABI();
      const txData = {
      gasLimit: web3.utils.toHex(90000),
      gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
      to: UNISWAP_ROUTER_ADDRESS,
      from: meAddress,
      data: web3.utils.toHex(data),
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
      await swapToken_UNI(tokenAddress)
  }
}
}
*/
