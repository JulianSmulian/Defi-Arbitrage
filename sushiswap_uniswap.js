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
let highestProfit = -100
const meAddress = '0x8b12bacf44bd9a2a06fd09f326a0d8e70741e3c1'
const flash_amount ='0100000000000000000'
const est_gas  = 120000
let ethPrice = '2500'
let currentgasPrice
let priceMonitor
let monitoringPrice = false
let pairs_priceMonitor
let pairs_monitoringPrice = false
const pairs = [
  { symbol: 'ALCX',   address: '0xdbdb4d16eda451d0503b854cf79d55697f90c8df' },
  { symbol: 'ALEPH',  address: '0x27702a26126e0b3702af63ee09ac4d1a084ef628' },//
  { symbol: 'ALPHA',  address: '0xa1faa113cbe53436df28ff0aee54275c13b40975' },//
  { symbol: 'AMPL',   address: '0xd46ba6d942050d489dbd938a2c909a5d5039a161' },//
  { symbol: 'ANY' ,   address: '0xf99d58e463a2e07e5692127302c20a191861b4d6' },//
  { symbol: 'API3',   address: '0x0b38210ea11411557c13457d4da7dc6ea731b88a' },//
  { symbol: 'ARMOR',  address: '0x1337def16f9b486faed0293eb623dc8395dfe46a' },//
  { symbol: 'AXS' ,   address: '0xf5d669627376ebd411e34b98f19c868c8aba5ada' },//
  { symbol: 'ARCH',   address: '0x1f3f9d3068568f8040775be2e8c03c103c61f3af' },//
  { symbol: 'BAO',    address: '0x374cb8c27130e2c9e04f44303f3c8351b9de61c1' },//
  { symbol: 'BAL' ,   address: '0xba100000625a3754423978a60c9317c58a424e3d' },//
  { symbol: 'COMBO',  address: '0xffffffff2ba8f66d4e51811c5190992176930278' },//
  { symbol: 'COMP',   address: '0xc00e94cb662c3520282e6f5717214004a7f26888' },//
  { symbol: 'COVER',  address: '0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713' },//
  { symbol: 'CREAM',  address: '0x2ba592F78dB6436527729929AAf6c908497cB200' },//
  { symbol: 'CRV' ,   address: '0xd533a949740bb3306d119cc777fa900ba034cd52' },//
  { symbol: 'CVP',    address: '0x38e4adb44ef08f22f5b5b76a8f0c2d0dcbe7dca1' },//
  { symbol: 'DAI',    address: '0x6b175474e89094c44da98b954eedeac495271d0f' },//
  { symbol: 'DEXTF',  address: '0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0' },
  { symbol: 'DFD' ,   address: '0x20c36f062a31865bed8a5b1e512d9a1a20aa333a' },//
  { symbol: 'DFX',    address: '0x888888435fde8e7d4c54cab67f206e4199454c60' },//
  { symbol: 'DPI' ,   address: '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b' },//
  { symbol: 'DUSD',   address: '0x5bc25f649fc4e26069ddf4cf4010f9f706c23831' },//
  { symbol: 'FARM',   address: '0xa0246c9032bc3a600820415ae600c6388619a14d' },
  { symbol: 'FTM' ,   address: '0x4e15361fd6b4bb609fa63c81a2be19d873717870' },//
  { symbol: 'FTT' ,   address: '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9' },//
  { symbol: 'GNO' ,   address: '0x6810e776880c02933d47db1b9fc05908e5386b96' },//
  { symbol: 'HEGIC',  address: '0x584bc13c7d411c00c01a62e8019472de68768430' },//
  { symbol: 'ICHI',   address: '0x903bef1736cddf2a537176cf3c64579c3867a881' },//
  { symbol: 'INDEX',  address: '0x0954906da0bf32d5479e25f46056d22f08464cab' },//
  { symbol: 'IDLE',   address: '0x875773784af8135ea0ef43b5a374aad105c5d39e' },//
  { symbol: 'INJ',    address: '0xe28b3b32b6c345a34ff64674606124dd5aceca30' },//
  { symbol: 'INV' ,   address: '0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68' },//
  { symbol: 'JRT' ,   address: '0x8a9c67fee641579deba04928c4bc45f66e26343a' },//
  { symbol: 'KP3R',   address: '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44' },//
  { symbol: 'LINK',   address: '0x514910771af9ca656af840dff83e8264ecf986ca' },//
  { symbol: 'LON' ,   address: '0x0000000000095413afc295d19edeb1ad7b71c952' },//
  { symbol: 'MATIC',  address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0' },//
  { symbol: 'MKR' ,   address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2' },
  { symbol: 'MPH' ,   address: '0x8888801af4d980682e47f1a9036e589479e835c5' },//
  { symbol: 'MTA' ,   address: '0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2' },//
  { symbol: 'MUST',   address: '0x6810e776880c02933d47db1b9fc05908e5386b96' },//
  { symbol: 'OMG' ,   address: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07' },//
  { symbol: 'PERP',   address: '0xbc396689893d065f41bc2c6ecbee5e0085233447' },//
  { symbol: 'PICKLE', address: '0x429881672b9ae42b8eba0e26cd9c73711b891ca5' },//
  { symbol: 'RARI',   address: '0xfca59cd816ab1ead66534d82bc21e7515ce441cf' },
  { symbol: 'REN' ,   address: '0x408e41876cccdc0f92210600ef50372656052a38' },
  { symbol: 'RGT' ,   address: '0xd291e7a03283640fdc51b121ac401383a46cc623' },
  { symbol: 'RLC',    address: '0x607f4c5bb672230e8672085532f7e901544a7375' },
  { symbol: 'ROOK',   address: '0xfa5047c9c78b8877af97bdcb85db743fd7313d4a' },
  { symbol: 'SDT',    address: '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f' },
  { symbol: 'SECRET', address: '0x2b89bf8ba858cd2fcee1fada378d5cd6936968be' },
  { symbol: 'SEEN',   address: '0xca3fe04c7ee111f0bbb02c328c699226acf9fd33' },
  { symbol: 'SPANK',  address: '0x42d6622dece394b54999fbd73d108123806f6a18' },
  { symbol: 'SRM' ,   address: '0x476c5e26a75bd202a9683ffd34359c0cc15be0ff' },
  { symbol: 'STAKE',  address: '0x0ae055097c6d159879521c384f1d2123d1f195e6' },
  { symbol: 'SUPER',  address: '0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55' },
  { symbol: 'SUSHI',  address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2' },
  { symbol: 'SX',     address: '0x99fe3b1391503a1bc1788051347a1324bff41452' },
  { symbol: 'TORN' ,  address: '0x77777feddddffc19ff86db637967013e6c6a116c' },
  { symbol: 'TRDL',   address: '0x297d33e17e61c2ddd812389c2105193f8348188a' },
  { symbol: 'TRU',    address: '0x4c19596f5aaff459fa38b0f7ed92f11ae6543784' },
  { symbol: 'TUSD' ,  address: '0x0000000000085d4780b73119b644ae5ecd22b376' },
  { symbol: 'USDC',   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  { symbol: 'UST' ,   address: '0xa47c8bf37f92abed4a126bda807a7b7498661acd' },
  { symbol: 'UWL',    address: '0xdbdd6f355a37b94e6c7d32fef548e98a280b8df5' },
  { symbol: 'VSP' ,   address: '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421' },
  { symbol: 'WBTC',   address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  { symbol: 'XFT',    address: '0xabe580e7ee158da464b51ee1a83ac0289622e6be' },
  { symbol: 'YAM' ,   address: '0x0aacfbec6a24756c20d41914f2caba817c0d8521' },
  { symbol: 'YFI' ,   address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e' },
  { symbol: 'YLD' ,   address: '0xf94b5c5651c888d928439ab6514b93944eee6f48' },
  { symbol: 'YPIE',   address: '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31' },
  { symbol: 'ZRX' ,   address: '0xe41d2489571d322189246dafa5ebde1f4699f498' },
];
let token
let num_uni;
let num_sushi;
let _inputSymbol;
let _outputSymbol;
let _inputAddress = '0x'
let _outputAddress = '0x'
let approved = false
let weth = [
  { symbol: 'WETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'},
];
let eth_pairs = [
  { symbol: 'ALCX',   address: '0xdbdb4d16eda451d0503b854cf79d55697f90c8df' },
  { symbol: 'ALEPH',  address: '0x27702a26126e0b3702af63ee09ac4d1a084ef628' },//
  { symbol: 'ALPHA',  address: '0xa1faa113cbe53436df28ff0aee54275c13b40975' },//
  { symbol: 'AMPL',   address: '0xd46ba6d942050d489dbd938a2c909a5d5039a161' },//APPROVED
  { symbol: 'ANY' ,   address: '0xf99d58e463a2e07e5692127302c20a191861b4d6' },//
  { symbol: 'API3',   address: '0x0b38210ea11411557c13457d4da7dc6ea731b88a' },//
  { symbol: 'ARMOR',  address: '0x1337def16f9b486faed0293eb623dc8395dfe46a' },//
  { symbol: 'AXS' ,   address: '0xf5d669627376ebd411e34b98f19c868c8aba5ada' },//
  { symbol: 'ARCH',   address: '0x1f3f9d3068568f8040775be2e8c03c103c61f3af' },//
  { symbol: 'BAO',    address: '0x374cb8c27130e2c9e04f44303f3c8351b9de61c1' },//
  { symbol: 'BAL' ,   address: '0xba100000625a3754423978a60c9317c58a424e3d' },//
  { symbol: 'COMBO',  address: '0xffffffff2ba8f66d4e51811c5190992176930278' },//
  { symbol: 'COMP',   address: '0xc00e94cb662c3520282e6f5717214004a7f26888' },
  { symbol: 'COVER',  address: '0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713' },//
  { symbol: 'CREAM',  address: '0x2ba592F78dB6436527729929AAf6c908497cB200' },//
  { symbol: 'CRV' ,   address: '0xd533a949740bb3306d119cc777fa900ba034cd52' },//
  { symbol: 'CVP',    address: '0x38e4adb44ef08f22f5b5b76a8f0c2d0dcbe7dca1' },//
  { symbol: 'DAI',    address: '0x6b175474e89094c44da98b954eedeac495271d0f' },//APPROVED
  { symbol: 'DEXTF',  address: '0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0' },
  { symbol: 'DFD' ,   address: '0x20c36f062a31865bed8a5b1e512d9a1a20aa333a' },//APPROVED
  { symbol: 'DFX',    address: '0x888888435fde8e7d4c54cab67f206e4199454c60' },//
  { symbol: 'DPI' ,   address: '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b' },//
  { symbol: 'DUSD',   address: '0x5bc25f649fc4e26069ddf4cf4010f9f706c23831' },//APPROVED
  { symbol: 'FARM',   address: '0xa0246c9032bc3a600820415ae600c6388619a14d' },
  { symbol: 'FTM' ,   address: '0x4e15361fd6b4bb609fa63c81a2be19d873717870' },//
  { symbol: 'FTT' ,   address: '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9' },//
  { symbol: 'GNO' ,   address: '0x6810e776880c02933d47db1b9fc05908e5386b96' },//
  { symbol: 'HEGIC',  address: '0x584bc13c7d411c00c01a62e8019472de68768430' },//
  { symbol: 'ICHI',   address: '0x903bef1736cddf2a537176cf3c64579c3867a881' },//
  { symbol: 'INDEX',  address: '0x0954906da0bf32d5479e25f46056d22f08464cab' },//
  { symbol: 'IDLE',   address: '0x875773784af8135ea0ef43b5a374aad105c5d39e' },//
  { symbol: 'INJ',    address: '0xe28b3b32b6c345a34ff64674606124dd5aceca30' },//
  { symbol: 'INV' ,   address: '0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68' },//
  { symbol: 'JRT' ,   address: '0x8a9c67fee641579deba04928c4bc45f66e26343a' },//
  { symbol: 'KP3R',   address: '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44' },//
  { symbol: 'LINK',   address: '0x514910771af9ca656af840dff83e8264ecf986ca' },//
  { symbol: 'LON' ,   address: '0x0000000000095413afc295d19edeb1ad7b71c952' },//
  { symbol: 'MATIC',  address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0' },//
  { symbol: 'MKR' ,   address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2' },
  { symbol: 'MPH' ,   address: '0x8888801af4d980682e47f1a9036e589479e835c5' },//
  { symbol: 'MTA' ,   address: '0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2' },//
  { symbol: 'MUST',   address: '0x6810e776880c02933d47db1b9fc05908e5386b96' },//
  { symbol: 'OMG' ,   address: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07' },//
  { symbol: 'PERP',   address: '0xbc396689893d065f41bc2c6ecbee5e0085233447' },//
  { symbol: 'PICKLE', address: '0x429881672b9ae42b8eba0e26cd9c73711b891ca5' },//
  { symbol: 'RARI',   address: '0xfca59cd816ab1ead66534d82bc21e7515ce441cf' },
  { symbol: 'REN' ,   address: '0x408e41876cccdc0f92210600ef50372656052a38' },
  { symbol: 'RGT' ,   address: '0xd291e7a03283640fdc51b121ac401383a46cc623' },
  { symbol: 'RLC',    address: '0x607f4c5bb672230e8672085532f7e901544a7375' },
  { symbol: 'ROOK',   address: '0xfa5047c9c78b8877af97bdcb85db743fd7313d4a' },
  { symbol: 'SDT',    address: '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f' },
  { symbol: 'SECRET', address: '0x2b89bf8ba858cd2fcee1fada378d5cd6936968be' },
  { symbol: 'SEEN',   address: '0xca3fe04c7ee111f0bbb02c328c699226acf9fd33' },
  { symbol: 'SPANK',  address: '0x42d6622dece394b54999fbd73d108123806f6a18' },
  { symbol: 'SRM' ,   address: '0x476c5e26a75bd202a9683ffd34359c0cc15be0ff' },
  { symbol: 'STAKE',  address: '0x0ae055097c6d159879521c384f1d2123d1f195e6' },
  { symbol: 'SUPER',  address: '0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55' },
  { symbol: 'SUSHI',  address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2' },
  { symbol: 'SX',     address: '0x99fe3b1391503a1bc1788051347a1324bff41452' },
  { symbol: 'TORN' ,  address: '0x77777feddddffc19ff86db637967013e6c6a116c' },
  { symbol: 'TRDL',   address: '0x297d33e17e61c2ddd812389c2105193f8348188a' },
  { symbol: 'TRU',    address: '0x4c19596f5aaff459fa38b0f7ed92f11ae6543784' },
  { symbol: 'TUSD' ,  address: '0x0000000000085d4780b73119b644ae5ecd22b376' },
  { symbol: 'USDC',   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  { symbol: 'UST' ,   address: '0xa47c8bf37f92abed4a126bda807a7b7498661acd' },
  { symbol: 'UWL',    address: '0xdbdd6f355a37b94e6c7d32fef548e98a280b8df5' },
  { symbol: 'VSP' ,   address: '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421' },
  { symbol: 'WBTC',   address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  { symbol: 'XFT',    address: '0xabe580e7ee158da464b51ee1a83ac0289622e6be' },
  { symbol: 'YAM' ,   address: '0x0aacfbec6a24756c20d41914f2caba817c0d8521' },
  { symbol: 'YFI' ,   address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e' },
  { symbol: 'YLD' ,   address: '0xf94b5c5651c888d928439ab6514b93944eee6f48' },
  { symbol: 'YPIE',   address: '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31' },
  { symbol: 'ZRX' ,   address: '0xe41d2489571d322189246dafa5ebde1f4699f498' },
];
/*
let veryhighgas_eth_pairs = [{ //not worth arbitrage
  { symbol: 'AAVE',   address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9' },//361
  { symbol: 'AKRO',   address: '0x8ab7404063ec4dbcfd4598215992dc3f8ec853d7' },//192
  { symbol: 'AMP' ,   address: '0xff20817765cb7f73d4bde2e66e067e58d11095c2' },//271
  { symbol: 'ANT' ,   address: '0xa117000000f279d81a1d3cc75430faa017fa5a2e' },//237
  { symbol: 'BAC',    address: '0x3449fc1cd036255ba1eb19d65ff4ba2b8903a69a' },//290
  { symbol: 'BADGER', address: '0x3472a5a71965499acd81997a54bba8d852c6e53d' },//264
  { symbol: 'BAND',   address: '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55' },//260
  { symbol: 'BZRX',   address: '0x77777feddddffc19ff86db637967013e6c6a116c' },//264
  { symbol: 'DIGG',   address: '0x798d1be841a82a273720ce31c822c61a67a601c3' },//238
  { symbol: 'DNT',    address: '0x0abdace70d3790235af448c88547603b945604ea' },//271
  { symbol: 'DOUGH',  address: '0xad32a8e6220741182940c5abf610bde99e737b2d' },//270
  { symbol: 'ESD' ,   address: '0x36f3fd68e7325a35eb768f1aedaae9ea0689d723' },//271
  { symbol: 'GRT' ,   address: '0xc944e90c64b2c07662a292be6244bdf05cda44a7' },//228
  { symbol: 'LDO' ,   address: '0x5a98fcbea516cf06857215779fd812ca3bef1b32' },//264
  { symbol: 'LINA',   address: '0x3e9bc21c9b189c09df3ef1b824798658d5011937' },//193
  { symbol: 'MARK',   address: '0x67c597624b17b16fb77959217360b7cd18284253' },
  { symbol: 'NFTX',   address: '0x87d73e916d7057945c9bcd8cdd94e42a6f47f776' },//264
  { symbol: 'OCEAN',  address: '0x967da4048cd07ab37855c090aaf366e4ce1b9f48' },//222
  { symbol: 'RENDOG', address: '0x3832d2f059e55934220881f831be501d180671a7' },//271
  { symbol: 'REVV',   address: '0x557B933a7C2c45672B610F8954A3deB39a51A8Ca' },
  { symbol: 'SNX ',   address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f' },
  { symbol: 'sUSD',   address: '0x57ab1ec28d129707052df4df418d58a2d46d5f51' },
  { symbol: 'SWAG',   address: '0x87edffde3e14c7a66c9b9724747a1c5696b742e6' },
  { symbol: 'UMA' ,   address: '0x04fa0d235c4abf4bcf4787af4cf447de572ef828' },
  { symbol: 'UNI' ,   address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984' },
  { symbol: 'USDN',   address: '0x674c6ad92fd080e4004b2312b45f796a192d27a0' },
  { symbol: 'YETI',   address: '0xb4bebd34f6daafd808f73de0d10235a92fbb6c3d' },
  { symbol: 'ZLOT',   address: '0xa8e7ad77c60ee6f30bac54e2e7c0617bd7b5a03e' },//NEW


}]
let no_liquidity_pairs[
  { symbol: 'AERGO',  address: '0x91af0fbb28aba7e31403cb457106ce79397fd4e6' }, //Not enough uni liquidity
  { symbol: 'EGT',    address: '0x2aa5ce395b00cc486159adbdd97c55b535cf2cf9' },//
  { symbol: 'FNX',    address: '0xef9cd7882c067686691b6ff49e650b43afbbcc6b' },//

]
let low_liquidity_pairs = [{
  { symbol: 'BANK',   address: '0x24a6a37576377f63f194caa5f518a60f45b42921' },//low uni liquiidity
  { symbol: 'BOR' ,   address: '0x3c9d6c1c73b31c837832c72e04d3152f051fc1a9' },//
  { symbol: 'DAO',    address: '0x0f51bb10119727a7e5ea3538074fb341f56b09ad' },//
  { symbol: 'PREMIA', address: '0x6399c842dd2be3de30bf99bc7d1bbf6fa3650e70' },
  { symbol: 'USDP',   address: '0x1456688345527be1f37e9e627da0837d6f08c925' },
  { symbol: 'UOP',    address: '0xe4ae84448db5cfe1daf1e6fb172b469c161cb85f' },
  { symbol: 'MASK',   address: '0x69af81e73a73b40adf4f3d4223cd9b1ece623074' },//




}]
*/
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))
const web3 = new Web3(new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL))
const UNISWAP_FACTORY_ADDRESS = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
const uniswapFactoryContract = new web3.eth.Contract(UNISWAP_FACTORY_ABI, UNISWAP_FACTORY_ADDRESS)
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const uniswapRouterContract = new web3.eth.Contract(UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS)
const SUSHI_FACTORY_ADDRESS = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
const sushiFactoryContract = new web3.eth.Contract(SUSHI_FACTORY_ABI, SUSHI_FACTORY_ADDRESS)
const SUSHI_ROUTER_ADDRESS = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
const sushiRouterContract = new web3.eth.Contract(SUSHI_ROUTER_ABI,SUSHI_ROUTER_ADDRESS)
let networkisBusy = 'false'
let gasPrice

function financial(x) {
return Number.parseFloat(x).toFixed(2);
}
//1st Check pairs at Uniswap and Sushiswap
async function checkPair(args) {
  monitoringPrice = false
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

  let cut = -50
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
  if(profit > zero && profit <500){
    if(profit>50 && profit <500){
      gasPrice = (await web3.eth.getGasPrice())*.5
      console.log('GAS PRICE FAST TRANSACTION', gasPrice)
    }else{
      gasPrice = await web3.eth.getGasPrice();
      console.log('GAS PRICE NORMAL TRANSACTION', gasPrice)
    }
      monitoringPrice = true
      trading_address = outputAddress
      console.log('MAKING TRADE FOR',_outputSymbol, trading_address)
      //swapEth_UNI(trading_address)
      console.log(_outputSymbol,'Un->Su',financial(profit),'USD','START', web3.utils.fromWei(flash_amount),'ETH','---','SUSHISWAP RETURNS',web3.utils.fromWei(sushiswapAmountsOut[1]),'ETH')
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
   let profit = (swapprofit_inETH - gascost_inETH)*ethPrice
   //console.log('PROFIT IN ETH', (swapprofit_inETH-gascost_inETH), 'PROFIT IN USD', profit, 'SWAPPROFIT', swapprofit_inETH, 'SWAPCOST', gascost_inETH)
   if(profit>highestProfit){
     highestProfit = profit
   }
  if(profit < cut){
   //console.log('Cutting', position, _outputSymbol)
   eth_pairs.splice(position, 1);
  }
  if(profit > zero && profit <500){
    if(profit>50 && profit <500){
      gasPrice = (await web3.eth.getGasPrice())*.5
    }else{
      gasPrice = await web3.eth.getGasPrice();
    }
      monitoringPrice = true
      trading_address = outputAddress
      console.log('MAKING TRADE FOR',_outputSymbol, trading_address)
      //swapEth_SUSHI(trading_address)
      console.log(_outputSymbol,'Su->Un',financial(profit),'USD','START', web3.utils.fromWei(flash_amount),'ETH','---','UNISWAP RETURNS',web3.utils.fromWei(uniswapAmountsOut[1]),'ETH')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record('Su-Un',_inputSymbol,_outputSymbol, profit, time)
      networkisBusy = true

}else{
 console.log(_outputSymbol,'Su->Un',financial(profit),'USD')

}
}
    _inputAddress=inputAddress
    _outputAddress=outputAddress
}

async function monitorPrice() {
  let time = moment().tz('America/Chicago').format()
  //currentgasPrice = 030000000000
  currentgasPrice = await web3.eth.getGasPrice()
  console.log('CHECKING ALL PAIRS - ETH GAS IS ', currentgasPrice, 'WEI')
  console.log('HIGHEST PROFIT SO FAR IS $', financial(highestProfit))
  if(currentgasPrice>100000000000){
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
          networkisBusy = true
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

async function swapEth_SUSHI(trading_address) {
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
  const myContract = await sushiRouterContract.methods.swapExactETHForTokens(0,address_pair,meAddress, DEADLINE)//.send(SETTINGS_1)//
  const gas = 200000;
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  value: web3.utils.toHex(8e15)
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
  console.log('THIS IS THE BULLSHIT THAT KEEPS CRASHING THE PROGRAM', info)
  let data_info = await info.logs[2].data.toString()
  token = web3.utils.hexToNumberString(data_info)
  monitoringPrice = true
  pairs_monitoringPrice = true
  priceMonitor = setInterval(async () => { await monitorPrice() }, 60000) //60 seconds
  pairs_priceMonitor = setInterval(async () => { await pairs_monitorPrice() }, 310000) //310 seconds
  swapToken_UNI()
}

async function swapEth_UNI(trading_address) {
  networkisBusy = true
  monitoringPrice = false
  pairs_monitoringPrice = false
  clearInterval(priceMonitor)
  clearInterval(pairs_monitorPrice)
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [_inputAddress,trading_address]//
  console.log('MY BALLS', address_pair)
  const web3 = new Web3(process.env.RPC_URL);//
  const networkId = await web3.eth.net.getId();
  const myContract = await uniswapRouterContract.methods.swapExactETHForTokens(0,address_pair,meAddress, DEADLINE)//.send(SETTINGS_1)//
  const gas = 200000;
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  value: web3.utils.toHex(8e15)
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
  console.log('THIS IS THE BULLSHIT THAT KEEPS CRASHING THE PROGRAM', info)
  let data_info = await info.logs[2].data.toString()
  token = web3.utils.hexToNumberString(data_info)

  monitoringPrice = true
  pairs_monitoringPrice = true
  priceMonitor = setInterval(async () => { await monitorPrice() }, 60000) //60 seconds
  pairs_priceMonitor = setInterval(async () => { await pairs_monitorPrice() }, 310000) //310 seconds
  swapToken_SUSHI()
}

async function swapToken_UNI(trading_address) {
  if(approved){
    console.log('Token is approved, selling token for Eth')
  }
  else{
    const erc20TokenContract = new web3.eth.Contract(ERC20_TOKEN_ABI, _outputAddress)
    const approvedToken = await erc20TokenContract.methods.approve(UNISWAP_ROUTER_ADDRESS,token).send({ from: meAddress });
    console.log(approvedToken)
    //setapproved somehow
  }
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [trading_address,_inputAddress]//
  let myContract = await uniswapRouterContract.methods.swapExactTokensForETH(token,'0',address_pair,meAddress, DEADLINE)
  const gas = 300000;
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  //value: web3.utils.toHex(1e17)
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
    networkisBusy = false

}

async function swapToken_SUSHI(trading_address) {
  if(approved){
    console.log('Token is approved, selling token for Eth')
  }
  else{
    const erc20TokenContract = new web3.eth.Contract(ERC20_TOKEN_ABI, _outputAddress)
    const approvedToken = await erc20TokenContract.methods.approve(UNISWAP_ROUTER_ADDRESS,token).send({ from: meAddress });
    console.log(approvedToken)
    //setapproved somehow
  }
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [trading_address,_inputAddress]//
  let myContract = await sushiRouterContract.methods.swapExactTokensForETH(token,'0',address_pair,meAddress, DEADLINE)
  const gas = 200000;
  const data = myContract.encodeABI();
  const txData = {
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(gasPrice), // 100 Gwei
  to: UNISWAP_ROUTER_ADDRESS,
  from: meAddress,
  data: web3.utils.toHex(data),
  //value: web3.utils.toHex(1e17)
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
    networkisBusy = false
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



priceMonitor = setInterval(async () => { await monitorPrice() }, 60000) //60 seconds
pairs_priceMonitor = setInterval(async () => { await pairs_monitorPrice() }, 310000) //310 seconds
