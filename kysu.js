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
const KYBER_ROUTER_ABI = require('./abis/kyberswap/kyber_router_abi.json')
let highestProfit = -100
const meAddress = '0x8b12bacf44bd9a2a06fd09f326a0d8e70741e3c1'
const flash_amount ='100000000000000000'
const est_gas  = 120000
let ethPrice
let currentgasPrice
let priceMonitor
let monitoringPrice = false
let pairs_priceMonitor
let pairs_monitoringPrice = false
const pairs = [
 { symbol:  '$TRDL',    uni:'TRUE', sushi:'TRUE', address:  '0x297D33e17e61C2Ddd812389C2105193f8348188a'},
 { symbol:  '1INCH',    kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x111111111117dC0aa78b770fA6A738034120C302'},
 { symbol:  '2KEY',     uni:'TRUE', sushi:'TRUE', address:  '0xe48972fcd82a274411c01834e2f031d4377fa2c0'},
 { symbol:  'AAVE',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'},
 { symbol:  'ADX',      uni:'TRUE', sushi:'TRUE', address:  '0xADE00C28244d5CE17D72E40330B1c318cD12B7c3'},
 //{ symbol:  'AERGO',    uni:'TRUE', sushi:'TRUE', address:  '0x91Af0fBB28ABA7E31403Cb457106Ce79397FD4E6'},
 //{ symbol:  'AKITA',    uni:'TRUE', sushi:'TRUE', address:  '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6'},
 { symbol:  'AKRO',     uni:'TRUE', sushi:'TRUE', address:  '0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7'},
 { symbol:  'ALCX',     uni:'TRUE', sushi:'TRUE', address:  '0xdbdb4d16eda451d0503b854cf79d55697f90c8df'},
 { symbol:  'ALEPH',    uni:'TRUE', sushi:'TRUE', address:  '0x27702a26126e0b3702af63ee09ac4d1a084ef628'},
 { symbol:  'ALPA',     uni:'TRUE', sushi:'TRUE', address:  '0x7cA4408137eb639570F8E647d9bD7B7E8717514A'},
 { symbol:  'ALPHA',    uni:'TRUE', sushi:'TRUE', address:  '0xa1faa113cbE53436Df28FF0aEe54275c13B40975'},
 { symbol:  'AMPL',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xd46ba6d942050d489dbd938a2c909a5d5039a161'},
 { symbol:  'ANT',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xa117000000f279D81A1D3cc75430fAA017FA5A2e'},
 { symbol:  'ANY' ,     uni:'TRUE', sushi:'TRUE', address:  '0xf99d58e463a2e07e5692127302c20a191861b4d6'},
 { symbol:  'API3',     uni:'TRUE', sushi:'TRUE', address:  '0x0b38210ea11411557c13457D4dA7dC6ea731B88a'},
 { symbol:  'ARCH',     uni:'TRUE', sushi:'TRUE', address:  '0x1F3f9D3068568F8040775be2e8C03C103C61f3aF'},
 { symbol:  'ARMOR',    uni:'TRUE', sushi:'TRUE', address:  '0x1337DEF16F9B486fAEd0293eb623Dc8395dFE46a'},
 { symbol:  'AXS' ,     uni:'TRUE', sushi:'TRUE', address:  '0xf5d669627376ebd411e34b98f19c868c8aba5ada'},
 //{ symbol:  'BAC',      uni:'TRUE', sushi:'TRUE', address:  '0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a'},
 { symbol:  'BAL' ,     uni:'TRUE', sushi:'TRUE', address:  '0xba100000625a3754423978a60c9317c58a424e3d'},
 //{ symbol:  'BAM',      kyber:'TRUE',  uni:'TRUE', address:  '0x22b3faaa8df978f6bafe18aade18dc2e3dfa0e0c'},
 { symbol:  'BAND',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55'},
 { symbol:  'BANK',     uni:'TRUE', sushi:'TRUE', address:  '0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198'},
 { symbol:  'BAO',      uni:'TRUE', sushi:'TRUE', address:  '0x374CB8C27130E2c9E04F44303f3c8351B9De61C1'},
 //{ symbol:  'BASE',     uni:'TRUE', sushi:'TRUE', address:  '0x07150e919b4de5fd6a63de1f9384828396f25fdc'},
 { symbol:  'BAT',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x0d8775f648430679a709e98d2b0cb6250d2887ef'},
 { symbol:  'BLO',      uni:'TRUE', sushi:'TRUE', address:  '0x68481f2c02BE3786987ac2bC3327171C5D05F9Bd'},
 { symbol:  'BLT',      uni:'TRUE', sushi:'TRUE', address:  '0x107c4504cd79C5d2696Ea0030a8dD4e92601B82e'},
 { symbol:  'BLZ',      kyber:'TRUE',  uni:'TRUE', address:  '0x5732046a883704404f284ce41ffadd5b007fd668'},
 { symbol:  'BOR',      uni:'TRUE', sushi:'TRUE', address:  '0x3c9d6c1C73b31c837832c72E04D3152f051fc1A9'},
 { symbol:  'VGX',      kyber:'TRUE',  uni:'TRUE', address:  '0x5af2be193a6abca9c8817001f45744777db30756'},
 //{ symbol:  'BSP',      uni:'TRUE', sushi:'TRUE', address:  '0xa1454f9c704AF96636F3A7532b9a04c411f85680'},
 { symbol:  'BUSD',     uni:'TRUE', sushi:'TRUE', address:  '0x4fabb145d64652a948d72533023f6e7a623c7c53'},
 { symbol:  'BZRX',     uni:'TRUE', sushi:'TRUE', address:  '0x56d811088235F11C8920698a204A5010a788f4b3'},
 { symbol:  'BZRX',     uni:'TRUE', sushi:'TRUE', address:  '0x56d811088235f11c8920698a204a5010a788f4b3'},
 { symbol:  'Bone',     uni:'TRUE', sushi:'TRUE', address:  '0x5C84bc60a796534bfeC3439Af0E6dB616A966335'},
 { symbol:  'CAVO',     uni:'TRUE', sushi:'TRUE', address:  '0x24ea9c1cfd77a8db3fb707f967309cf013cc1078'},
 { symbol:  'CHINU',    uni:'TRUE', sushi:'TRUE', address:  '0x5F72be0835e32D7c853e2fFd5Dd3d181D5B2Ad51'},
 //{ symbol:  'CND',      kyber:'TRUE',  uni:'TRUE', address:  '0xd4c435f5b09f855c3317c8524cb1f586e42795fa'},
 { symbol:  'COMBO',    uni:'TRUE', sushi:'TRUE', address:  '0xffffffff2ba8f66d4e51811c5190992176930278'},
 { symbol:  'COMP',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xc00e94cb662c3520282e6f5717214004a7f26888'},
 { symbol:  'COVER',    uni:'TRUE', sushi:'TRUE', address:  '0x4688a8b1F292FDaB17E9a90c8Bc379dC1DBd8713'},
 { symbol:  'COVER-OLD',uni:'TRUE', sushi:'TRUE', address:  '0x5D8d9F5b96f4438195BE9b99eee6118Ed4304286'},
 { symbol:  'CREAM',    kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x2ba592f78db6436527729929aaf6c908497cb200'},
 { symbol:  'CRV',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xd533a949740bb3306d119cc777fa900ba034cd52'},
 //{ symbol:  'CTX',      uni:'TRUE', sushi:'TRUE', address:  '0x321C2fE4446C7c963dc41Dd58879AF648838f98D'},
 { symbol:  'CVC' ,     uni:'TRUE', sushi:'TRUE', address:  '0x41e5560054824ea6b0732e656e3ad64e20e94e45'},
 { symbol:  'CVP',      uni:'TRUE', sushi:'TRUE', address:  '0x38e4adb44ef08f22f5b5b76a8f0c2d0dcbe7dca1'},
 { symbol:  'CZZ',      uni:'TRUE', sushi:'TRUE', address:  '0x20bf12A7bdb6d7B84069fb3b939892A301C981d1'},
 { symbol:  'DAI',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x6b175474e89094c44da98b954eedeac495271d0f'},
 { symbol:  'DAO',      uni:'TRUE', sushi:'TRUE', address:  '0x0f51bb10119727a7e5eA3538074fb341F56B09Ad'},
 { symbol:  'DAT',      kyber:'TRUE',  uni:'TRUE', address:  '0x81c9151de0c8bafcd325a57e3db5a5df1cebf79c'},
 { symbol:  'DEP',      uni:'TRUE', sushi:'TRUE', address:  '0x1A3496C18d558bd9C6C8f609E1B129f67AB08163'},
 { symbol:  'DEXTF',    uni:'TRUE', sushi:'TRUE', address:  '0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0'},
 { symbol:  'DFD',      uni:'TRUE', sushi:'TRUE', address:  '0x20c36f062a31865bED8a5B1e512D9a1A20AA333A'},
 { symbol:  'DFX',      uni:'TRUE', sushi:'TRUE', address:  '0x888888435FDe8e7d4c54cAb67f206e4199454c60'},
 { symbol:  'DGRO',     uni:'TRUE', sushi:'TRUE', address:  '0x01b8bcc8b75dd86025b455373F3C0814A060e6A8'},
 //{ symbol:  'DGX',      kyber:'TRUE',  uni:'TRUE', address:  '0x4f3afec4e5a3f2a6a1a411def7d7dfe50ee057bf'},
 { symbol:  'DIA',      uni:'TRUE', sushi:'TRUE', address:  '0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419'},
 { symbol:  'DNT',      uni:'TRUE', sushi:'TRUE', address:  '0x0AbdAce70D3790235af448C88547603b945604ea'},
 { symbol:  'DOGY',     uni:'TRUE', sushi:'TRUE', address:  '0x9c405acf8688AfB61B3197421cDeeC1A266c6839'},
 { symbol:  'DOUGH',    uni:'TRUE', sushi:'TRUE', address:  '0xad32A8e6220741182940c5aBF610bDE99E737b2D'},
 { symbol:  'DPI',      uni:'TRUE', sushi:'TRUE', address:  '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b'},
 { symbol:  'DRC',      uni:'TRUE', sushi:'TRUE', address:  '0xb78B3320493a4EFaa1028130C5Ba26f0B6085Ef8'},
 { symbol:  'DUCK',     uni:'TRUE', sushi:'TRUE', address:  '0x92E187a03B6CD19CB6AF293ba17F2745Fd2357D5'},
 { symbol:  'DUSD',     uni:'TRUE', sushi:'TRUE', address:  '0x5BC25f649fc4e26069dDF4cF4010F9f706c23831'},
 { symbol:  'EGT',      uni:'TRUE', sushi:'TRUE', address:  '0x2aA5cE395b00CC486159aDbDD97c55b535CF2cf9'},
 { symbol:  'ELX',      uni:'TRUE', sushi:'TRUE', address:  '0x9048c33c7BaE0bbe9ad702b17B4453a83900D154'},
 { symbol:  'ENJ' ,     kyber:'TRUE',  uni:'TRUE',address:  '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c'},
 { symbol:  'EQUAD',    kyber:'TRUE',  uni:'TRUE', address:  '0xc28e931814725bbeb9e670676fabbcb694fe7df2'},
 { symbol:  'ESD',      uni:'TRUE', sushi:'TRUE', address:  '0x36F3FD68E7325a35EB768F1AedaAe9EA0689d723'},
 //{ symbol:  'ETHBN',    uni:'TRUE', sushi:'TRUE', address:  '0x96b52B5BF8D902252D0714A1BD2651A785Fd2660'},
 { symbol:  'EURS',     kyber:'TRUE',  uni:'TRUE', address:  '0xdb25f211ab05b1c97d595516f45794528a807ad8'},
 { symbol:  'FARM',     uni:'TRUE', sushi:'TRUE', address:  '0xa0246c9032bc3a600820415ae600c6388619a14d'},
 //{ symbol:  'FORCE',    uni:'TRUE', sushi:'TRUE', address:  '0x6807D7f7dF53b7739f6438EABd40Ab8c262c0aa8'},
 { symbol:  'FORTH',    uni:'TRUE', sushi:'TRUE', address:  '0x77fba179c79de5b7653f68b5039af940ada60ce0'},
 { symbol:  'FOUR',     uni:'TRUE', sushi:'TRUE', address:  '0x4730fB1463A6F1F44AEB45F6c5c422427f37F4D0'},
 { symbol:  'FTM',      uni:'TRUE', sushi:'TRUE', address:  '0x4E15361FD6b4BB609Fa63C81A2be19d873717870'},
 { symbol:  'FTT' ,     uni:'TRUE', sushi:'TRUE', address:  '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9'},
 { symbol:  'FTX Token',uni:'TRUE', sushi:'TRUE', address:  '0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9'},
 { symbol:  'FUSE',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x970B9bB2C0444F5E81e9d0eFb84C8ccdcdcAf84d'},
 { symbol:  'FVT',      uni:'TRUE', sushi:'TRUE', address:  '0x45080a6531d671DDFf20DB42f93792a489685e32'},
 { symbol:  'FXS',      uni:'TRUE', sushi:'TRUE', address:  '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0'},
 { symbol:  'GEN',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x543ff227f64aa17ea132bf9886cab5db55dcaddf'},
 { symbol:  'GLM',      uni:'TRUE', sushi:'TRUE', address:  '0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429'},
 { symbol:  'GMT',      uni:'TRUE', sushi:'TRUE', address:  '0x7Ddc52c4De30e94Be3A6A0A2b259b2850f421989'},
 { symbol:  'GNO' ,     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x6810e776880c02933d47db1b9fc05908e5386b96'},
 { symbol:  'GNYerc20', uni:'TRUE', sushi:'TRUE', address:  '0xb1f871Ae9462F1b2C6826E88A7827e76f86751d4'},
 { symbol:  'GVT',      kyber:'TRUE',  uni:'TRUE', address:  '0x103c3a209da59d3e7c4a89307e66521e081cfdf0'},
 //{ symbol:  'GZE',      uni:'TRUE', sushi:'TRUE', address:  '0x4AC00f287f36A6Aad655281fE1cA6798C9cb727b'},
 { symbol:  'HEGIC',    uni:'TRUE', sushi:'TRUE', address:  '0x584bC13c7D411c00c01A62e8019472dE68768430'},
 { symbol:  'HXRO',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x4bD70556ae3F8a6eC6C4080A0C327B24325438f3'},
 { symbol:  'ICHI',     uni:'TRUE', sushi:'TRUE', address:  '0x903bef1736cddf2a537176cf3c64579c3867a881'},
 { symbol:  'ID',       kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xebd9d99a3982d547c5bb4db7e3b1f9f14b67eb83'},
 { symbol:  'IDLE',     uni:'TRUE', sushi:'TRUE', address:  '0x875773784Af8135eA0ef43b5a374AaD105c5D39e'},
 //{ symbol:  'ILV',      uni:'TRUE', sushi:'TRUE', address:  '0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E'},
 { symbol:  'IND',      kyber:'TRUE',  uni:'TRUE', address:  '0xf8e386eda857484f5a12e4b5daa9984e06e73705'},
 { symbol:  'INDEX',    uni:'TRUE', sushi:'TRUE', address:  '0x0954906da0Bf32d5479e25f46056d22f08464cab'},
 { symbol:  'INJ',      uni:'TRUE', sushi:'TRUE', address:  '0xe28b3b32b6c345a34ff64674606124dd5aceca30'},
 { symbol:  'INV',      uni:'TRUE', sushi:'TRUE', address:  '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68'},
 //{ symbol:  'IQ',       uni:'TRUE', sushi:'TRUE', address:  '0x579CEa1889991f68aCc35Ff5c3dd0621fF29b0C9'},
 { symbol:  'JRT',      uni:'TRUE', sushi:'TRUE', address:  '0x8A9C67fee641579dEbA04928c4BC45F66e26343A'},
 { symbol:  'KEY',      uni:'TRUE', sushi:'TRUE', address:  '0x4cc19356f2d37338b9802aa8e8fc58b0373296e7'},
 { symbol:  'KIRO',     uni:'TRUE', sushi:'TRUE', address:  '0xB1191F691A355b43542Bea9B8847bc73e7Abb137'},
 { symbol:  'KP3R',     uni:'TRUE', sushi:'TRUE', address:  '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44'},
 { symbol:  'L2',       uni:'TRUE', sushi:'TRUE', address:  '0xBbff34E47E559ef680067a6B1c980639EEb64D24'},
 { symbol:  'LCX',      uni:'TRUE', sushi:'TRUE', address:  '0x037A54AaB062628C9Bbae1FDB1583c195585fe41'},
 { symbol:  'LDN',      uni:'TRUE', sushi:'TRUE', address:  '0xb29663Aa4E2e81e425294193616c1B102B70a158'},
 { symbol:  'LDO',      uni:'TRUE', sushi:'TRUE', address:  '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'},
 { symbol:  'LEND',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03'},
 { symbol:  'LEV',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xbc194e6f748a222754C3E8b9946922c09E7d4e91'},
 { symbol:  'LINA',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x3E9BC21C9b189C09dF3eF1B824798658d5011937'},
 { symbol:  'LINK',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x514910771AF9Ca656af840dff83E8264EcF986CA'},
 { symbol:  'LON' ,     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x0000000000095413afc295d19edeb1ad7b71c952'},
 { symbol:  'LPT',      uni:'TRUE', sushi:'TRUE', address:  '0x58b6A8A3302369DAEc383334672404Ee733aB239'},
 //{ symbol:  'LRC',      kyber:'TRUE',  uni:'TRUE', address:  '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd'},
 { symbol:  'MANA',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'},
 { symbol:  'MATIC',    kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'},
 { symbol:  'MFG',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x6710c63432a2de02954fc0f851db07146a6c0312'},
 { symbol:  'MKR' ,     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'},
 { symbol:  'MLN',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xec67005c4e498ec7f55e092bd1d35cbc47c91892'},
 { symbol:  'MM',       uni:'TRUE', sushi:'TRUE', address:  '0xa283aA7CfBB27EF0cfBcb2493dD9F4330E0fd304'},
 { symbol:  'MOVE',     uni:'TRUE', sushi:'TRUE', address:  '0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C'},
 { symbol:  'MPH',      uni:'TRUE', sushi:'TRUE', address:  '0x8888801aF4d980682e47f1A9036e589479e835C5'},
 { symbol:  'MTA',      uni:'TRUE', sushi:'TRUE', address:  '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2'},
 { symbol:  'MUST',     uni:'TRUE', sushi:'TRUE', address:  '0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f'},
 { symbol:  'MYB',      uni:'TRUE', address:  '0x5d60d8d7ef6d37e16ebabc324de3be57f135e0bc'},
 { symbol:  'MYFI',     uni:'TRUE', sushi:'TRUE', address:  '0x22FE5BcAdA4E30A7310eFB1DfF7f90168dC42b62'},
 //{ symbol:  'MYM',      uni:'TRUE', sushi:'TRUE', address:  '0xb9892F9A892f3e251fc58B9076c56aDD528eb8A6'},
 { symbol:  'MoonGain', uni:'TRUE', sushi:'TRUE', address:  '0x4E26Ceb8A932114a95cfB682851b6e832f830062'},
 { symbol:  'NAOS',     uni:'TRUE', sushi:'TRUE', address:  '0x4a615bb7166210cce20e6642a6f8fb5d4d044496'},
 { symbol:  'NCT',      uni:'TRUE', sushi:'TRUE', address:  '0x8A9c4dfe8b9D8962B31e4e16F8321C44d48e246E'},
 { symbol:  'NFTX',     uni:'TRUE', sushi:'TRUE', address:  '0x87d73E916D7057945c9BcD8cdd94e42A6F47f776'},
 { symbol:  'NU',       uni:'TRUE', sushi:'TRUE', address:  '0x4fE83213D56308330EC302a8BD641f1d0113A4Cc'},
 { symbol:  'OCEAN',    kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x967da4048cD07aB37855c090aAF366e4ce1b9F48'},
 { symbol:  'OGN',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26'},
 { symbol:  'OMG' ,     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xd26114cd6ee289accf82350c8d8487fedb8a0c07'},
 { symbol:  'OPIUM',    uni:'TRUE', sushi:'TRUE', address:  '0x888888888889C00c67689029D7856AAC1065eC11'},
 { symbol:  'PAX',      kyber:'TRUE',  uni:'TRUE', address:  '0x8e870d67f660d95d5be530380d0ec0bd388289e1'},
 { symbol:  'PBTC',     uni:'TRUE', address:  '0x5228a22e72ccc52d415ecfd199f99d0665e7733b'},
 //{ symbol:  'PENDLE',   uni:'TRUE', sushi:'TRUE', address:  '0x808507121B80c02388fAd14726482e061B8da827'},
 { symbol:  'PERP',     uni:'TRUE', sushi:'TRUE', address:  '0xbC396689893D065F41bc2C6EcbeE5e0085233447'},
 { symbol:  'PICKLE',   uni:'TRUE', sushi:'TRUE', address:  '0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5'},
 //{ symbol:  'PKG',      uni:'TRUE', sushi:'TRUE', address:  '0x02F2D4a04E6E01aCE88bD2Cd632875543b2eF577'},
 { symbol:  'PKGX',     uni:'TRUE', sushi:'TRUE', address:  '0x70F823ed7643Fd7A26FDf8753827d31C16374FDE'},
 { symbol:  'PLR',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xe3818504c1b32bf1557b16c238b2e01fd3149c17'},
 { symbol:  'PMON',     uni:'TRUE', sushi:'TRUE', address:  '0x1796ae0b0fa4862485106a0de9b654eFE301D0b2'},
 { symbol:  'PNK',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d'},
 { symbol:  'PNT',      kyber:'TRUE',  uni:'TRUE', address:  '0x89ab32156e46f46d02ade3fecbe5fc4243b9aaed'},
 { symbol:  'POLY',     kyber:'TRUE',  uni:'TRUE', address:  '0x9992ec3cf6a55b00978cddf2b27bc6882d88d1ec'},
 { symbol:  'POND',     uni:'TRUE', sushi:'TRUE', address:  '0x57B946008913B82E4dF85f501cbAeD910e58D26C'},
 { symbol:  'POOL',     uni:'TRUE', sushi:'TRUE', address:  '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e'},
 { symbol:  'POWR',     uni:'TRUE', sushi:'TRUE', address:  '0x595832f8fc6bf59c85c527fec3740a1b7a361269'},
 //{ symbol:  'PREMIA',   uni:'TRUE', sushi:'TRUE', address:  '0x6399C842dD2bE3dE30BF99Bc7D1bBF6Fa3650E70'},
 { symbol:  'QNT',      kyber:'TRUE',  uni:'TRUE', address:  '0x4a220e6096b25eadb88358cb44068a3248254675'},
 { symbol:  'QSP',      uni:'TRUE', sushi:'TRUE', address:  '0x99ea4dB9EE77ACD40B119BD1dC4E33e1C070b80d'},
 { symbol:  'RAE',      kyber:'TRUE',  uni:'TRUE', address:  '0xe5a3229ccb22b6484594973a03a3851dcd948756'},
 { symbol:  'RARI',     uni:'TRUE', sushi:'TRUE', address:  '0xfca59cd816ab1ead66534d82bc21e7515ce441cf'},
 { symbol:  'REN',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x408e41876cCCDC0F92210600ef50372656052a38'},
 { symbol:  'RENBTC',   kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d'},
 { symbol:  'REP',      kyber:'TRUE',  uni:'TRUE', address:  '0x1985365e9f78359a9b6ad760e32412f4a445e862'},
 { symbol:  'REQ',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x8f8221aFbB33998d8584A2B05749bA73c37a938a'},
 { symbol:  'REVV',     kyber:'ZERO)', uni:'TRUE', sushi:'TRUE', address:  '0x557B933a7C2c45672B610F8954A3deB39a51A8Ca'},
 { symbol:  'RFOX',     uni:'TRUE', sushi:'TRUE', address:  '0xa1d6Df714F91DeBF4e0802A542E13067f31b8262'},
 { symbol:  'RGT' ,     uni:'TRUE', sushi:'TRUE', address:  '0xd291e7a03283640fdc51b121ac401383a46cc623'},
 { symbol:  'RLC',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x607f4c5bb672230e8672085532f7e901544a7375'},
 { symbol:  'ROBO',     uni:'TRUE', sushi:'TRUE', address:  '0x6FC2f1044A3b9bB3e43A43EC8F840843Ed753061'},
 { symbol:  'ROOBEE',   uni:'TRUE', sushi:'TRUE', address:  '0xA31B1767e09f842ECFd4bc471Fe44F830E3891AA'},
 { symbol:  'ROOK',     uni:'TRUE', sushi:'TRUE', address:  '0xfa5047c9c78b8877af97bdcb85db743fd7313d4a'},
 { symbol:  'ROOM',     uni:'TRUE', sushi:'TRUE', address:  '0xAd4f86a25bbc20FfB751f2FAC312A0B4d8F88c64'},
 { symbol:  'RSR',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x8762db106B2c2A0bccB3A80d1Ed41273552616E8'},
 { symbol:  'RSV',      kyber:'TRUE',  uni:'TRUE', address:  '0x196f4727526ea7fb1e17b2071b3d8eaa38486988'},
 //{ symbol:  'RULER',    uni:'TRUE', sushi:'TRUE', address:  '0x2aECCB42482cc64E087b6D2e5Da39f5A7A7001f8'},
 { symbol:  'RUNE',     uni:'TRUE', sushi:'TRUE', address:  '0x3155BA85D5F96b2d030a4966AF206230e46849cb'},
 { symbol:  'SAN',      kyber:'TRUE',  uni:'TRUE', address:  '0x7c5a0ce9267ed19b22f8cae653f198e3e8daf098'},
 { symbol:  'SAND',     kyber:'TRUE',  uni:'TRUE', address:  '0x3845badade8e6dff049820680d1f14bd3903a5d0'},
 { symbol:  'SDT',      uni:'TRUE', sushi:'TRUE', address:  '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'},
 //{ symbol:  'SEC',      uni:'TRUE', sushi:'TRUE', address:  '0x9C061DF134d11412151E9c200ce3F9f6F295094a'},
 { symbol:  'SECRET',   uni:'TRUE', sushi:'TRUE', address:  '0x2b89bf8ba858cd2fcee1fada378d5cd6936968be'},
 { symbol:  'SEEN',     uni:'TRUE', sushi:'TRUE', address:  '0xca3fe04c7ee111f0bbb02c328c699226acf9fd33'},
 { symbol:  'SFI',      uni:'TRUE', sushi:'TRUE', address:  '0xb753428af26E81097e7fD17f40c88aaA3E04902c'},
 { symbol:  'SHIB',     uni:'TRUE', sushi:'TRUE', address:  '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'},
 { symbol:  'SHOOB',    uni:'TRUE', sushi:'TRUE', address:  '0x2048EdE83b630846e01bD773a8b3dfF68489aa4F'},
 //{ symbol:  'SHPING',   uni:'TRUE', sushi:'TRUE', address:  '0x7C84e62859D0715eb77d1b1C4154Ecd6aBB21BEC'},
 { symbol:  'SNT',      kyber:'TRUE',  uni:'TRUE', address:  '0x744d70fdbe2ba4cf95131626614a1763df805b9e'},
 { symbol:  'SNX',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F'},
 { symbol:  'SPANK',    uni:'TRUE', sushi:'TRUE', address:  '0x42d6622deCe394b54999Fbd73D108123806f6a18'},
 { symbol:  'SRM' ,     uni:'TRUE', sushi:'TRUE', address:  '0x476c5e26a75bd202a9683ffd34359c0cc15be0ff'},
 { symbol:  'STAKE',    uni:'TRUE', sushi:'TRUE', address:  '0x0Ae055097C6d159879521C384F1D2123D1f195e6'},
 { symbol:  'STMX',     kyber:'TRUE',  uni:'TRUE', address:  '0xbe9375c6a420d2eeb258962efb95551a5b722803'},
 { symbol:  'SUPER',    uni:'TRUE', sushi:'TRUE', address:  '0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55'},
 { symbol:  'SURF',     uni:'TRUE', sushi:'TRUE', address:  '0xea319e87cf06203dae107dd8e5672175e3ee976c'},
 { symbol:  'SUSD',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x57ab1ec28d129707052df4df418d58a2d46d5f51'},
 { symbol:  'SUSHI',    kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2'},
 { symbol:  'SWAG',     uni:'TRUE', sushi:'TRUE', address:  '0x87eDfFDe3E14c7a66c9b9724747a1C5696b742e6'},
 { symbol:  'SWRV',     kyber:'TRUE',  uni:'TRUE', address:  '0xb8baa0e4287890a5f79863ab62b7f175cecbd433'},
 { symbol:  'SX',       uni:'TRUE', sushi:'TRUE', address:  '0x99fE3B1391503A1bC1788051347A1324bff41452'},
 { symbol:  'SYNC',     uni:'TRUE', sushi:'TRUE', address:  '0xB6ff96B8A8d214544Ca0dBc9B33f7AD6503eFD32'},
 { symbol:  'TCAP',     uni:'TRUE', sushi:'TRUE', address:  '0x16c52CeeCE2ed57dAd87319D91B5e3637d50aFa4'},
 { symbol:  'TKN',      kyber:'TRUE',  uni:'TRUE', address:  '0xaaaf91d9b90df800df4f55c205fd6989c977e73a'},
 { symbol:  'TORN',     uni:'TRUE', sushi:'TRUE', address:  '0x77777FeDdddFfC19Ff86DB637967013e6C6A116C'},
 { symbol:  'TRDL',     uni:'TRUE', sushi:'TRUE', address:  '0x297d33e17e61c2ddd812389c2105193f8348188a'},
 { symbol:  'TRU',      uni:'TRUE', sushi:'TRUE', address:  '0x4c19596f5aaff459fa38b0f7ed92f11ae6543784'},
 { symbol:  'TRYB',     uni:'TRUE', sushi:'TRUE', address:  '0x2c537e5624e4af88a7ae4060c022609376c8d0eb'},
 { symbol:  'TUSD',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x0000000000085d4780B73119b644AE5ecd22b376'},
 { symbol:  'TXL',      uni:'TRUE', sushi:'TRUE', address:  '0x8eEF5a82E6Aa222a60F009ac18c24EE12dBf4b41'},
 { symbol:  'UBT',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x8400d94a5cb0fa0d041a3788e395285d61c9ee5e'},
 { symbol:  'UBXT',     uni:'TRUE', sushi:'TRUE', address:  '0x8564653879a18C560E7C0Ea0E084c516C62F5653'},
 { symbol:  'UFT',      uni:'TRUE', sushi:'TRUE', address:  '0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1'},
 { symbol:  'UMA',      uni:'TRUE', sushi:'TRUE', address:  '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828'},
 { symbol:  'UMB',      uni:'TRUE', sushi:'TRUE', address:  '0x6fC13EACE26590B80cCCAB1ba5d51890577D83B2'},
 { symbol:  'UNI',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'},
 { symbol:  'UNIFI',    uni:'TRUE', sushi:'TRUE', address:  '0x9e78b8274e1d6a76a0dbbf90418894df27cbceb5'},
 { symbol:  'USDC',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'},
 { symbol:  'USDN',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x674C6Ad92Fd080e4004b2312b45f796a192D27a0'},
 //{ symbol:  'USDP',     uni:'TRUE', sushi:'TRUE', address:  '0x1456688345527bE1f37E9e627DA0837D6f08C925'},
 { symbol:  'USDS',     uni:'TRUE', address:  '0xa4bdb11dc0a2bec88d24a3aa1e6bb17201112ebe'},
 { symbol:  'USDT',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xdac17f958d2ee523a2206206994597c13d831ec7'},
 { symbol:  'UST',      uni:'TRUE', sushi:'TRUE', address:  '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD'},
 { symbol:  'UWL',      uni:'TRUE', sushi:'TRUE', address:  '0xdbdd6f355a37b94e6c7d32fef548e98a280b8df5'},
 { symbol:  'UniFi',    uni:'TRUE', sushi:'TRUE', address:  '0x9E78b8274e1D6a76a0dBbf90418894DF27cBCEb5'},
 { symbol:  'VALOR',    kyber:'TRUE',  uni:'TRUE', address:  '0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a'},
 { symbol:  'VIDT',     kyber:'TRUE',  uni:'TRUE', address:  '0xfef4185594457050cc9c23980d301908fe057bb1'},
 //{ symbol:  'VLT',      uni:'TRUE', sushi:'TRUE', address:  '0x6b785a0322126826d8226d77e173d75DAfb84d11'},
 { symbol:  'VSP',      uni:'TRUE', sushi:'TRUE', address:  '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421'},
 { symbol:  'WABI',     uni:'TRUE', address:  '0x286bda1413a2df81731d4930ce2f862a35a609fe'},
 //{ symbol:  'WASABI',   uni:'TRUE', sushi:'TRUE', address:  '0x75019407B9f8f30f2b1fD3e4905A0A39eCC14817'},
 { symbol:  'WBTC',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'},
 { symbol:  'XFT',      uni:'TRUE', sushi:'TRUE', address:  '0xABe580E7ee158dA464b51ee1a83Ac0289622e6be'},
 { symbol:  'XYO',      uni:'TRUE', sushi:'TRUE', address:  '0x55296f69f40Ea6d20E478533C15A6B08B654E758'},
 { symbol:  'YAM' ,     uni:'TRUE', sushi:'TRUE', address:  '0x0aacfbec6a24756c20d41914f2caba817c0d8521'},
 { symbol:  'YAMv2',    uni:'TRUE', sushi:'TRUE', address:  '0xAba8cAc6866B83Ae4eec97DD07ED254282f6aD8A'},
 { symbol:  'YETI',     uni:'TRUE', sushi:'TRUE', address:  '0xb4bebD34f6DaaFd808f73De0d10235a92Fbb6c3D'},
 { symbol:  'YFI',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'},
 //{ symbol:  'YFMEAT',   uni:'TRUE', sushi:'TRUE', address:  '0x05a599258ee8F54dE384516A5e8f61AdBF092ba6'},
 { symbol:  'YFV',      kyber:'TRUE',  uni:'TRUE', address:  '0x45f24baeef268bb6d63aee5129015d69702bcdfa'},
 { symbol:  'YLD' ,     uni:'TRUE', sushi:'TRUE', address:  '0xf94b5c5651c888d928439ab6514b93944eee6f48'},
 { symbol:  'YPIE',     uni:'TRUE', sushi:'TRUE', address:  '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31'},
 { symbol:  'ZIG',      uni:'TRUE', sushi:'TRUE', address:  '0x7BeBd226154E865954A87650FAefA8F485d36081'},
 { symbol:  'ZRX' ,     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xe41d2489571d322189246dafa5ebde1f4699f498'},
 { symbol:  'arNXM',    uni:'TRUE', sushi:'TRUE', address:  '0x1337DEF18C680aF1f9f45cBcab6309562975b1dD'},
 { symbol:  'buidl',    uni:'TRUE', sushi:'TRUE', address:  '0x7b123f53421b1bF8533339BFBdc7C98aA94163db'},
 //{ symbol:  'mbBASED',  uni:'TRUE', sushi:'TRUE', address:  '0x26cF82e4aE43D31eA51e72B663d26e26a75AF729'},
 { symbol:  'rDAO',     uni:'TRUE', sushi:'TRUE', address:  '0x5bC0531961ac966486F53e34E6FB3b16EAf3ab4c'},
 { symbol:  'sUSD',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51'},
 { symbol:  'yStab',    uni:'TRUE', sushi:'TRUE', address:  '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c'},
 { symbol:  '$ROPE',    uni:'TRUE', sushi:'TRUE', address:  '0x9D47894f8BECB68B9cF3428d256311Affe8B068B'}
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
  { symbol: 'WETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'},
];
let eth_pairs = [
 { symbol:  '$TRDL',    uni:'TRUE', sushi:'TRUE', address:  '0x297D33e17e61C2Ddd812389C2105193f8348188a'},
 { symbol:  '1INCH',    kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x111111111117dC0aa78b770fA6A738034120C302'},
 { symbol:  '2KEY',     uni:'TRUE', sushi:'TRUE', address:  '0xe48972fcd82a274411c01834e2f031d4377fa2c0'},
 { symbol:  'AAVE',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'},
 { symbol:  'ADX',      uni:'TRUE', sushi:'TRUE', address:  '0xADE00C28244d5CE17D72E40330B1c318cD12B7c3'},
 //{ symbol:  'AERGO',    uni:'TRUE', sushi:'TRUE', address:  '0x91Af0fBB28ABA7E31403Cb457106Ce79397FD4E6'},
 //{ symbol:  'AKITA',    uni:'TRUE', sushi:'TRUE', address:  '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6'},
 { symbol:  'AKRO',     uni:'TRUE', sushi:'TRUE', address:  '0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7'},
 { symbol:  'ALCX',     uni:'TRUE', sushi:'TRUE', address:  '0xdbdb4d16eda451d0503b854cf79d55697f90c8df'},
 { symbol:  'ALEPH',    uni:'TRUE', sushi:'TRUE', address:  '0x27702a26126e0b3702af63ee09ac4d1a084ef628'},
 { symbol:  'ALPA',     uni:'TRUE', sushi:'TRUE', address:  '0x7cA4408137eb639570F8E647d9bD7B7E8717514A'},
 { symbol:  'ALPHA',    uni:'TRUE', sushi:'TRUE', address:  '0xa1faa113cbE53436Df28FF0aEe54275c13B40975'},
 { symbol:  'AMPL',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xd46ba6d942050d489dbd938a2c909a5d5039a161'},
 { symbol:  'ANT',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xa117000000f279D81A1D3cc75430fAA017FA5A2e'},
 { symbol:  'ANY' ,     uni:'TRUE', sushi:'TRUE', address:  '0xf99d58e463a2e07e5692127302c20a191861b4d6'},
 { symbol:  'API3',     uni:'TRUE', sushi:'TRUE', address:  '0x0b38210ea11411557c13457D4dA7dC6ea731B88a'},
 { symbol:  'ARCH',     uni:'TRUE', sushi:'TRUE', address:  '0x1F3f9D3068568F8040775be2e8C03C103C61f3aF'},
 { symbol:  'ARMOR',    uni:'TRUE', sushi:'TRUE', address:  '0x1337DEF16F9B486fAEd0293eb623Dc8395dFE46a'},
 { symbol:  'AXS' ,     uni:'TRUE', sushi:'TRUE', address:  '0xf5d669627376ebd411e34b98f19c868c8aba5ada'},
 //{ symbol:  'BAC',      uni:'TRUE', sushi:'TRUE', address:  '0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a'},
 { symbol:  'BAL' ,     uni:'TRUE', sushi:'TRUE', address:  '0xba100000625a3754423978a60c9317c58a424e3d'},
 //{ symbol:  'BAM',      kyber:'TRUE',  uni:'TRUE', address:  '0x22b3faaa8df978f6bafe18aade18dc2e3dfa0e0c'},
 { symbol:  'BAND',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55'},
 { symbol:  'BANK',     uni:'TRUE', sushi:'TRUE', address:  '0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198'},
 { symbol:  'BAO',      uni:'TRUE', sushi:'TRUE', address:  '0x374CB8C27130E2c9E04F44303f3c8351B9De61C1'},
 //{ symbol:  'BASE',     uni:'TRUE', sushi:'TRUE', address:  '0x07150e919b4de5fd6a63de1f9384828396f25fdc'},
 { symbol:  'BAT',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x0d8775f648430679a709e98d2b0cb6250d2887ef'},
 { symbol:  'BLO',      uni:'TRUE', sushi:'TRUE', address:  '0x68481f2c02BE3786987ac2bC3327171C5D05F9Bd'},
 { symbol:  'BLT',      uni:'TRUE', sushi:'TRUE', address:  '0x107c4504cd79C5d2696Ea0030a8dD4e92601B82e'},
 { symbol:  'BLZ',      kyber:'TRUE',  uni:'TRUE', address:  '0x5732046a883704404f284ce41ffadd5b007fd668'},
 { symbol:  'BOR',      uni:'TRUE', sushi:'TRUE', address:  '0x3c9d6c1C73b31c837832c72E04D3152f051fc1A9'},
 //{ symbol:  'VGX',      kyber:'TRUE',  uni:'TRUE', address:  '0x5af2be193a6abca9c8817001f45744777db30756'},
 //{ symbol:  'BSP',      uni:'TRUE', sushi:'TRUE', address:  '0xa1454f9c704AF96636F3A7532b9a04c411f85680'},
 { symbol:  'BUSD',     uni:'TRUE', sushi:'TRUE', address:  '0x4fabb145d64652a948d72533023f6e7a623c7c53'},
 { symbol:  'BZRX',     uni:'TRUE', sushi:'TRUE', address:  '0x56d811088235F11C8920698a204A5010a788f4b3'},
 { symbol:  'BZRX',     uni:'TRUE', sushi:'TRUE', address:  '0x56d811088235f11c8920698a204a5010a788f4b3'},
 { symbol:  'Bone',     uni:'TRUE', sushi:'TRUE', address:  '0x5C84bc60a796534bfeC3439Af0E6dB616A966335'},
 { symbol:  'CAVO',     uni:'TRUE', sushi:'TRUE', address:  '0x24ea9c1cfd77a8db3fb707f967309cf013cc1078'},
 { symbol:  'CHINU',    uni:'TRUE', sushi:'TRUE', address:  '0x5F72be0835e32D7c853e2fFd5Dd3d181D5B2Ad51'},
 //{ symbol:  'CND',      kyber:'TRUE',  uni:'TRUE', address:  '0xd4c435f5b09f855c3317c8524cb1f586e42795fa'},
 { symbol:  'COMBO',    uni:'TRUE', sushi:'TRUE', address:  '0xffffffff2ba8f66d4e51811c5190992176930278'},
 { symbol:  'COMP',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xc00e94cb662c3520282e6f5717214004a7f26888'},
 { symbol:  'COVER',    uni:'TRUE', sushi:'TRUE', address:  '0x4688a8b1F292FDaB17E9a90c8Bc379dC1DBd8713'},
 { symbol:  'COVER-OLD',uni:'TRUE', sushi:'TRUE', address:  '0x5D8d9F5b96f4438195BE9b99eee6118Ed4304286'},
 { symbol:  'CREAM',    kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x2ba592f78db6436527729929aaf6c908497cb200'},
 { symbol:  'CRV',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xd533a949740bb3306d119cc777fa900ba034cd52'},
 //{ symbol:  'CTX',      uni:'TRUE', sushi:'TRUE', address:  '0x321C2fE4446C7c963dc41Dd58879AF648838f98D'},
 { symbol:  'CVC' ,     uni:'TRUE', sushi:'TRUE', address:  '0x41e5560054824ea6b0732e656e3ad64e20e94e45'},
 { symbol:  'CVP',      uni:'TRUE', sushi:'TRUE', address:  '0x38e4adb44ef08f22f5b5b76a8f0c2d0dcbe7dca1'},
 { symbol:  'CZZ',      uni:'TRUE', sushi:'TRUE', address:  '0x20bf12A7bdb6d7B84069fb3b939892A301C981d1'},
 { symbol:  'DAI',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x6b175474e89094c44da98b954eedeac495271d0f'},
 { symbol:  'DAO',      uni:'TRUE', sushi:'TRUE', address:  '0x0f51bb10119727a7e5eA3538074fb341F56B09Ad'},
 //{ symbol:  'DAT',      kyber:'TRUE',  uni:'TRUE', address:  '0x81c9151de0c8bafcd325a57e3db5a5df1cebf79c'},
 { symbol:  'DEP',      uni:'TRUE', sushi:'TRUE', address:  '0x1A3496C18d558bd9C6C8f609E1B129f67AB08163'},
 { symbol:  'DEXTF',    uni:'TRUE', sushi:'TRUE', address:  '0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0'},
 { symbol:  'DFD',      uni:'TRUE', sushi:'TRUE', address:  '0x20c36f062a31865bED8a5B1e512D9a1A20AA333A'},
 { symbol:  'DFX',      uni:'TRUE', sushi:'TRUE', address:  '0x888888435FDe8e7d4c54cAb67f206e4199454c60'},
 { symbol:  'DGRO',     uni:'TRUE', sushi:'TRUE', address:  '0x01b8bcc8b75dd86025b455373F3C0814A060e6A8'},
 //{ symbol:  'DGX',      kyber:'TRUE',  uni:'TRUE', address:  '0x4f3afec4e5a3f2a6a1a411def7d7dfe50ee057bf'},
 { symbol:  'DIA',      uni:'TRUE', sushi:'TRUE', address:  '0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419'},
 { symbol:  'DNT',      uni:'TRUE', sushi:'TRUE', address:  '0x0AbdAce70D3790235af448C88547603b945604ea'},
 { symbol:  'DOGY',     uni:'TRUE', sushi:'TRUE', address:  '0x9c405acf8688AfB61B3197421cDeeC1A266c6839'},
 { symbol:  'DOUGH',    uni:'TRUE', sushi:'TRUE', address:  '0xad32A8e6220741182940c5aBF610bDE99E737b2D'},
 { symbol:  'DPI',      uni:'TRUE', sushi:'TRUE', address:  '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b'},
 { symbol:  'DRC',      uni:'TRUE', sushi:'TRUE', address:  '0xb78B3320493a4EFaa1028130C5Ba26f0B6085Ef8'},
 { symbol:  'DUCK',     uni:'TRUE', sushi:'TRUE', address:  '0x92E187a03B6CD19CB6AF293ba17F2745Fd2357D5'},
 { symbol:  'DUSD',     uni:'TRUE', sushi:'TRUE', address:  '0x5BC25f649fc4e26069dDF4cF4010F9f706c23831'},
 { symbol:  'EGT',      uni:'TRUE', sushi:'TRUE', address:  '0x2aA5cE395b00CC486159aDbDD97c55b535CF2cf9'},
 { symbol:  'ELX',      uni:'TRUE', sushi:'TRUE', address:  '0x9048c33c7BaE0bbe9ad702b17B4453a83900D154'},
 { symbol:  'ENJ' ,     kyber:'TRUE',  uni:'TRUE',address:  '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c'},
 //{ symbol:  'EQUAD',    kyber:'TRUE',  uni:'TRUE', address:  '0xc28e931814725bbeb9e670676fabbcb694fe7df2'},
 { symbol:  'ESD',      uni:'TRUE', sushi:'TRUE', address:  '0x36F3FD68E7325a35EB768F1AedaAe9EA0689d723'},
 //{ symbol:  'ETHBN',    uni:'TRUE', sushi:'TRUE', address:  '0x96b52B5BF8D902252D0714A1BD2651A785Fd2660'},
 //{ symbol:  'EURS',     kyber:'TRUE',  uni:'TRUE', address:  '0xdb25f211ab05b1c97d595516f45794528a807ad8'},
 { symbol:  'FARM',     uni:'TRUE', sushi:'TRUE', address:  '0xa0246c9032bc3a600820415ae600c6388619a14d'},
 //{ symbol:  'FORCE',    uni:'TRUE', sushi:'TRUE', address:  '0x6807D7f7dF53b7739f6438EABd40Ab8c262c0aa8'},
 { symbol:  'FORTH',    uni:'TRUE', sushi:'TRUE', address:  '0x77fba179c79de5b7653f68b5039af940ada60ce0'},
 { symbol:  'FOUR',     uni:'TRUE', sushi:'TRUE', address:  '0x4730fB1463A6F1F44AEB45F6c5c422427f37F4D0'},
 { symbol:  'FTM',      uni:'TRUE', sushi:'TRUE', address:  '0x4E15361FD6b4BB609Fa63C81A2be19d873717870'},
 { symbol:  'FTT' ,     uni:'TRUE', sushi:'TRUE', address:  '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9'},
 { symbol:  'FTX Token',uni:'TRUE', sushi:'TRUE', address:  '0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9'},
 //{ symbol:  'FUSE',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x970B9bB2C0444F5E81e9d0eFb84C8ccdcdcAf84d'},
 { symbol:  'FVT',      uni:'TRUE', sushi:'TRUE', address:  '0x45080a6531d671DDFf20DB42f93792a489685e32'},
 { symbol:  'FXS',      uni:'TRUE', sushi:'TRUE', address:  '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0'},
 //{ symbol:  'GEN',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x543ff227f64aa17ea132bf9886cab5db55dcaddf'},
 { symbol:  'GLM',      uni:'TRUE', sushi:'TRUE', address:  '0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429'},
 { symbol:  'GMT',      uni:'TRUE', sushi:'TRUE', address:  '0x7Ddc52c4De30e94Be3A6A0A2b259b2850f421989'},
 { symbol:  'GNO' ,     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x6810e776880c02933d47db1b9fc05908e5386b96'},
 { symbol:  'GNYerc20', uni:'TRUE', sushi:'TRUE', address:  '0xb1f871Ae9462F1b2C6826E88A7827e76f86751d4'},
 //{ symbol:  'GVT',      kyber:'TRUE',  uni:'TRUE', address:  '0x103c3a209da59d3e7c4a89307e66521e081cfdf0'},
 //{ symbol:  'GZE',      uni:'TRUE', sushi:'TRUE', address:  '0x4AC00f287f36A6Aad655281fE1cA6798C9cb727b'},
 { symbol:  'HEGIC',    uni:'TRUE', sushi:'TRUE', address:  '0x584bC13c7D411c00c01A62e8019472dE68768430'},
 //{ symbol:  'HXRO',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x4bD70556ae3F8a6eC6C4080A0C327B24325438f3'},
 { symbol:  'ICHI',     uni:'TRUE', sushi:'TRUE', address:  '0x903bef1736cddf2a537176cf3c64579c3867a881'},
 //{ symbol:  'ID',       kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xebd9d99a3982d547c5bb4db7e3b1f9f14b67eb83'},
 { symbol:  'IDLE',     uni:'TRUE', sushi:'TRUE', address:  '0x875773784Af8135eA0ef43b5a374AaD105c5D39e'},
 //{ symbol:  'ILV',      uni:'TRUE', sushi:'TRUE', address:  '0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E'},
 //{ symbol:  'IND',      kyber:'TRUE',  uni:'TRUE', address:  '0xf8e386eda857484f5a12e4b5daa9984e06e73705'},
 { symbol:  'INDEX',    uni:'TRUE', sushi:'TRUE', address:  '0x0954906da0Bf32d5479e25f46056d22f08464cab'},
 { symbol:  'INJ',      uni:'TRUE', sushi:'TRUE', address:  '0xe28b3b32b6c345a34ff64674606124dd5aceca30'},
 { symbol:  'INV',      uni:'TRUE', sushi:'TRUE', address:  '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68'},
 //{ symbol:  'IQ',       uni:'TRUE', sushi:'TRUE', address:  '0x579CEa1889991f68aCc35Ff5c3dd0621fF29b0C9'},
 { symbol:  'JRT',      uni:'TRUE', sushi:'TRUE', address:  '0x8A9C67fee641579dEbA04928c4BC45F66e26343A'},
 { symbol:  'KEY',      uni:'TRUE', sushi:'TRUE', address:  '0x4cc19356f2d37338b9802aa8e8fc58b0373296e7'},
 { symbol:  'KIRO',     uni:'TRUE', sushi:'TRUE', address:  '0xB1191F691A355b43542Bea9B8847bc73e7Abb137'},
 { symbol:  'KP3R',     uni:'TRUE', sushi:'TRUE', address:  '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44'},
 { symbol:  'L2',       uni:'TRUE', sushi:'TRUE', address:  '0xBbff34E47E559ef680067a6B1c980639EEb64D24'},
 { symbol:  'LCX',      uni:'TRUE', sushi:'TRUE', address:  '0x037A54AaB062628C9Bbae1FDB1583c195585fe41'},
 { symbol:  'LDN',      uni:'TRUE', sushi:'TRUE', address:  '0xb29663Aa4E2e81e425294193616c1B102B70a158'},
 { symbol:  'LDO',      uni:'TRUE', sushi:'TRUE', address:  '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'},
 { symbol:  'LEND',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03'},
 //{ symbol:  'LEV',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xbc194e6f748a222754C3E8b9946922c09E7d4e91'},
 { symbol:  'LINA',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x3E9BC21C9b189C09dF3eF1B824798658d5011937'},
 { symbol:  'LINK',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x514910771AF9Ca656af840dff83E8264EcF986CA'},
 //{ symbol:  'LON' ,     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x0000000000095413afc295d19edeb1ad7b71c952'},
 { symbol:  'LPT',      uni:'TRUE', sushi:'TRUE', address:  '0x58b6A8A3302369DAEc383334672404Ee733aB239'},
 //{ symbol:  'LRC',      kyber:'TRUE',  uni:'TRUE', address:  '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd'},
 { symbol:  'MANA',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'},
 { symbol:  'MATIC',    kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'},
 { symbol:  'MFG',      kyber:'TRUE',  uni:'TRUE', address:  '0x6710c63432a2de02954fc0f851db07146a6c0312'},
 { symbol:  'MKR' ,     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'},
 { symbol:  'MLN',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xec67005c4e498ec7f55e092bd1d35cbc47c91892'},
 { symbol:  'MM',       uni:'TRUE', sushi:'TRUE', address:  '0xa283aA7CfBB27EF0cfBcb2493dD9F4330E0fd304'},
 { symbol:  'MOVE',     uni:'TRUE', sushi:'TRUE', address:  '0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C'},
 { symbol:  'MPH',      uni:'TRUE', sushi:'TRUE', address:  '0x8888801aF4d980682e47f1A9036e589479e835C5'},
 { symbol:  'MTA',      uni:'TRUE', sushi:'TRUE', address:  '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2'},
 { symbol:  'MUST',     uni:'TRUE', sushi:'TRUE', address:  '0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f'},
 { symbol:  'MYB',      uni:'TRUE', address:  '0x5d60d8d7ef6d37e16ebabc324de3be57f135e0bc'},
 { symbol:  'MYFI',     uni:'TRUE', sushi:'TRUE', address:  '0x22FE5BcAdA4E30A7310eFB1DfF7f90168dC42b62'},
 //{ symbol:  'MYM',      uni:'TRUE', sushi:'TRUE', address:  '0xb9892F9A892f3e251fc58B9076c56aDD528eb8A6'},
 { symbol:  'MoonGain', uni:'TRUE', sushi:'TRUE', address:  '0x4E26Ceb8A932114a95cfB682851b6e832f830062'},
 { symbol:  'NAOS',     uni:'TRUE', sushi:'TRUE', address:  '0x4a615bb7166210cce20e6642a6f8fb5d4d044496'},
 { symbol:  'NCT',      uni:'TRUE', sushi:'TRUE', address:  '0x8A9c4dfe8b9D8962B31e4e16F8321C44d48e246E'},
 { symbol:  'NFTX',     uni:'TRUE', sushi:'TRUE', address:  '0x87d73E916D7057945c9BcD8cdd94e42A6F47f776'},
 { symbol:  'NU',       uni:'TRUE', sushi:'TRUE', address:  '0x4fE83213D56308330EC302a8BD641f1d0113A4Cc'},
 //{ symbol:  'OCEAN',    kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x967da4048cD07aB37855c090aAF366e4ce1b9F48'},
 { symbol:  'OGN',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26'},
 { symbol:  'OMG' ,     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xd26114cd6ee289accf82350c8d8487fedb8a0c07'},
 { symbol:  'OPIUM',    uni:'TRUE', sushi:'TRUE', address:  '0x888888888889C00c67689029D7856AAC1065eC11'},
 { symbol:  'PAX',      kyber:'TRUE',  uni:'TRUE', address:  '0x8e870d67f660d95d5be530380d0ec0bd388289e1'},
 { symbol:  'PBTC',     uni:'TRUE', address:  '0x5228a22e72ccc52d415ecfd199f99d0665e7733b'},
 //{ symbol:  'PENDLE',   uni:'TRUE', sushi:'TRUE', address:  '0x808507121B80c02388fAd14726482e061B8da827'},
 { symbol:  'PERP',     uni:'TRUE', sushi:'TRUE', address:  '0xbC396689893D065F41bc2C6EcbeE5e0085233447'},
 { symbol:  'PICKLE',   uni:'TRUE', sushi:'TRUE', address:  '0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5'},
 //{ symbol:  'PKG',      uni:'TRUE', sushi:'TRUE', address:  '0x02F2D4a04E6E01aCE88bD2Cd632875543b2eF577'},
 { symbol:  'PKGX',     uni:'TRUE', sushi:'TRUE', address:  '0x70F823ed7643Fd7A26FDf8753827d31C16374FDE'},
 { symbol:  'PLR',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xe3818504c1b32bf1557b16c238b2e01fd3149c17'},
 { symbol:  'PMON',     uni:'TRUE', sushi:'TRUE', address:  '0x1796ae0b0fa4862485106a0de9b654eFE301D0b2'},
 { symbol:  'PNK',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d'},
 { symbol:  'PNT',      kyber:'TRUE',  uni:'TRUE', address:  '0x89ab32156e46f46d02ade3fecbe5fc4243b9aaed'},
 { symbol:  'POLY',     kyber:'TRUE',  uni:'TRUE', address:  '0x9992ec3cf6a55b00978cddf2b27bc6882d88d1ec'},
 { symbol:  'POND',     uni:'TRUE', sushi:'TRUE', address:  '0x57B946008913B82E4dF85f501cbAeD910e58D26C'},
 { symbol:  'POOL',     uni:'TRUE', sushi:'TRUE', address:  '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e'},
 { symbol:  'POWR',     uni:'TRUE', sushi:'TRUE', address:  '0x595832f8fc6bf59c85c527fec3740a1b7a361269'},
 //{ symbol:  'PREMIA',   uni:'TRUE', sushi:'TRUE', address:  '0x6399C842dD2bE3dE30BF99Bc7D1bBF6Fa3650E70'},
 { symbol:  'QNT',      kyber:'TRUE',  uni:'TRUE', address:  '0x4a220e6096b25eadb88358cb44068a3248254675'},
 { symbol:  'QSP',      uni:'TRUE', sushi:'TRUE', address:  '0x99ea4dB9EE77ACD40B119BD1dC4E33e1C070b80d'},
 //{ symbol:  'RAE',      kyber:'TRUE',  uni:'TRUE', address:  '0xe5a3229ccb22b6484594973a03a3851dcd948756'},
 { symbol:  'RARI',     uni:'TRUE', sushi:'TRUE', address:  '0xfca59cd816ab1ead66534d82bc21e7515ce441cf'},
 { symbol:  'REN',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x408e41876cCCDC0F92210600ef50372656052a38'},
 { symbol:  'RENBTC',   kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d'},
 { symbol:  'REP',      kyber:'TRUE',  uni:'TRUE', address:  '0x1985365e9f78359a9b6ad760e32412f4a445e862'},
 { symbol:  'REQ',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x8f8221aFbB33998d8584A2B05749bA73c37a938a'},
 { symbol:  'REVV',     kyber:'ZERO)', uni:'TRUE', sushi:'TRUE', address:  '0x557B933a7C2c45672B610F8954A3deB39a51A8Ca'},
 { symbol:  'RFOX',     uni:'TRUE', sushi:'TRUE', address:  '0xa1d6Df714F91DeBF4e0802A542E13067f31b8262'},
 { symbol:  'RGT' ,     uni:'TRUE', sushi:'TRUE', address:  '0xd291e7a03283640fdc51b121ac401383a46cc623'},
 { symbol:  'RLC',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x607f4c5bb672230e8672085532f7e901544a7375'},
 { symbol:  'ROBO',     uni:'TRUE', sushi:'TRUE', address:  '0x6FC2f1044A3b9bB3e43A43EC8F840843Ed753061'},
 { symbol:  'ROOBEE',   uni:'TRUE', sushi:'TRUE', address:  '0xA31B1767e09f842ECFd4bc471Fe44F830E3891AA'},
 { symbol:  'ROOK',     uni:'TRUE', sushi:'TRUE', address:  '0xfa5047c9c78b8877af97bdcb85db743fd7313d4a'},
 { symbol:  'ROOM',     uni:'TRUE', sushi:'TRUE', address:  '0xAd4f86a25bbc20FfB751f2FAC312A0B4d8F88c64'},
 { symbol:  'RSR',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x8762db106B2c2A0bccB3A80d1Ed41273552616E8'},
 { symbol:  'RSV',      kyber:'TRUE',  uni:'TRUE', address:  '0x196f4727526ea7fb1e17b2071b3d8eaa38486988'},
 //{ symbol:  'RULER',    uni:'TRUE', sushi:'TRUE', address:  '0x2aECCB42482cc64E087b6D2e5Da39f5A7A7001f8'},
 { symbol:  'RUNE',     uni:'TRUE', sushi:'TRUE', address:  '0x3155BA85D5F96b2d030a4966AF206230e46849cb'},
 { symbol:  'SAN',      kyber:'TRUE',  uni:'TRUE', address:  '0x7c5a0ce9267ed19b22f8cae653f198e3e8daf098'},
 { symbol:  'SAND',     kyber:'TRUE',  uni:'TRUE', address:  '0x3845badade8e6dff049820680d1f14bd3903a5d0'},
 { symbol:  'SDT',      uni:'TRUE', sushi:'TRUE', address:  '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'},
 //{ symbol:  'SEC',      uni:'TRUE', sushi:'TRUE', address:  '0x9C061DF134d11412151E9c200ce3F9f6F295094a'},
 { symbol:  'SECRET',   uni:'TRUE', sushi:'TRUE', address:  '0x2b89bf8ba858cd2fcee1fada378d5cd6936968be'},
 { symbol:  'SEEN',     uni:'TRUE', sushi:'TRUE', address:  '0xca3fe04c7ee111f0bbb02c328c699226acf9fd33'},
 { symbol:  'SFI',      uni:'TRUE', sushi:'TRUE', address:  '0xb753428af26E81097e7fD17f40c88aaA3E04902c'},
 { symbol:  'SHIB',     uni:'TRUE', sushi:'TRUE', address:  '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'},
 { symbol:  'SHOOB',    uni:'TRUE', sushi:'TRUE', address:  '0x2048EdE83b630846e01bD773a8b3dfF68489aa4F'},
 //{ symbol:  'SHPING',   uni:'TRUE', sushi:'TRUE', address:  '0x7C84e62859D0715eb77d1b1C4154Ecd6aBB21BEC'},
 { symbol:  'SNT',      kyber:'TRUE',  uni:'TRUE', address:  '0x744d70fdbe2ba4cf95131626614a1763df805b9e'},
 { symbol:  'SNX',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F'},
 { symbol:  'SPANK',    uni:'TRUE', sushi:'TRUE', address:  '0x42d6622deCe394b54999Fbd73D108123806f6a18'},
 { symbol:  'SRM' ,     uni:'TRUE', sushi:'TRUE', address:  '0x476c5e26a75bd202a9683ffd34359c0cc15be0ff'},
 { symbol:  'STAKE',    uni:'TRUE', sushi:'TRUE', address:  '0x0Ae055097C6d159879521C384F1D2123D1f195e6'},
 { symbol:  'STMX',     kyber:'TRUE',  uni:'TRUE', address:  '0xbe9375c6a420d2eeb258962efb95551a5b722803'},
 { symbol:  'SUPER',    uni:'TRUE', sushi:'TRUE', address:  '0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55'},
 { symbol:  'SURF',     uni:'TRUE', sushi:'TRUE', address:  '0xea319e87cf06203dae107dd8e5672175e3ee976c'},
 { symbol:  'SUSD',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x57ab1ec28d129707052df4df418d58a2d46d5f51'},
 { symbol:  'SUSHI',    kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2'},
 { symbol:  'SWAG',     uni:'TRUE', sushi:'TRUE', address:  '0x87eDfFDe3E14c7a66c9b9724747a1C5696b742e6'},
 { symbol:  'SWRV',     kyber:'TRUE',  uni:'TRUE', address:  '0xb8baa0e4287890a5f79863ab62b7f175cecbd433'},
 { symbol:  'SX',       uni:'TRUE', sushi:'TRUE', address:  '0x99fE3B1391503A1bC1788051347A1324bff41452'},
 { symbol:  'SYNC',     uni:'TRUE', sushi:'TRUE', address:  '0xB6ff96B8A8d214544Ca0dBc9B33f7AD6503eFD32'},
 { symbol:  'TCAP',     uni:'TRUE', sushi:'TRUE', address:  '0x16c52CeeCE2ed57dAd87319D91B5e3637d50aFa4'},
 //{ symbol:  'TKN',      kyber:'TRUE',  uni:'TRUE', address:  '0xaaaf91d9b90df800df4f55c205fd6989c977e73a'},
 { symbol:  'TORN',     uni:'TRUE', sushi:'TRUE', address:  '0x77777FeDdddFfC19Ff86DB637967013e6C6A116C'},
 { symbol:  'TRDL',     uni:'TRUE', sushi:'TRUE', address:  '0x297d33e17e61c2ddd812389c2105193f8348188a'},
 { symbol:  'TRU',      uni:'TRUE', sushi:'TRUE', address:  '0x4c19596f5aaff459fa38b0f7ed92f11ae6543784'},
 { symbol:  'TRYB',     uni:'TRUE', sushi:'TRUE', address:  '0x2c537e5624e4af88a7ae4060c022609376c8d0eb'},
 { symbol:  'TUSD',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x0000000000085d4780B73119b644AE5ecd22b376'},
 { symbol:  'TXL',      uni:'TRUE', sushi:'TRUE', address:  '0x8eEF5a82E6Aa222a60F009ac18c24EE12dBf4b41'},
 { symbol:  'UBT',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x8400d94a5cb0fa0d041a3788e395285d61c9ee5e'},
 { symbol:  'UBXT',     uni:'TRUE', sushi:'TRUE', address:  '0x8564653879a18C560E7C0Ea0E084c516C62F5653'},
 { symbol:  'UFT',      uni:'TRUE', sushi:'TRUE', address:  '0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1'},
 { symbol:  'UMA',      uni:'TRUE', sushi:'TRUE', address:  '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828'},
 { symbol:  'UMB',      uni:'TRUE', sushi:'TRUE', address:  '0x6fC13EACE26590B80cCCAB1ba5d51890577D83B2'},
 { symbol:  'UNI',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'},
 { symbol:  'UNIFI',    uni:'TRUE', sushi:'TRUE', address:  '0x9e78b8274e1d6a76a0dbbf90418894df27cbceb5'},
 { symbol:  'USDC',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'},
 //{ symbol:  'USDN',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x674C6Ad92Fd080e4004b2312b45f796a192D27a0'},
 //{ symbol:  'USDP',     uni:'TRUE', sushi:'TRUE', address:  '0x1456688345527bE1f37E9e627DA0837D6f08C925'},
 { symbol:  'USDS',     uni:'TRUE', address:  '0xa4bdb11dc0a2bec88d24a3aa1e6bb17201112ebe'},
 { symbol:  'USDT',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xdac17f958d2ee523a2206206994597c13d831ec7'},
 { symbol:  'UST',      uni:'TRUE', sushi:'TRUE', address:  '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD'},
 { symbol:  'UWL',      uni:'TRUE', sushi:'TRUE', address:  '0xdbdd6f355a37b94e6c7d32fef548e98a280b8df5'},
 { symbol:  'UniFi',    uni:'TRUE', sushi:'TRUE', address:  '0x9E78b8274e1D6a76a0dBbf90418894DF27cBCEb5'},
 //{ symbol:  'VALOR',    kyber:'TRUE',  uni:'TRUE', address:  '0x297e4e5e59ad72b1b0a2fd446929e76117be0e0a'},
 //{ symbol:  'VIDT',     kyber:'TRUE',  uni:'TRUE', address:  '0xfef4185594457050cc9c23980d301908fe057bb1'},
 //{ symbol:  'VLT',      uni:'TRUE', sushi:'TRUE', address:  '0x6b785a0322126826d8226d77e173d75DAfb84d11'},
 { symbol:  'VSP',      uni:'TRUE', sushi:'TRUE', address:  '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421'},
 { symbol:  'WABI',     uni:'TRUE', address:  '0x286bda1413a2df81731d4930ce2f862a35a609fe'},
 //{ symbol:  'WASABI',   uni:'TRUE', sushi:'TRUE', address:  '0x75019407B9f8f30f2b1fD3e4905A0A39eCC14817'},
 { symbol:  'WBTC',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'},
 { symbol:  'XFT',      uni:'TRUE', sushi:'TRUE', address:  '0xABe580E7ee158dA464b51ee1a83Ac0289622e6be'},
 { symbol:  'XYO',      uni:'TRUE', sushi:'TRUE', address:  '0x55296f69f40Ea6d20E478533C15A6B08B654E758'},
 { symbol:  'YAM' ,     uni:'TRUE', sushi:'TRUE', address:  '0x0aacfbec6a24756c20d41914f2caba817c0d8521'},
 { symbol:  'YAMv2',    uni:'TRUE', sushi:'TRUE', address:  '0xAba8cAc6866B83Ae4eec97DD07ED254282f6aD8A'},
 { symbol:  'YETI',     uni:'TRUE', sushi:'TRUE', address:  '0xb4bebD34f6DaaFd808f73De0d10235a92Fbb6c3D'},
 { symbol:  'YFI',      kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'},
 //{ symbol:  'YFMEAT',   uni:'TRUE', sushi:'TRUE', address:  '0x05a599258ee8F54dE384516A5e8f61AdBF092ba6'},
 { symbol:  'YFV',      kyber:'TRUE',  uni:'TRUE', address:  '0x45f24baeef268bb6d63aee5129015d69702bcdfa'},
 { symbol:  'YLD' ,     uni:'TRUE', sushi:'TRUE', address:  '0xf94b5c5651c888d928439ab6514b93944eee6f48'},
 { symbol:  'YPIE',     uni:'TRUE', sushi:'TRUE', address:  '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31'},
 { symbol:  'ZIG',      uni:'TRUE', sushi:'TRUE', address:  '0x7BeBd226154E865954A87650FAefA8F485d36081'},
 { symbol:  'ZRX' ,     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0xe41d2489571d322189246dafa5ebde1f4699f498'},
 { symbol:  'arNXM',    uni:'TRUE', sushi:'TRUE', address:  '0x1337DEF18C680aF1f9f45cBcab6309562975b1dD'},
 { symbol:  'buidl',    uni:'TRUE', sushi:'TRUE', address:  '0x7b123f53421b1bF8533339BFBdc7C98aA94163db'},
 //{ symbol:  'mbBASED',  uni:'TRUE', sushi:'TRUE', address:  '0x26cF82e4aE43D31eA51e72B663d26e26a75AF729'},
 { symbol:  'rDAO',     uni:'TRUE', sushi:'TRUE', address:  '0x5bC0531961ac966486F53e34E6FB3b16EAf3ab4c'},
 { symbol:  'sUSD',     kyber:'TRUE',  uni:'TRUE', sushi:'TRUE', address:  '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51'},
 { symbol:  'yStab',    uni:'TRUE', sushi:'TRUE', address:  '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c'},
 { symbol:  '$ROPE',    uni:'TRUE', sushi:'TRUE', address:  '0x9D47894f8BECB68B9cF3428d256311Affe8B068B'}
 ];

const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))
const web3 = new Web3(new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL))
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const uniswapRouterContract = new web3.eth.Contract(UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS)
const SUSHI_ROUTER_ADDRESS = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
const sushiRouterContract = new web3.eth.Contract(SUSHI_ROUTER_ABI,SUSHI_ROUTER_ADDRESS)
const KYBER_ROUTER_ADDRESS = '0x818e6fecd516ecc3849daf6845e3ec868087b755'
const kyberRouterContract = new web3.eth.Contract(KYBER_ROUTER_ABI,KYBER_ROUTER_ADDRESS)
let networkisBusy = 'false'
let gasPrice

function financial(x) {
return Number.parseFloat(x).toFixed(2);
}

async function checkPair(args) {
  monitoringPrice = true
  const { position, inputSymbol, inputAddress, outputSymbol, outputAddress } = args
  //console.log('START',outputSymbol)
  crypto_position = position
  let uniswapAmountsOut
  let sushiswapAmountsOut
  _inputSymbol = inputSymbol
  _outputSymbol = eth_pairs[position].symbol
  _inputAddress=inputAddress
  _outputAddress=eth_pairs[position].address
  let cut = -15
  let zero = 0
  let price
  let swapprofit_inETH
  let est_gascost = currentgasPrice * (est_gas*2)
  const gascost_inETH = web3.utils.fromWei(est_gascost.toString())
  //console.log('Checking',outputSymbol)
  if(String(eth_pairs[position].uni) =='TRUE'){
  uniswapAmountsOut = await uniswapRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
  num_uni =uniswapAmountsOut[1]
  //console.log('Return for UNI:',outputSymbol,num_uni,num_uni.length)
}

  if(String(eth_pairs[position].sushi) =='TRUE'){
  sushiswapAmountsOut = await sushiRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
  num_sushi =sushiswapAmountsOut[1]
  //console.log('Return for SUSHI:',outputSymbol,num_sushi)
}

  if(String(eth_pairs[position].kyber)=='TRUE'){
  kyberswapAmountsOut = await kyberRouterContract.methods.getExpectedRate(inputAddress,outputAddress,flash_amount).call()
  num_kyber=kyberswapAmountsOut[0].replace(/^0+|0+$/g, "");
  //console.log('Return for KYBER:', outputSymbol,num_kyber)
}

  if (Number(num_uni)  > Number(num_kyber) && String(eth_pairs[position].uni)=='TRUE' && String(eth_pairs[position].kyber)=='TRUE'){
     //console.log(num_uni,num_kyber,eth_pairs[position].symbol,eth_pairs[position].uni,eth_pairs[position].kyber)
     kyberswapAmountsOut = await kyberRouterContract.methods.getExpectedRate(_outputAddress,inputAddress,num_uni).call()
     //console.log('Un->Ky',num_uni,web3.utils.fromWei(kyberswapAmountsOut[0]),web3.utils.fromWei(kyberswapAmountsOut[0]),num_uni)
     swapprofit_inETH = (web3.utils.fromWei(kyberswapAmountsOut[0])*(num_uni/1000000000000000000)) - web3.utils.fromWei(flash_amount)
     let profit = (swapprofit_inETH - gascost_inETH)*ethPrice_inDai

    if(profit>highestProfit && profit <200){
     highestProfit = profit
    }
    if(profit < cut){
    eth_pairs.splice(position, 1);
    }
    if(profit > zero && profit <200){
     if(profit>50 && profit <200){
       gasPrice = await web3.eth.getGasPrice()//)*2
       console.log('GAS PRICE FAST TRANSACTION', gasPrice, 'TRANASCTION COST = ',(((gasPrice/1000000000000000000)*est_gas)*2)*ethPrice_inDai)
     }else{
       gasPrice = await web3.eth.getGasPrice()
       console.log('GAS PRICE NORMAL TRANSACTION', gasPrice, 'TRANASCTION COST = ',(((gasPrice/1000000000000000000)*est_gas)*2)*ethPrice_inDai)
     }
       monitoringPrice = true
       console.log('MAKING TRADE FOR',_outputSymbol,_outputAddress, 'UNI->KYBER')
       console.log(_outputSymbol,'Un->Ky',financial(profit),'USD')

    }else{
    console.log(_outputSymbol,'Un->Ky',financial(profit),'USD')

    }  }

  if (Number(num_kyber) > Number(num_sushi) && String(eth_pairs[position].kyber)=='TRUE' && String(eth_pairs[position].sushi)=='TRUE'){
     sushiswapAmountsOut = await sushiRouterContract.methods.getAmountsOut( num_kyber,([_outputAddress,inputAddress])).call()
     //console.log('Ky->Su',num_kyber,sushiswapAmountsOut[1])
     swapprofit_inETH = (web3.utils.fromWei(sushiswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
     let profit = (swapprofit_inETH - gascost_inETH)*ethPrice_inDai

    if(profit>highestProfit && profit <200){
     highestProfit = profit
    }
    if(profit < cut){
    eth_pairs.splice(position, 1);
    }
    if(profit > zero && profit <200){
     if(profit>50 && profit <200){
       gasPrice = await web3.eth.getGasPrice()//)*2
       console.log('GAS PRICE FAST TRANSACTION', gasPrice, 'TRANASCTION COST = ',(((gasPrice/1000000000000000000)*est_gas)*2)*ethPrice_inDai)
     }else{
       gasPrice = await web3.eth.getGasPrice()
       console.log('GAS PRICE NORMAL TRANSACTION', gasPrice, 'TRANASCTION COST = ',(((gasPrice/1000000000000000000)*est_gas)*2)*ethPrice_inDai)
     }
       monitoringPrice = true
       console.log('MAKING TRADE FOR',_outputSymbol,_outputAddress, 'KYB->SUSHI')
       console.log(_outputSymbol,'Ky->Su',financial(profit),'USD')

    }else{
    console.log(_outputSymbol,'Ky->Su',financial(profit),'USD')

    }  }

  if (Number(num_kyber) > Number(num_uni) && String(eth_pairs[position].kyber)=='TRUE' && String(eth_pairs[position].uni)=='TRUE'){
    uniswapAmountsOut = await uniswapRouterContract.methods.getAmountsOut(num_kyber,([_outputAddress,inputAddress])).call()
    //console.log('Ky->Un',num_kyber,web3.utils.fromWei(uniswapAmountsOut[1],'Ether'),web3.utils.fromWei(flash_amount))
    swapprofit_inETH = (web3.utils.fromWei(uniswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inETH - gascost_inETH)*ethPrice_inDai

    if(profit>highestProfit && profit <200){
    highestProfit = profit
    }
    if(profit < cut){
    eth_pairs.splice(position, 1);
    }
     if(profit > zero && profit <200){
     if(profit>50 && profit <200){
     gasPrice = await web3.eth.getGasPrice()//)*2
     console.log('GAS PRICE FAST TRANSACTION', gasPrice, 'TRANASCTION COST = ',(((gasPrice/1000000000000000000)*est_gas)*2)*ethPrice_inDai)
     }else{
     gasPrice = await web3.eth.getGasPrice()
     console.log('GAS PRICE NORMAL TRANSACTION', gasPrice, 'TRANASCTION COST = ',(((gasPrice/1000000000000000000)*est_gas)*2)*ethPrice_inDai)
    }
     monitoringPrice = true
     console.log('MAKING TRADE FOR',_outputSymbol,_outputAddress, 'KYBER->UNI')
     console.log(_outputSymbol,'Ky->Un',financial(profit),'USD')

    }else{
    console.log(_outputSymbol,'Ky->Un',financial(profit),'USD')

    }  }

  if (Number(num_sushi) > Number(num_kyber) && String(eth_pairs[position].kyber)=='TRUE' && String(eth_pairs[position].sushi)=='TRUE'){
     kyberswapAmountsOut = await kyberRouterContract.methods.getExpectedRate(_outputAddress,inputAddress,num_sushi).call()
     //console.log('Su->Ky',num_sushi,web3.utils.fromWei(kyberswapAmountsOut[0]),web3.utils.fromWei(kyberswapAmountsOut[1]),num_sushi)
     swapprofit_inETH = (web3.utils.fromWei(kyberswapAmountsOut[0])*(num_sushi/1000000000000000000)) - web3.utils.fromWei(flash_amount)
     let profit = (swapprofit_inETH - gascost_inETH)*ethPrice_inDai
     if(profit>highestProfit && profit <200){
       highestProfit = profit
     }
    if(profit < cut){
     eth_pairs.splice(position, 1);
    }
    if(profit > zero && profit <200){
      if(profit>50 && profit <200){
        gasPrice = await web3.eth.getGasPrice()//)*2
        console.log('GAS PRICE FAST TRANSACTION', gasPrice, 'TRANASCTION COST = ',(((gasPrice/1000000000000000000)*est_gas)*2)*ethPrice_inDai)
      }else{
        gasPrice = await web3.eth.getGasPrice()
        console.log('GAS PRICE NORMAL TRANSACTION', gasPrice, 'TRANASCTION COST = ',(((gasPrice/1000000000000000000)*est_gas)*2)*ethPrice_inDai)
      }
        monitoringPrice = true
        trading_address = _outputAddress
        console.log('MAKING TRADE FOR',_outputSymbol,_outputAddress, 'SUSHI->KYBER')
        console.log(_outputSymbol,'Su->Ky',financial(profit),'USD')

    }else{
    console.log(_outputSymbol,'Su->Ky',financial(profit),'USD')
    }
    }


 if ((eth_pairs.length - eth_pairs[p]) == 0){
   monitoringPrice == false
 }

 //console.log('DOne Checking', outputSymbol)
 //console.log('END',outputSymbol)

}

async function monitorPrice() {
  if(monitoringPrice) {return}
  ethPrice_inDai = await uniswapRouterContract.methods.getAmountsIn('1000000000000000000',(['0x6b175474e89094c44da98b954eedeac495271d0f','0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'])).call()
  ethPrice_inDai = web3.utils.fromWei(ethPrice_inDai[0].toString())
  let time = moment().tz('America/Chicago').format()
  currentgasPrice = await web3.eth.getGasPrice()

  console.log('CHECKING ALL PAIRS - STANDARD ETH GAS IS', currentgasPrice, 'WEI', 'ETH PRICE IS', '$', ethPrice_inDai)
  console.log('HIGHEST PROFIT SO FAR IS $', financial(highestProfit))
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
      let allowance = await erc20TokenContract.methods.allowance(meAddress,SUSHI_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT SUSHI',allowance, token,tokenAddress)
      await swapToken_SUSHI(tokenAddress)
  }else{
      const approvedToken = await erc20TokenContract.methods.approve(SUSHI_ROUTER_ADDRESS,token).send({ from: meAddress });
      console.log('APPROVING TOKEN WITH SUSHI',allowance, token,tokenAddress)
      await swapToken_SUSHI(tokenAddress)
  }}

  if(exchange == 'uni'){
      let allowance = await erc20TokenContract.methods.allowance(meAddress,UNISWAP_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT UNI',allowance, token,tokenAddress)
      await swapToken_UNI(tokenAddress)
  }else{
      const approvedToken = await erc20TokenContract.methods.approve(UNISWAP_ROUTER_ADDRESS,token).send({ from: meAddress });
      console.log('APPROVING TOKEN WITH UNI',allowance, token,tokenAddress)
      await swapToken_UNI(tokenAddress)
  }}
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
priceMonitor = setInterval(async () => { await monitorPrice() }, 60000) //75 seconds 6 hours of infura
pairs_priceMonitor = setInterval(async () => { await pairs_monitorPrice() }, 310000) //310 seconds
