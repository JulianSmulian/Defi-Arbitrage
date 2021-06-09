require('dotenv').config()
//const BigNumber = require('bignumber.js');
const express = require('express')
const ethers = require("ethers")
const ethereumjs_common = require ('ethereumjs-common').default;
const Tx = require("ethereumjs-tx").Transaction
const bodyParser = require('body-parser')
const http = require('http')
const Web3 = require('web3')
//const HDWalletProvider = require('@truffle/hdwallet-provider')
const moment = require('moment-timezone')
const numeral = require('numeral')
const _ = require('lodash')
const axios = require('axios')
const PANCAKESWAP_FACTORY_ABI = require('./abis/pancakeswap/pancake_factory_abi.json')
const PANCAKESWAP_ROUTER_ABI = require('./abis/pancakeswap/pancake_router_abi.json')
const BURGERSWAP_FACTORY_ABI = require('./abis/burgerswap/burger_factory_abi.json')
const BURGERSWAP_ROUTER_ABI = require('./abis/burgerswap/burger_router_abi.json')
const BAKERYSWAP_FACTORY_ABI = require('./abis/bakeryswap/bakery_factory_abi.json')
const BAKERYSWAP_ROUTER_ABI = require('./abis/bakeryswap/bakery_router_abi.json')
const JULSWAP_FACTORY_ABI = require('./abis/julswap/jul_factory_abi.json')
const JULSWAP_ROUTER_ABI = require('./abis/julswap/jul_router_abi.json')
const APESWAP_FACTORY_ABI = require('./abis/apeswap/ape_factory_abi.json')
const APESWAP_ROUTER_ABI = require('./abis/apeswap/ape_router_abi.json')
const BRC20_TOKEN_ABI = require('./abis/brc20/brc20_abi.json')
let networkisBusy = 'false'
let approved = false
const flash_amount ='0100000000000000000'
const exchange_difference = .025
let binance_gasPrice
const bnbPrice = 545
let currentgasPrice
const est_gas  = 1000000
let meAddress = '0xdcAAb152fd53c3Ca7514dcB85b2a9D31700A36B5'

// SERVER CONFIG
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))
const exact_moment = require('moment') // import moment.js library
const now = exact_moment().unix() // fetch current unix timestamp
const DEADLINE = now + 15 // add 15 seconds


const web3 = new Web3('https://bsc-dataseed1.binance.org:443', request_kwargs={'timeout': 100});
//let bscProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/', { name: 'binance', chainId: 56 })
//const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
//const binance_account = web3.eth.accounts.create();
async function getBinanceInfo(){
//console.log('BINANCE ACCOUNT',binance_account, 'GAS PRICE', binance_gasPrice)
}
//const binance_receover_account = web3.eth.accounts.privateKeyToAccount("$private-key")

//getBinanceInfo()

const PANCAKESWAP_FACTORY_ADDRESS = '0xbcfccbde45ce874adcb698cc183debcf17952812'
const pancakeFactoryContract = new web3.eth.Contract(PANCAKESWAP_FACTORY_ABI, PANCAKESWAP_FACTORY_ADDRESS)
const PANCAKESWAP_ROUTER_ADDRESS = '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'
const pancakeRouterContract = new web3.eth.Contract(PANCAKESWAP_ROUTER_ABI, PANCAKESWAP_ROUTER_ADDRESS)

const BURGERSWAP_FACTORY_ADDRESS = '0x8a1E9d3aEbBBd5bA2A64d3355A48dD5E9b511256'
const burgerFactoryContract = new web3.eth.Contract(BURGERSWAP_FACTORY_ABI, BURGERSWAP_FACTORY_ADDRESS)
const BURGERSWAP_ROUTER_ADDRESS = '0xBf6527834dBB89cdC97A79FCD62E6c08B19F8ec0'
const burgerRouterContract = new web3.eth.Contract(BURGERSWAP_ROUTER_ABI, BURGERSWAP_ROUTER_ADDRESS)

const BAKERYSWAP_FACTORY_ADDRESS = '0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7'
const bakeryFactoryContract = new web3.eth.Contract(BAKERYSWAP_FACTORY_ABI, BAKERYSWAP_FACTORY_ADDRESS)
const BAKERYSWAP_ROUTER_ADDRESS = '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F'
const bakeryRouterContract = new web3.eth.Contract(BAKERYSWAP_ROUTER_ABI, BAKERYSWAP_ROUTER_ADDRESS)

const JULSWAP_FACTORY_ADDRESS = '0x553990F2CBA90272390f62C5BDb1681fFc899675'
const julFactoryContract = new web3.eth.Contract(JULSWAP_FACTORY_ABI,JULSWAP_FACTORY_ADDRESS)
const JULSWAP_ROUTER_ADDRESS = '0xbd67d157502A23309Db761c41965600c2Ec788b2'
const julRouterContract = new web3.eth.Contract(JULSWAP_ROUTER_ABI, JULSWAP_ROUTER_ADDRESS)

const APESWAP_FACTORY_ADDRESS = '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6'
const apeFactoryContract = new web3.eth.Contract(APESWAP_FACTORY_ABI,APESWAP_FACTORY_ADDRESS)
const APESWAP_ROUTER_ADDRESS = '0xc0788a3ad43d79aa53b09c2eacc313a787d1d607'
const apeRouterContract = new web3.eth.Contract(APESWAP_ROUTER_ABI,APESWAP_ROUTER_ADDRESS)

let num_pancake;
let num_burger;
let num_bakery;
let num_jul
let num_ape
let percentage_difference;
let _inputSymbol;
let _outputSymbol;
let _inputAddress = '0x'
let _outputAddress = '0x'
let obj
let pancakeswapAmountsOut
let burgerswapAmountsOut
let bakeryswapAmountsOut
let julswapAmountsOut
let apeswapAmountsOut
let highestProfit = -10
let networkId;
let chainId;

let wbnb =[{ symbol: 'WBNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'}]

let lowLiquidity_pairs= [
  { symbol: 'KUN',      address: '0x1A2fb0Af670D0234c2857FaD35b789F8Cb725584' },
  { symbol: 'BIFI',     address: '0xca3f508b8e4dd382ee878a314789373d80a5190a', pancake: 'TRUE', burger: 'LOW', pancake:'TRUE', bakery: 'LOW'  , jul: 'TRUE'  },
]

let binance_pairs = [
  { symbol: '$HUSKY',  address:  '0x11187fEc3898aC44dB5777857A6772E64084CDA0', pancake:'TRUE', bakery:'TRUE' },
  { symbol: '1INCH',  address:  '0x111111111117dC0aa78b770fA6A738034120C302', pancake:'TRUE', bakery:'TRUE' },
  { symbol: '7UP',  address:  '0x29f350B3822F51dc29619C583AdBC9628646E315', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'ADA',  address:  '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47', pancake:'TRUE', burger:'TRUE', jul:'TRUE', ape:'TRUE'},
  { symbol: 'AI',  address:  '0x6d63C32fEb6cc5C7C45Cc4F236Cb80A4FD09AD1A', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'ALLOY',  address:  '0x5eF5994fA33FF4eB6c82d51ee1DC145c546065Bd', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'AMPT',  address:  '0x5eD4C7634A7B3d175a5aF4D14278beE12688b837', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'APE',  address:  '0x82bbd3DBae09eba3F3B1EA48d0A469140Ed9dfb5', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'AUTO',  address:  '0xa184088a740c695E156F91f5cC086a06bb78b827', pancake:'TRUE', bakery:'TRUE', ape:'TRUE', },
  { symbol: 'AVAX',  address:  '0x1CE0c2827e2eF14D5C4f29a091d735A204794041', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'AVX',  address:  '0x397ECE04F7E70d848E8ABf22492a3C197aeEf79A', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'Azu',  address:  '0x49F3FFe56888B587d97B6bfc8c89503c406B7C5b', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'BAFI',  address:  '0xA2f46fe221f34Dac4Cf078e6946A7cb4e373AD28', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'BANANA',  address:  '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'BAT',  address:  '0x101d82428437127bF1608F699CD651e6Abf9766E', pancake:'TRUE', bakery:'TRUE', ape:'TRUE' },
  //{ symbol: 'BCH',  address:  '0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'BETH',  address:  '0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'BHC',  address:  '0x6fd7c98458a943f469E1Cf4eA85B173f5Cd342F4', burger:'TRUE', jul:'TRUE'},
  { symbol: 'BLL',  address:  '0x7cbb20014BeF8fD587D9435c4d5953bCBdb1756F', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'BONDLY',  address:  '0x96058f8C3e16576D9BD68766f3836d9A33158f89', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'BROCO',  address:  '0x4623d2FdfAECA3f3Eb105D4854aD328BcA916811', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'BSC',  address:  '0x17bc015607Fdf93e7C949e9Ca22f96907cFBeF88', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'BSCX',  address:  '0x5Ac52EE5b2a633895292Ff6d8A89bB9190451587', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'BSOCKS',  address:  '0x2a4C94B84B942e1180FDEE7c096b9372a704d5B6', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'BSPAY',  address:  '0x6DcEaAC4E68d1BC5834Dc3c8Bc012317cd4d1Ffa', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'BTCB',  address:  '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'BTCB',  address:  '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'BTR',  address:  '0xaDC0cE92Ae34D10D80ED91A929b0418645f8b943', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'BTRY',  address:  '0x6BEaAdbf91aF5E12fbc95756064c0c07eC6871D9', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'BURGER',  address:  '0xAe9269f27437f0fcBC232d39Ec814844a51d6b8f', pancake:'TRUE', burger:'TRUE', ape:'TRUE' },
  { symbol: 'Berry',  address:  '0x8626F099434d9A7E603B8f0273880209eaBfc1c5', pancake:'TRUE', bakery:'TRUE', jul:'TRUE'},
  { symbol: 'CAKEs',  address:  '0xB55aa1dde5e1946e2e233b0A37b1b197b386A4E8', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'COMP',  address:  '0x52CE071Bd9b1C4B00A0b92D298c512478CaD67e8', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'COMPASS',  address:  '0x40C6BCE4EE70ef57E065a91FBF233E427e32fF71', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'COTI',  address:  '0xAdBAF88B39D37Dc68775eD1541F1bf83A5A45feB', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'CRN',  address:  '0x2703c58eeB1959154B60Be0010395a87Fc98597b', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'CRP',  address:  '0x1Ad8D89074AFA789A027B9a31d0bd14e254711D0', pancake:'TRUE', burger:'TRUE', jul:'TRUE'},
  { symbol: 'Cake',  address:  '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', pancake:'TRUE', jul:'TRUE', ape:'TRUE' },
  { symbol: 'DAI',  address:  '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'DCSX',  address:  '0x79191D164F4D9c689C47aa16f99Bf0e5a955c676', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'DCT',  address:  '0x9619E3b1b4f7441b0aFcb5BE6242950d1da04f92', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'DEEP',  address:  '0x60DE5F9386b637Fe97aF1CC05F25548E9BAAee19', pancake:'TRUE', jul:'TRUE' },
  //{ symbol: 'DEGO',  address:  '0x3FdA9383A84C05eC8f7630Fe10AdF1fAC13241CC', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'DOT',  address:  '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402', pancake:'TRUE', bakery:'TRUE', burger:'TRUE', ape:'TRUE'},
  { symbol: 'DSL',  address:  '0x72FEAC4C0887c12db21CEB161533Fd8467469e6b', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'ELT',  address:  '0x49961bDEf01b26E69652EFC0AF5a164d56669553', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'ERC20',  address:  '0x58730ae0FAA10d73b0cDdb5e7b87C3594f7a20CB', pancake:'TRUE', bakery:'TRUE', jul:'TRUE'},
  { symbol: 'ETC',  address:  '0x3d6545b08693daE087E957cb1180ee38B9e3c25E', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'ETH',  address:  '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', pancake:'TRUE', bakery:'TRUE', ape:'TRUE' },
  //{ symbol: 'FASTMOON',  address:  '0x869Dd7A64AfBe5370a8c591d9B8650BE60c0B8f6', pancake:'TRUE', bakery:'TRUE', jul:'TRUE'},
  { symbol: 'FCAT',  address:  '0x6c4eaCDF2089a78bA4EB10a8C16FdfBb7bA9Ba61', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'FILMO',  address:  '0x6a6959861E5c0077966271A02550Cd6C685fA789', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'FLAP',  address:  '0x5C6A58D670483e1211B131F0A6501849c77A77d5', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'FLAT',  address:  '0x41540ba32dB90269Bb72A7bE1D4b1eE18F5544f1', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'FLOWER',  address:  '0x5075bE2da50E9c63CAEb8F45e5344B777FaFD4c0', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'FMG',  address:  '0x72A167C9783b7d4fFf91d43A60e00D25957A50f8', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'FOR',  address:  '0x658A109C5900BC6d2357c87549B651670E5b0539', burger:'TRUE' },
  { symbol: 'FREE',  address:  '0x12e34cDf6A031a10FE241864c32fB03a4FDaD739', pancake:'TRUE', jul:'TRUE', ape:'TRUE' },
  { symbol: 'FREN',  address:  '0x13958e1eb63dFB8540Eaf6ed7DcbBc1A60FD52AF', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'FRIES',  address:  '0x393B312C01048b3ed2720bF1B090084C09e408A1', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'FRUIT',  address:  '0x9CF518B83804d30Fb007e17757D317D9B03619a5', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'FTL',  address:  '0x791e0b31302d58FC879105E366Ac82F5D1d23159', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'Faucetpay.io',  address:  '0x352E5392143D054Bc6F4dF53A179BB330a408C7e', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'GATO',  address:  '0x8fcCF105f275706ae59798e5f8a80179606c176f', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'GFA',  address:  '0x557F2d2146e3B5cCBFf48eED7DA6F093af3fADE5', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'GOJI',  address:  '0x04bAC3934f995E83CcD8CafB583Eb5ef956b60ed', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'HITMAN',  address:  '0x0F8a4B1C3d16EE64A8feBcDDC24b5F39da54b708', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'HYFI',  address:  '0x9a319b959e33369C5eaA494a770117eE3e585318', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'IEON',  address:  '0x64ac4023A7c9a4987A75420295f68a5435484Dd1', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'INSTAMOON',  address:  '0x5a1dB8f44b0bBea1A94B3ab3c340Ee3Af122Dfdc', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'JDI',  address:  '0x0491648C910ad2c1aFaab733faF71D30313Df7FC', pancake:'TRUE', jul:'TRUE', ape:'TRUE' },
  { symbol: 'JNTR/b',  address:  '0x78e1936f065Fd4082387622878C7d11c9f05ECF4', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'JULb',  address:  '0x32dFFc3fE8E3EF3571bF8a72c0d0015C5373f41D', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'JulD',  address:  '0x5A41F637C3f7553dBa6dDC2D3cA92641096577ea', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'KACI',  address:  '0x1189Cb79386bf2f309b86F3e3459a45CB2C05b94', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'KEYFI',  address:  '0x4b6000F9163de2E3f0a01eC37E06e1469DBbcE9d', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'KPC',  address:  '0xA511768003D01eAA0f464fEEEa4b1CDDc4254b4f', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'KREME',  address:  '0x3dE6DE241f7DA29EfBc35F0DE096B2152c9d9720', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'LAS',  address:  '0x735EBe3Ed47877a11023B904054a0ffE44e91AB7', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'LEAD',  address:  '0x2ed9e96EDd11A1fF5163599A66fb6f1C77FA9C66', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'LTC',  address:  '0x4338665CBB7B2485A8855A139b75D5e34AB0DB94', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'LYPTUS',  address:  '0xBA26397cdFF25F0D26E815d218Ef3C77609ae7f1', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'MANY',  address:  '0x2dD6c9c5BCD16816226542688788932c6e79A600', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'MASH',  address:  '0x787732f27D18495494cea3792ed7946BbCFF8db2', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'MBOX',  address:  '0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'MERO',  address:  '0x476DA763fb6D22B8465f7886d2d652A428a93984', pancake:'TRUE', bakery:'TRUE', jul:'TRUE', ape:'TRUE'},
  { symbol: 'MILK',  address:  '0xBae34f4DE36940920F45a97d22d8D03914A43086', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'MILL',  address:  '0x2E2f93dAf0eaCAda0c25fEFa5007F338f788FB2d', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'MK',  address:  '0x8d8F82dfB25d0943C06302EeFD5Eb360B011B758', pancake:'TRUE', bakery:'TRUE', jul:'TRUE', ape:'TRUE'},
  { symbol: 'MKC',  address:  '0x92cc2c999aDE41C71D1c8136D5b57d12564E045f', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'MLA',  address:  '0x331B1Ced2232ADC9DF1050C8A15B242D9ac2756b', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'MLSS',  address:  '0x761De18ff56AF0eAC719cB494C024A8fAdC315F2', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'MUF',  address:  '0x297d82b41ceA262d04c318e55d3370EA23cd11c2', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'NIG',  address:  '0x86f3496b0Ff38A17c1A361ef6Cc5d040853eb0b7', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'NN',  address:  '0x897fE07d613037c206429628611A2665E18C657d', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'NOTBAD',  address:  '0x676855097117A6A32043dB65c046D53B72e72B04', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'NOWHALES',  address:  '0xAD5e8494309D3C42C91e88b4698AcAac1814cCc0', pancake:'TRUE', bakery:'TRUE', ape:'TRUE' },
  { symbol: 'NRV',  address:  '0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'NUTS',  address:  '0x8893D5fA71389673C5c4b9b3cb4EE1ba71207556', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'NYB',  address:  '0x03910a6B6ca498aBce970c0F4ca747194872f279', pancake:'TRUE', jul:'TRUE', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'ONES',  address:  '0x53Fe49C95C60eCDACd991E7E57728FE6a631Bc44', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'OPPA',  address:  '0x6Ae236B8BB9ceE8Fa8521a9870a9Ac5eb018Ec66', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'OYU',  address:  '0x24C8dBf49B822F4CF77738275e4749Aac541729E', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'PARROT',  address:  '0xB9c0fd96a07FaEeE4c552f056cbe42073C8999e7', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'PBANK',  address:  '0x627c99cFC6421224a99B88Cec08BA9894253779c', pancake:'TRUE', bakery:'TRUE', jul:'TRUE', ape:'TRUE'},
  { symbol: 'PBS',  address:  '0x2EaE17386Ea67f0FA13485FA90851C03BDc5a7A9', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'PET',  address:  '0x4d4e595d643dc61EA7FCbF12e4b1AAA39f9975B8', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'PFI',  address:  '0x6a9ba54F86b46900b1E4d1e6a13FB9F15F016A7F', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'PKGB',  address:  '0x89A851764A427f48c21c1557d94458267FE3d372', pancake:'TRUE', bakery:'TRUE', burger:'TRUE', jul:'TRUE', ape:'TRUE' },
  { symbol: 'POLIS',  address:  '0xb5bEa8a26D587CF665f2d78f077CcA3C7f6341BD', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'PROM',  address:  '0xaF53d56ff99f1322515E54FdDE93FF8b3b7DAFd5', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'PROPEL',  address:  '0x9B44Df3318972bE845d83f961735609137C4C23c', pancake:'TRUE', bakery:'TRUE', burger:'TRUE', jul:'TRUE' },
  { symbol: 'PROT',  address:  '0x190e450e0345FaD4C2999461760c079bfD2F3501', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'QUAI',  address:  '0x3Dc2d7434bDbB4Ca1A8A6bCC8a8075AEaE2d2179', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'RAE',  address:  '0x7880ae586cAfab484E98dB0e68cBA40afDda1418', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'RICK',  address:  '0x9751afB4C102CCE9C2bE87FC4dEC238Be7fc625a', pancake:'TRUE', bakery:'TRUE', burger:'TRUE'},
  { symbol: 'RLE',  address:  '0x141B68F1e1f0D730DEE3012c081212dc65140D7b', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'ROCKS',  address:  '0xA01000C52b234a92563BA61e5649b7C76E1ba0f3', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'RTF',  address:  '0xb4A92eDAb7c9Ba94b6637E8052D8bd133EC4221C', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'RUPEE',  address:  '0x7B0409A3A3f79bAa284035d48E1DFd581d7d7654', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'SACT',  address:  '0x1bA8c21c623C843Cd4c60438d70E7Ad50f363fbb', pancake:'TRUE', bakery:'TRUE', jul:'TRUE'},
  { symbol: 'SAFEETH',  address:  '0x47FdfeA2c5741Acd7Be0377029D6C507154D86B9', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'SAFEMARS',  address:  '0x3aD9594151886Ce8538C1ff615EFa2385a8C3A88', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'SAFEMORE',  address:  '0x1A13e2eB0d507910833285b3286aEc553Cfd8326', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'SAFESUN',  address:  '0x968040641C805EC8E7E763642cDE2E442DF3F6F7', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'SFD',  address:  '0x9C440cAC3368f79C5d2488D5036b6943999FE3FB', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'SFUND',  address:  '0x477bC8d23c634C154061869478bce96BE6045D12', pancake:'TRUE', bakery:'TRUE', jul:'TRUE'},
  { symbol: 'SHIELD',  address:  '0x60b3BC37593853c04410c4F07fE4D6748245BF77', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'SHIT',  address:  '0xB7a9bDD179BF16F4b7c4b0d7EF07BBCb62B29A2D', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'SHLIAPA',  address:  '0x32BBE16775B98a1a474269ff5b8993e73d793BB7', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'SOCCER',  address:  '0x338d44d19c8d45ed9771b8D2B95D988F0e42187F', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'SPI',  address:  '0x78A18Db278F9c7c9657F61dA519e6Ef43794DD5D', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'SRK',  address:  '0x3B1eC92288D78D421f97562f8D479e6fF7350a16', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'STC',  address:  '0x72c48803afc8fafDf565CE1F64E533018F80f880', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'SUSHI',  address:  '0x947950BcC74888a40Ffa2593C5798F11Fc9124C4', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'SWAT',  address:  '0x82e7Eb8f4c307F2dcf522fDCA7b7038296584f29', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'SXP',  address:  '0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'SYRUP',  address:  '0x009cF7bC57584b7998236eff51b98A168DceA9B0', pancake:'TRUE', bakery:'TRUE', burger:'TRUE', jul:'TRUE' },
  { symbol: 'Shield Finance',  address:  '0x5A054554b3F0C75063D29250984A921402E1E3a7', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'Svea',  address:  '0x043A43d46107a0b8016a6A3ef39cA9CCAB1b3652', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'TAKO',  address:  '0x2F3391AeBE27393aBa0a790aa5E1577fEA0361c2', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'TAPS',  address:  '0x56eab07247e3e6404ac90140F20bba61375d5C3C', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'TBAKE',  address:  '0x26D6e280F9687c463420908740AE59f712419147', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'TCORE',  address:  '0x40318becc7106364D6C41981956423a7058b7455', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'TEDDY',  address:  '0x271617ca107c3Bc6d844750276a08bFBBfEf75Fa', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'TESTCAKES',  address:  '0x8cb0300Af2A801DC9992225D45399ac56888cBcd', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'TFF',  address:  '0x2d69c55baEcefC6ec815239DA0a985747B50Db6E', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'TIGS',  address:  '0x017A6d12Ca6e591d684e63791fD2de1e8A550169', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'TKO',  address:  '0x9f589e3eabe42ebC94A44727b3f3531C0c877809', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'TRDG',  address:  '0x92a42Db88Ed0F02c71D439e55962Ca7CAB0168b5', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'TSA',  address:  '0x5f99ACF13CAff815DD9cB4A415c0fB34e9F4545b', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'TUNA',  address:  '0x40929FB2008c830731A3d972950bC13f70161c75', pancake:'TRUE', bakery:'TRUE', burger:'TRUE', jul:'TRUE' },
  { symbol: 'TWT',  address:  '0x4B0F1812e5Df2A09796481Ff14017e6005508003', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'Teddy',  address:  '0x9b1e2709f860d5EF736FCb6c79697F8140237eDc', pancake:'TRUE', bakery:'TRUE', jul:'TRUE'},
  { symbol: 'UNCL',  address:  '0x0E8D5504bF54D9E44260f8d153EcD5412130CaBb', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'USDT',  address:  '0x55d398326f99059fF775485246999027B3197955', pancake:'TRUE', bakery:'TRUE', burger:'TRUE', jul:'TRUE' },
  { symbol: 'VIDT',  address:  '0x3f515f0a8e93F2E2f891ceeB3Db4e62e202d7110', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'VRAP',  address:  '0x271C418B045d05A1D52c6bF849d47b5B5B4d769e', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'WAR',  address:  '0x42dbD44a8883D4363B395F77547812DC7dB806d5', pancake:'TRUE', bakery:'TRUE', jul:'TRUE'},
  { symbol: 'WATCH',  address:  '0x7A9f28EB62C791422Aa23CeAE1dA9C847cBeC9b0', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'WBBK',  address:  '0x9045B0eda6B6A556cf9B3d81C2db47411714f847', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'WEAPON',  address:  '0x3664d30A612824617e3Cf6935d6c762c8B476eDA', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'WHALE',  address:  '0x67c3a528C13d5b03fc5d4f847fcc8F290Dd276b7', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'WHIRL',  address:  '0x7f479d78380Ad00341fdD7322fE8AEf766e29e5A', pancake:'TRUE', bakery:'TRUE', jul:'TRUE'},
  { symbol: 'WMUE',  address:  '0x00abaA93fAF8fDc4f382135a7A56F9Cf7C3EdD21', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'WNYC',  address:  '0x6c015277B0f9b8c24B20BD8BbbD29FDb25738A69', pancake:'TRUE', bakery:'TRUE', jul:'TRUE', ape:'TRUE'},
  { symbol: 'WOOL',  address:  '0x02E3eFcc9d912fbf2bf33D39F43427b56512C9B4', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'WSA',  address:  '0x53b3bE80206DFC1E82389ebE656aF2e6f81c6BE6', pancake:'TRUE', bakery:'TRUE' },
  //{ symbol: 'XBN',  address:  '0x547CBE0f0c25085e7015Aa6939b28402EB0CcDAC', pancake:'TRUE', bakery:'TRUE', jul:'TRUE'},
  { symbol: 'XDITTO',  address:  '0xB0a1DE764A033A76f28E821fBe402EDBFEe937dB', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'XRP',  address:  '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE', pancake:'TRUE', burger:'TRUE', ape:'TRUE' },
  { symbol: 'YAL',  address:  '0x8431C096076F16F67199D971470f9E25fEb91F4b', pancake:'TRUE', bakery:'TRUE', burger:'TRUE'},
  { symbol: 'YFBK',  address:  '0x2fF3f078DDd0C13Fd55bB45418730995Bfb6e908', pancake:'TRUE', bakery:'TRUE' },
  { symbol: 'YFFII',  address:  '0x260D9b781a7A0726091D111c02F09A74d85F53c4', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'YVS',  address:  '0x47c1C7B9D7941A7265D123DCfb100D8FB5348213', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'ZAC',  address:  '0x50E14fF17C2dAa161D6632F3d5c16b63BDEf65A9', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'ZEC',  address:  '0x1Ba42e5193dfA8B03D15dd1B86a3113bbBEF8Eeb', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'bFREDX',  address:  '0x321614Eb36245bf2e2F2e58bADAAAaD1475e1026', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'bIMTY',  address:  '0x5Aaf9ddd8AeEC564AAaa0F76B8E5f2B2B1a6d295', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'bVLO',  address:  '0xa1390b8ADeD286ce33AC8300919A18992744FA51', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'bWAIF',  address:  '0x86cd933Da7b51DDC859497C15D6560a68c611Cf9', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'bWHF',  address:  '0x188B038EAAfa14F9883C86Cc8BAdB7A457A561eC', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'brDAO',  address:  '0x0fd161F2AA52Bc2B7b04Ddd6001610D84b8De726', pancake:'TRUE', burger:'TRUE' },
  { symbol: 'cPYC',  address:  '0x3Ec460E32c94D28700639Dd390768d25931337bf', pancake:'TRUE', jul:'TRUE' },
  { symbol: 'gRUPEE',  address:  '0x8efa59bf5F47c6FE0E97C15cAd12f2Be6BB899a1', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'vBSWAP',  address:  '0x4f0ed527e8A95ecAA132Af214dFd41F30b361600', pancake:'TRUE', ape:'TRUE' },
  { symbol: 'xBURGER',  address:  '0xAFE24E29Da7E9b3e8a25c9478376B6AD6AD788dD', pancake:'TRUE', burger:'TRUE' }]

function financial(x) {
return Number.parseFloat(x).toFixed(2);
}
async function checkPairs(args) {
  const { position, inputSymbol, inputAddress, outputSymbol, outputAddress, pancake_exchange, bakery_exchange, burger_exchange, jul_exchange, ape_exchange } = args
  //console.log(position, outputSymbol)
  _inputSymbol = inputSymbol
  _outputSymbol = outputSymbol
  let est_gascost = binance_gasPrice * (est_gas*2)
  let est_gascostUS = est_gascost * bnbPrice
  const gascost_inBNB = web3.utils.fromWei(est_gascost.toString())
  let zero = -1
  let price
  let swapprofit_inBNB

  if(pancake_exchange=='TRUE'){
  pancakeswapAmountsOut = await pancakeRouterContract.methods.getAmountsOut(flash_amount,[inputAddress,outputAddress]).call()
  num_pancake =pancakeswapAmountsOut[1]
  //console.log('Pancake returns', web3.utils.fromWei(num_pancake), outputSymbol,outputAddress,' for ', inputSymbol)
  }else{num_pancake = 0}

  if(ape_exchange=='TRUE'){
  apeswapAmountsOut = await apeRouterContract.methods.getAmountsOut(flash_amount,[inputAddress,outputAddress]).call()
  num_ape = apeswapAmountsOut[1]
  //console.log('Ape returns', web3.utils.fromWei(num_ape), outputSymbol,outputAddress,' for ', inputSymbol)
  }else{num_ape = 0}

  if(bakery_exchange=='TRUE'){
  bakeryswapAmountsOut = await bakeryRouterContract.methods.getAmountsOut(flash_amount,[inputAddress,outputAddress]).call()
  num_bakery = bakeryswapAmountsOut[1]
  //console.log('Bakery returns', web3.utils.fromWei(num_bakery), outputSymbol,outputAddress,' for ', inputSymbol)
  }else{num_bakery = 0}
/*
  if(burger_exchange=='TRUE'){
  burgerswapAmountsOut = await burgerRouterContract.methods.getAmountsOut(flash_amount,[inputAddress,outputAddress]).call()
  num_burger =burgerswapAmountsOut[1]
  //console.log('Burger returns', web3.utils.fromWei(num_burger), outputSymbol,outputAddress,' for ', inputSymbol)
  }else{num_burger = 0}
*/
  if(jul_exchange=='TRUE'){
  julswapAmountsOut = await julRouterContract.methods.getAmountsOut(flash_amount,[inputAddress,outputAddress]).call()
  num_jul = julswapAmountsOut[1]
  //console.log('Jul returns', web3.utils.fromWei(num_jul), outputSymbol,outputAddress,' for ', inputSymbol)
  }else{num_jul = 0}

  if (num_pancake > num_burger && num_burger>0){
    burgerswapAmountsOut = await burgerRouterContract.methods.getAmountsOut(num_pancake,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(burgerswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Pa->Bu',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('pancake',PANCAKESWAP_ROUTER_ADDRESS,outputAddress,burgerswapAmountsOut[1],'burger')}else{console.log('Network is busy')}
    }else{
     console.log(_outputSymbol,'Pa->Bu',financial(profit),'USD')

    }
  }
  if (num_pancake > num_bakery && num_bakery>0){
    bakeryswapAmountsOut = await bakeryRouterContract.methods.getAmountsOut(num_pancake,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(bakeryswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Pa->Ba',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('pancake',PANCAKESWAP_ROUTER_ADDRESS,outputAddress,bakeryswapAmountsOut[1],'bakery')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Pa->Ba',financial(profit),'USD')

    }
  }
  if (num_pancake > num_jul && num_jul>0){
    julswapAmountsOut = await julRouterContract.methods.getAmountsOut(num_pancake,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(julswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Pa->Ju',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('pancake',PANCAKESWAP_ROUTER_ADDRESS,outputAddress,julswapAmountsOut[1],'jul')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Pa->Ju',financial(profit),'USD')

    }
  }
  if (num_pancake > num_ape && num_ape>0){
    apeswapAmountsOut = await apeRouterContract.methods.getAmountsOut(num_pancake,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(apeswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Pa->Ap',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('pancake',PANCAKESWAP_ROUTER_ADDRESS,outputAddress,apeswapAmountsOut[1],'burger')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Pa->Ap',financial(profit),'USD')

    }
  }
/*
  if (num_burger  > num_pancake && num_pancake>0){
    pancakeswapAmountsOut = await pancakeRouterContract.methods.getAmountsOut(num_burger,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(pancakeswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Bu->Pa',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('burger',BURGERSWAP_ROUTER_ADDRESS,outputAddress,pancakeswapAmountsOut[1],'pancake')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Bu->Pa',financial(profit),'USD')

    }
  }
  if (num_burger  > num_bakery && num_bakery>0){
    bakeryswapAmountsOut = await bakeryRouterContract.methods.getAmountsOut(num_burger,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(bakeryswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Bu->Ba',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('burger',BURGERSWAP_ROUTER_ADDRESS,outputAddress,bakeryswapAmountsOut[1],'bakery')}else{console.log('Network is busy')}
    }else{
     console.log(_outputSymbol,'Bu->Ba',financial(profit),'USD')

    }
  }
  if (num_burger  > num_jul && num_jul>0){
    julswapAmountsOut = await julRouterContract.methods.getAmountsOut(num_burger,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(julswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Bu->Ju',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('burger',BURGERSWAP_ROUTER_ADDRESS,outputAddress,julswapAmountsOut[1],'julswap')}else{console.log('Network is busy')}
    }else{
     console.log(_outputSymbol,'Bu->Ju',financial(profit),'USD')

    }
  }
  if (num_burger  > num_ape && num_ape>0){
    apeswapAmountsOut = await apeRouterContract.methods.getAmountsOut(num_burger,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(apeswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ba->Ap',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('burger',BURGERSWAP_ROUTER_ADDRESS,outputAddress,apeswapAmountsOut[1],'apeswap')}else{console.log('Network is busy')}
    }else{
     console.log(_outputSymbol,'Ba->Ap',financial(profit),'USD')

    }
  }
*/
  if (num_jul > num_pancake && num_pancake>0){
    pancakeswapAmountsOut = await pancakeRouterContract.methods.getAmountsOut( num_jul,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(pancakeswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ju->Pa',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('jul',JULSWAP_ROUTER_ADDRESS,outputAddress,pancakeswapAmountsOut[1],'pancake')}else{console.log('Network is busy')}
    }else{
    console.log(_outputSymbol,'Ju->Pa',financial(profit),'USD')

    }
  }
  if (num_jul > num_burger && num_burger>0){
    burgerswapAmountsOut = await burgerRouterContract.methods.getAmountsOut(num_jul,([outputAddress,inputAddress])).call()
    //console.log('Julswap converted .1 BNB to',num_jul, outputSymbol,'Now Burgerswap will convert that back to',web3.utils.fromWei(burgerswapAmountsOut[1]), 'BNB ' )
    swapprofit_inBNB = (web3.utils.fromWei(burgerswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ju->Bu',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('jul',JULSWAP_ROUTER_ADDRESS,outputAddress,burgerswapAmountsOut[1],'burger')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Ju->Bu',financial(profit),'USD')

    }
  }
  if (num_jul > num_bakery && num_bakery>0){
    bakeryswapAmountsOut = await bakeryRouterContract.methods.getAmountsOut(num_jul,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(bakeryswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ju->Ba',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('jul',JULSWAP_ROUTER_ADDRESS,outputAddress,bakeryswapAmountsOut[1],'bakery')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Ju->Ba',financial(profit),'USD')

    }
  }
  if (num_jul > num_ape && num_ape>0){
    apeswapAmountsOut = await apeRouterContract.methods.getAmountsOut(num_jul,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(apeswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ju->Ap',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('jul',JULSWAP_ROUTER_ADDRESS,outputAddress,apeswapAmountsOut[1],'ape')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Ju->Ap',financial(profit),'USD')

    }
  }

  if (num_bakery > num_burger && num_burger>0){
    burgerswapAmountsOut = await burgerRouterContract.methods.getAmountsOut(num_bakery,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(burgerswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ba->Bu',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('bakery',BAKERYSWAP_ROUTER_ADDRESS,outputAddress,burgerswapAmountsOut[1],'burger')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Ba->Bu',financial(profit),'USD')

    }
  }
  if (num_bakery > num_pancake && num_pancake>0){
    pancakeswapAmountsOut = await pancakeRouterContract.methods.getAmountsOut(num_bakery,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(pancakeswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ba->Pa',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('bakery',BAKERYSWAP_ROUTER_ADDRESS,outputAddress,pancakeswapAmountsOut[1],'pancake')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Ba->Pa',financial(profit),'USD')

    }
  }
  if (num_bakery > num_jul && num_jul>0){
    julswapAmountsOut = await julRouterContract.methods.getAmountsOut(num_bakery,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(julswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ba->Ju',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('bakery',BAKERYSWAP_ROUTER_ADDRESS,outputAddress,julswapAmountsOut[1],'jul')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Ba->Ju',financial(profit),'USD')

    }
  }
  if (num_bakery > num_ape && num_ape>0){
    apeswapAmountsOut = await apeRouterContract.methods.getAmountsOut(num_bakery,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(apeswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ba->Ap',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('bakery',BAKERYSWAP_ROUTER_ADDRESS,outputAddress,apeswapAmountsOut[1],'ape')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Ba->Ap',financial(profit),'USD')

    }
  }

  if (num_ape > num_pancake && num_pancake>0){
    pancakeswapAmountsOut = await pancakeRouterContract.methods.getAmountsOut( num_ape,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(pancakeswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ap->Pa',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('ape',APESWAP_ROUTER_ADDRESS,outputAddress,pancakeswapAmountsOut[1],'pancake')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Ap->Pa',financial(profit),'USD')

    }
  }
  if (num_ape > num_burger && num_burger>0){
    burgerswapAmountsOut = await burgerRouterContract.methods.getAmountsOut(num_ape,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(burgerswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ap->Bu',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('ape',APESWAP_ROUTER_ADDRESS,outputAddress,burgerswapAmountsOut[1],'burger')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Ap->Bu',financial(profit),'USD')

    }
  }
  if (num_ape > num_bakery && num_bakery>0){
    bakeryswapAmountsOut = await bakeryRouterContract.methods.getAmountsOut(num_ape,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(bakeryswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ap->Ba',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('ape',APESWAP_ROUTER_ADDRESS,outputAddress,bakeryswapAmountsOut[1],'bakery')}else{console.log('Network is busy')}

    }else{
     console.log(_outputSymbol,'Ap->Ba',financial(profit),'USD')

    }
  }
  if (num_ape > num_jul && num_jul>0){
    julswapAmountsOut = await julRouterContract.methods.getAmountsOut( num_ape,([outputAddress,inputAddress])).call()
    swapprofit_inBNB = (web3.utils.fromWei(julswapAmountsOut[1],'Ether')) - web3.utils.fromWei(flash_amount)
    let profit = (swapprofit_inBNB - gascost_inBNB)*bnbPrice
    if(profit>highestProfit){
      highestProfit = profit
    }
    if(profit > zero){
      console.log(_outputSymbol,'Ap->Ju',financial(profit),'USD')
      alertTerminal()
      let time = moment().tz('America/Chicago').format()
      create_record(_inputSymbol,_outputSymbol, profit, time)
      if(networkisBusy=='false'){
      swapWBNB_TOKEN('ape',APESWAP_ROUTER_ADDRESS,outputAddress,julswapAmountsOut[1],'jul')}else{console.log('Network is busy')}
    }else{
     console.log(_outputSymbol,'Ap->Ju',financial(profit),'USD')

    }
  }
  _inputAddress=inputAddress
  _outputAddress=outputAddress
}
let priceMonitor
let monitoringPrice = false


 async function checkTokenApproval(tokenAddress, exchange){
  var common = ethereumjs_common.forCustomChain ('mainnet', { networkId: 56, chainId: 56, name: 'bnb' }, 'petersburg');
  const brc20TokenContract = new web3.eth.Contract(BRC20_TOKEN_ABI, tokenAddress,common)
  if(exchange == 'pancake'){
      let allowance = await brc20TokenContract.methods.allowance(meAddress,PANCAKESWAP_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT PANCAKE',allowance, token,tokenAddress)
      await swapToken_WBNB(tokenAddress,'pancake',PANCAKESWAP_ROUTER_ADDRESS)
  }else{
      const approvedToken = await brc20TokenContract.methods.approve(PANCAKESWAP_ROUTER_ADDRESS,token)
      console.log('APPROVING TOKEN WITH PANCAKE',allowance, token,tokenAddress)
      const data = approvedToken.encodeABI();
      const txData = {
        chainId: chainId,
        networkId: networkId,
      gasLimit: web3.utils.toHex(90000),
      gasPrice: web3.utils.toHex(binance_gasPrice), // 100 Gwei
      to: tokenAddress,
      from: meAddress,
      data: web3.utils.toHex(data),
      //value: web3.utils.toHex(1e17)//1000000000000000000 1e18
      }
      const sendRawTransaction = txData =>
      web3.eth.getTransactionCount(meAddress).then(txCount => {
        const newNonce = web3.utils.toHex(txCount)
        let bscProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org:443', { name: 'bnb', networkId: 56, chainId: 56 })
        var common = ethereumjs_common.forCustomChain ('mainnet', { networkId: 56, chainId: 56, name: 'bnb' }, 'petersburg');

        const transaction = new Tx({ ...txData, nonce: newNonce },{"common": common}) // or 'rinkeby'
        const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
        transaction.sign(privateKey)
        const serializedTx = transaction.serialize().toString('hex')
        return web3.eth.sendSignedTransaction('0x' + serializedTx)
      })

      const receipt = await sendRawTransaction(txData)
      const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)

      await swapToken_WBNB(tokenAddress,'pancake',PANCAKESWAP_ROUTER_ADDRESS)
  }}

  if(exchange == 'bakery'){
      let allowance = await brc20TokenContract.methods.allowance(meAddress,BAKERYSWAP_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT BAKERY',allowance, token,tokenAddress)
      await swapToken_WBNB(tokenAddress,'bakery',BAKERYSWAP_ROUTER_ADDRESS)
  }else{
      console.log('APPROVING TOKEN WITH BAKERY',allowance, token,tokenAddress)
      const approvedToken = await brc20TokenContract.methods.approve(BAKERYSWAP_ROUTER_ADDRESS,token)
      const data = approvedToken.encodeABI();
      const txData = {
        chainId: chainId,
        networkId: networkId,
      gasLimit: web3.utils.toHex(90000),
      gasPrice: web3.utils.toHex(binance_gasPrice), // 100 Gwei
      to: tokenAddress,
      from: meAddress,
      data: web3.utils.toHex(data),
      //value: web3.utils.toHex(1e17)//1000000000000000000 1e18
      }
      const sendRawTransaction = txData =>
      web3.eth.getTransactionCount(meAddress).then(txCount => {
        const newNonce = web3.utils.toHex(txCount)
        let bscProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org:443', { name: 'bnb', networkId: 56, chainId: 56 })
        var common = ethereumjs_common.forCustomChain ('mainnet', { networkId: 56, chainId: 56, name: 'bnb' }, 'petersburg');

        const transaction = new Tx({ ...txData, nonce: newNonce },{"common": common}) // or 'rinkeby'
        const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
        transaction.sign(privateKey)
        const serializedTx = transaction.serialize().toString('hex')
        return web3.eth.sendSignedTransaction('0x' + serializedTx)
      })

      const receipt = await sendRawTransaction(txData)
      const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)

      await swapToken_WBNB(tokenAddress,'bakery',BAKERYSWAP_ROUTER_ADDRESS)
  }}

/*
  if(exchange == 'burger'){
      let allowance = await brc20TokenContract.methods.allowance(meAddress,BURGERSWAP_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT BURGER',allowance, token,tokenAddress)
      await swapToken_WBNB(tokenAddress,'burger',BURGERSWAP_ROUTER_ADDRESS)
  }else{
      const approvedToken = await brc20TokenContract.methods.approve(BURGERSWAP_ROUTER_ADDRESS,token)
      console.log('APPROVING TOKEN WITH BURGER',allowance, token,tokenAddress)
      const data = approvedToken.encodeABI();
      const txData = {
        chainId: chainId,
        networkId: networkId,
      gasLimit: web3.utils.toHex(90000),
      gasPrice: web3.utils.toHex(binance_gasPrice), // 100 Gwei
      to: tokenAddress,
      from: meAddress,
      data: web3.utils.toHex(data),
      //value: web3.utils.toHex(1e17)//1000000000000000000 1e18
      }
      const sendRawTransaction = txData =>
      web3.eth.getTransactionCount(meAddress).then(txCount => {
        const newNonce = web3.utils.toHex(txCount)
        let bscProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org:443', { name: 'bnb', networkId: 56, chainId: 56 })
        var common = ethereumjs_common.forCustomChain ('mainnet', { networkId: 56, chainId: 56, name: 'bnb' }, 'petersburg');

        const transaction = new Tx({ ...txData, nonce: newNonce },{"common": common}) // or 'rinkeby'
        const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
        transaction.sign(privateKey)
        const serializedTx = transaction.serialize().toString('hex')
        return web3.eth.sendSignedTransaction('0x' + serializedTx)
      })

      const receipt = await sendRawTransaction(txData)
      const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)

      await swapToken_WBNB(tokenAddress,'burger',BURGERSWAP_ROUTER_ADDRESS)
  }}
*/

  if(exchange == 'ape'){
      let allowance = await brc20TokenContract.methods.allowance(meAddress,APESWAP_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT APESWAP',allowance, token,tokenAddress)
      await swapToken_WBNB(tokenAddress,'ape',APESWAP_ROUTER_ADDRESS)
  }else{
      const approvedToken = await brc20TokenContract.methods.approve(APESWAP_ROUTER_ADDRESS,token)
      console.log('APPROVING TOKEN WITH APESWAP',allowance, token,tokenAddress)
      const data = approvedToken.encodeABI();
      const txData = {
        chainId: chainId,
        networkId: networkId,
      gasLimit: web3.utils.toHex(90000),
      gasPrice: web3.utils.toHex(binance_gasPrice), // 100 Gwei
      to: tokenAddress,
      from: meAddress,
      data: web3.utils.toHex(data),
      //value: web3.utils.toHex(1e17)//1000000000000000000 1e18
      }
      const sendRawTransaction = txData =>
      web3.eth.getTransactionCount(meAddress).then(txCount => {
        const newNonce = web3.utils.toHex(txCount)
        let bscProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org:443', { name: 'bnb', networkId: 56, chainId: 56 })
        var common = ethereumjs_common.forCustomChain ('mainnet', { networkId: 56, chainId: 56, name: 'bnb' }, 'petersburg');

        const transaction = new Tx({ ...txData, nonce: newNonce },{"common": common}) // or 'rinkeby'
        const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
        transaction.sign(privateKey)
        const serializedTx = transaction.serialize().toString('hex')
        return web3.eth.sendSignedTransaction('0x' + serializedTx)
      })

      const receipt = await sendRawTransaction(txData)
      const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)

      await swapToken_WBNB(tokenAddress,'ape',APESWAP_ROUTER_ADDRESS)
  }}

  if(exchange == 'jul'){
      let allowance = await brc20TokenContract.methods.allowance(meAddress,JULSWAP_ROUTER_ADDRESS).call()
      if(Number(allowance) >= Number(token)){
      console.log('MOVING ON TO SWAP AT JUL',allowance, token,tokenAddress)
      await swapToken_WBNB(tokenAddress,'jul',JULSWAP_ROUTER_ADDRESS)
  }else{
      const approvedToken = await brc20TokenContract.methods.approve(JULSWAP_ROUTER_ADDRESS,token)
      console.log('APPROVING TOKEN WITH JUL',allowance, token,tokenAddress)
      const data = approvedToken.encodeABI();
      const txData = {
        chainId: chainId,
        networkId: networkId,
      gasLimit: web3.utils.toHex(90000),
      gasPrice: web3.utils.toHex(binance_gasPrice), // 100 Gwei
      to: tokenAddress,
      from: meAddress,
      data: web3.utils.toHex(data),
      //value: web3.utils.toHex(1e17)//1000000000000000000 1e18
      }
      const sendRawTransaction = txData =>
      web3.eth.getTransactionCount(meAddress).then(txCount => {
        const newNonce = web3.utils.toHex(txCount)
        var common = ethereumjs_common.forCustomChain ('mainnet', { networkId: 56, chainId: 56, name: 'bnb' }, 'petersburg');

        const transaction = new Tx({ ...txData, nonce: newNonce },{"common": common}) // or 'rinkeby'
        const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
        transaction.sign(privateKey)
        const serializedTx = transaction.serialize().toString('hex')
        return web3.eth.sendSignedTransaction('0x' + serializedTx)
      })

      const receipt = await sendRawTransaction(txData)
      const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)

      await swapToken_WBNB(tokenAddress,'jul',JULSWAP_ROUTER_ADDRESS)
  }}
 }

async function swapWBNB_TOKEN(exchange, exchange_router_address, trading_address, expectedAmount, other_exchange) {
  networkisBusy = 'true'
  monitoringPrice = false
  clearInterval(priceMonitor)
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [_inputAddress,trading_address]//
  //const web3 = new Web3(process.env.RPC_URL);//
  //const networkId = await web3.eth.net.getId();
  let myContract
  if(exchange == 'pancake'){
  myContract = await pancakeRouterContract.methods.swapExactETHForTokens('0',address_pair,meAddress, DEADLINE)//.send(SETTINGS_1)//}
 }
  if(exchange == 'bakery'){
  myContract = await bakeryRouterContract.methods.swapExactBNBForTokens('0',address_pair,meAddress, DEADLINE)//.send(SETTINGS_1)//}
 }

  if(exchange == 'burger'){
  myContract = await burgerRouterContract.methods.swapExactETHForTokens('0',address_pair,meAddress, DEADLINE)//.send(SETTINGS_1)//}
 }

  if(exchange == 'jul'){
  myContract = await julRouterContract.methods.swapExactBNBForTokens('0',address_pair,meAddress, DEADLINE)//.send(SETTINGS_1)//}
 }
  if(exchange == 'ape'){
  myContract = await apeRouterContract.methods.swapExactETHForTokens('0',address_pair,meAddress, DEADLINE)//.send(SETTINGS_1)//}
 }
  const gas = 900000;
  const data = myContract.encodeABI();
  const txData = {
    chainId: chainId,
    networkId: networkId,
  gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(binance_gasPrice), // 100 Gwei
  to: exchange_router_address,
  from: meAddress,
  data: web3.utils.toHex(data),
  value: web3.utils.toHex(3e17)//1000000000000000000 1e18



  }
  console.log(
  'Transaction Action, SWAP',
  web3.utils.fromWei(flash_amount), _inputSymbol,
  'for',
  web3.utils.fromWei(expectedAmount),
  _outputSymbol,_outputAddress,
  'on xchange with exchange address of',
  exchange,
  exchange_router_address,
  'Expected Transaction Fee',
  (gas * .75)*web3.utils.fromWei(binance_gasPrice),
  'WBNB with gas price of',
   web3.utils.fromWei(binance_gasPrice),
  'gas of',
  gas,
  'from my address',
  meAddress)

  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(meAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    //let bscProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org:443', { name: 'bnb', networkId: 56, chainId: 56 })
    var common = ethereumjs_common.forCustomChain ('mainnet', { networkId: 56, chainId: 56, name: 'bnb' }, 'petersburg');

    const transaction = new Tx({ ...txData, nonce: newNonce },{"common": common}) // or 'rinkeby'
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
  priceMonitor = setInterval(async () => { await monitorPrice() }, 60000) //60 seconds

  checkTokenApproval(trading_address,other_exchange)

 }

async function swapToken_WBNB(trading_address, exchange, exchangeAddress) {
  let myContract
  binance_gasPrice = await web3.eth.getGasPrice()
 try{
  const moment = require('moment') // import moment.js library
  const now = moment().unix() // fetch current unix timestamp
  const DEADLINE = now + 60 // add 60 seconds
  let address_pair = [trading_address,_inputAddress]//
  if(exchange == 'pancake'){
  myContract = await pancakeRouterContract.methods.swapExactTokensForETH(token,'0',address_pair,meAddress, DEADLINE)}
  if(exchange == 'bakery'){
  myContract = await bakeryRouterContract.methods.swapExactTokensForBNB(token,'0',address_pair,meAddress, DEADLINE)}
  if(exchange == 'burger'){
  myContract = await burgerRouterContract.methods.swapExactTokensForETH(token,'0',address_pair,meAddress, DEADLINE)}
  if(exchange == 'jul'){
  myContract = await julRouterContract.methods.swapExactTokensForBNB(token,'0',address_pair,meAddress, DEADLINE)}
  if(exchange == 'ape'){
  myContract = await apeRouterContract.methods.swapExactTokensForETH(token,'0',address_pair,meAddress, DEADLINE)}
  const gas = 900000;
  const data = myContract.encodeABI();
  const txData = {
    chainId: chainId,
    networkId: networkId,
    gasLimit: web3.utils.toHex(gas),
  gasPrice: web3.utils.toHex(binance_gasPrice), // 100 Gwei
  to: exchangeAddress,
  from: meAddress,
  data: web3.utils.toHex(data),


  //value: web3.utils.toHex(1e17)
  }

  const sendRawTransaction = txData =>
  web3.eth.getTransactionCount(meAddress).then(txCount => {
    const newNonce = web3.utils.toHex(txCount)
    //let bscProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org:443', { name: 'bnb', networkId: 56, chainId: 56 })
    var common = ethereumjs_common.forCustomChain ('mainnet', { networkId: 56, chainId: 56, name: 'bnb' }, 'petersburg');

    const transaction = new Tx({ ...txData, nonce: newNonce },{"common": common}) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
      })
    const receipt = await sendRawTransaction(txData)
    const info =  await web3.eth.getTransactionReceipt(receipt.transactionHash)
    console.log(info)
    networkisBusy = 'false'
  }catch (error) {
  console.error(error);

  }
}


async function monitorPrice() {
  networkId = await web3.eth.net.getId();
  chainId = await web3.eth.getChainId();
  console.log('******HIGHEST PROFIT SO FAR IS $', financial(highestProfit))
  binance_gasPrice = await web3.eth.getGasPrice()
  if(monitoringPrice) {return}
  monitoringPrice = true
  try {
    for (pa in binance_pairs) {
          await checkPairs({
          position: pa,
          inputSymbol: wbnb[0].symbol,
          inputAddress: wbnb[0].address,
          outputSymbol: binance_pairs[pa].symbol,
          outputAddress: binance_pairs[pa].address,
          pancake_exchange: binance_pairs[pa].pancake,
          burger_exchange: binance_pairs[pa].burger,
          bakery_exchange: binance_pairs[pa].bakery,
          jul_exchange: binance_pairs[pa].jul,
          ape_exchange: binance_pairs[pa].ape,
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

function alertTerminal(){
  console.log("\007");
}

async function create_record(inputSymbol, outputSymbol, difference, time){
  const random = Math.floor((Math.random() * 10000) + 1);
  const obj = {inputSymbol, outputSymbol, difference, time}
  const fs = require('fs');
  fs.writeFile("/Users/julian/Desktop/Price/arbi_ops/arbi_op."+inputSymbol+"-"+outputSymbol+random+".txt", JSON.stringify(obj), function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

// Check markets every n seconds
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 180000 // 180 seconds
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL)
