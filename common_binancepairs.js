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
const ERC20_ABI = require('./abis/erc20/erc20_abi.json')


let pairsize = 50
let pancakebakerypairs =[
  { symbol: '$BOOLISH',  address: '0x08c9aa1e4Fc83CdF1F2c0CB120C8e28F0Da5C8E5', bakery:'TRUE' },
  { symbol: '$HUSKY',  address: '0x11187fEc3898aC44dB5777857A6772E64084CDA0', bakery:'TRUE' },
  { symbol: '0xzx',  address: '0x1fBB6cA220dCBE732f796Fa9b13dd21cD654511b', bakery:'TRUE' },
  { symbol: '18D',  address: '0x7d9c30B7131aE9aDA3F26bdEB2206fBF08213bA5', bakery:'TRUE' },
  { symbol: '1INCH',  address: '0x111111111117dC0aa78b770fA6A738034120C302', bakery:'TRUE' },
  { symbol: 'ADA',  address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47', bakery:'TRUE' },
  { symbol: 'AEDART',  address: '0x4247aeB8E759e575Fe350921cD174C48df304F2A', bakery:'TRUE' },
  { symbol: 'ALICE',  address: '0xAC51066d7bEC65Dc4589368da368b212745d63E8', bakery:'TRUE' },
  { symbol: 'ALPACA',  address: '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F', bakery:'TRUE' },
  { symbol: 'ARGON',  address: '0x851F7a700c5d67DB59612b871338a85526752c25', bakery:'TRUE' },
  { symbol: 'ASS',  address: '0x7c63F96fEAFACD84e75a594C00faC3693386FBf0', bakery:'TRUE' },
  { symbol: 'AUTO',  address: '0xa184088a740c695E156F91f5cC086a06bb78b827', bakery:'TRUE' },
  { symbol: 'AYMC',  address: '0xA96d372a15d768eFBaf3dA68f52D3339e3061b01', bakery:'TRUE' },
  { symbol: 'Azu',  address: '0x49F3FFe56888B587d97B6bfc8c89503c406B7C5b', bakery:'TRUE' },
  { symbol: 'BANANA',  address: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95', bakery:'TRUE' },
  { symbol: 'BAT',  address: '0x101d82428437127bF1608F699CD651e6Abf9766E', bakery:'TRUE' },
  { symbol: 'BETH',  address: '0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B', bakery:'TRUE' },
  { symbol: 'BFI',  address: '0xAFa4f3D72f0803B50C99663B3E90806d9D290770', bakery:'TRUE' },
  { symbol: 'BFM',  address: '0x38CFF5cb6e2a5834f7F48EEB5d7263ABEF2E2255', bakery:'TRUE' },
  { symbol: 'BK',  address: '0x16d9FA184E3B10a0013Ee466bAcdC9982abfEe1D', bakery:'TRUE' },
  { symbol: 'BLES',  address: '0x7c8C653eEC81A08c02a47C9e78bE486F48Fa175D', bakery:'TRUE' },
  { symbol: 'BLL',  address: '0x7cbb20014BeF8fD587D9435c4d5953bCBdb1756F', bakery:'TRUE' },
  { symbol: 'BLZD',  address: '0xAD2726074716EF235CC5bA3358a064d14C7db2FD', bakery:'TRUE' },
  { symbol: 'BONDLY',  address: '0x96058f8C3e16576D9BD68766f3836d9A33158f89', bakery:'TRUE' },
  { symbol: 'BRAH',  address: '0x855fD65272bB636a83c40Dc49d9afe73f69b2c3D', bakery:'TRUE' },
  { symbol: 'BREW',  address: '0x790Be81C3cA0e53974bE2688cDb954732C9862e1', bakery:'TRUE' },
  { symbol: 'BSCX',  address: '0x5Ac52EE5b2a633895292Ff6d8A89bB9190451587', bakery:'TRUE' },
  { symbol: 'BSOCKS',  address: '0x2a4C94B84B942e1180FDEE7c096b9372a704d5B6', bakery:'TRUE' },
  { symbol: 'BSOCKS',  address: '0x7bB975F06dAbEb45c7D4c869Ba20D28D1C254393', bakery:'TRUE' },
  { symbol: 'BTCB',  address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', bakery:'TRUE' },
  { symbol: 'BULLWIN',  address: '0x383098065E063b518743648C44C6DB86fEb0b724', bakery:'TRUE' },
  { symbol: 'BULLWIN',  address: '0xAdEF36cBb2add6F8a639AB97957fB5F2634AC3da', bakery:'TRUE' },
  { symbol: 'BURGER',  address: '0xAe9269f27437f0fcBC232d39Ec814844a51d6b8f', bakery:'TRUE' },
  { symbol: 'Berry',  address: '0x8626F099434d9A7E603B8f0273880209eaBfc1c5', bakery:'TRUE' },
  { symbol: 'CFFN',  address: '0x80C0159aa268fEd667D25cE6159A34B73EfbfCE4', bakery:'TRUE' },
  { symbol: 'COCO',  address: '0x2D0C83E27B38C7CA3AAeb8306ba84FDc1Bb673d0', bakery:'TRUE' },
  { symbol: 'COINSPH',  address: '0x29C0d0375Cd9fB48a294B63c8D129c44476656A7', bakery:'TRUE' },
  { symbol: 'COMPASS',  address: '0x40C6BCE4EE70ef57E065a91FBF233E427e32fF71', bakery:'TRUE' },
  { symbol: 'CORGI',  address: '0x802C68730212295149f2bEa78C25e2Cf5A05B8A0', bakery:'TRUE' },
  { symbol: 'CUMMIES',  address: '0x27Ae27110350B98d564b9A3eeD31bAeBc82d878d', bakery:'TRUE' },
  { symbol: 'Cake',  address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', bakery:'TRUE' },
  { symbol: 'Cltve',  address: '0x8a3E4D92396B85a319986442C402b94e623a0371', bakery:'TRUE' },
  { symbol: 'D100',  address: '0x9d8AAC497A4b8fe697dd63101d793F0C6A6EEbB6', bakery:'TRUE' },
  { symbol: 'DAI',  address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', bakery:'TRUE' },
  { symbol: 'DARUMA',  address: '0x1d9984B2b493be23A7d572BC77Ef6A8da1DA85EE', bakery:'TRUE' },
  { symbol: 'DCSX',  address: '0x79191D164F4D9c689C47aa16f99Bf0e5a955c676', bakery:'TRUE' },
  { symbol: 'DEFISWAP',  address: '0x73854245C99529C4625139041D96Fc4E42714c51', bakery:'TRUE' },
  { symbol: 'DFY',  address: '0xA276F181690BD44299BF25D43C5B2b7Ce1dF9e65', bakery:'TRUE' },
  { symbol: 'DIAMOND',  address: '0x3e8cfdd483c5818c5A4A799CBAae324002d086AD', bakery:'TRUE' },
  { symbol: 'DINO',  address: '0x9B7f59A5b5A2D0A7e9DAEB5b5A19DA112D533dC7', bakery:'TRUE' },
  { symbol: 'DMOON',  address: '0x9813fc87522E57c6B42bdF1e159DcB1b444e92Ce', bakery:'TRUE' },
  { symbol: 'DODO',  address: '0x820d3C1407C424286856045ac31fD074c7FBD206', bakery:'TRUE' },
  { symbol: 'DOGE',  address: '0x4206931337dc273a630d328dA6441786BfaD668f', bakery:'TRUE' },
  { symbol: 'DOGE',  address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43', bakery:'TRUE' },
  { symbol: 'DONATE',  address: '0x704aF5BC0CCcCd4EDD3041aadd3392f7c41a983e', bakery:'TRUE' },
  { symbol: 'DOT',  address: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402', bakery:'TRUE' },
  { symbol: 'ELT',  address: '0x49961bDEf01b26E69652EFC0AF5a164d56669553', bakery:'TRUE' },
  { symbol: 'ERC20',  address: '0x58730ae0FAA10d73b0cDdb5e7b87C3594f7a20CB', bakery:'TRUE' },
  { symbol: 'ETH',  address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', bakery:'TRUE' },
  { symbol: 'FASTMOON',  address: '0x869Dd7A64AfBe5370a8c591d9B8650BE60c0B8f6', bakery:'TRUE' },
  { symbol: 'FDOG',  address: '0x5488da908871B9Ca49f6C2781C0D006Ee7e2EECb', bakery:'TRUE' },
  { symbol: 'FEG',  address: '0xacFC95585D80Ab62f67A14C566C1b7a49Fe91167', bakery:'TRUE' },
  { symbol: 'FERRY',  address: '0xAa38420302f6aE39C7A32881A9d806326b1De670', bakery:'TRUE' },
  { symbol: 'FMG',  address: '0x72A167C9783b7d4fFf91d43A60e00D25957A50f8', bakery:'TRUE' },
  { symbol: 'FOR',  address: '0x658A109C5900BC6d2357c87549B651670E5b0539', bakery:'TRUE' },
  { symbol: 'FREE',  address: '0x12e34cDf6A031a10FE241864c32fB03a4FDaD739', bakery:'TRUE' },
  { symbol: 'FREN',  address: '0x13958e1eb63dFB8540Eaf6ed7DcbBc1A60FD52AF', bakery:'TRUE' },
  { symbol: 'FRUIT',  address: '0x9CF518B83804d30Fb007e17757D317D9B03619a5', bakery:'TRUE' },
  { symbol: 'FSXU',  address: '0xa94b7a842aADB617a0B08fA744e033C6De2f7595', bakery:'TRUE' },
  { symbol: 'FTL',  address: '0x791e0b31302d58FC879105E366Ac82F5D1d23159', bakery:'TRUE' },
  { symbol: 'FXT',  address: '0x1b359EC602fedE768f269a1343813df1F38101C2', bakery:'TRUE' },
  { symbol: 'Faucetpay.io',  address: '0x352E5392143D054Bc6F4dF53A179BB330a408C7e', bakery:'TRUE' },
  { symbol: 'GANGSTER',  address: '0x5B628312D59e5b2a60b5029dF88009F6142e8345', bakery:'TRUE' },
  { symbol: 'GCR',  address: '0x451D0e4B04A16223BbaeCe67b2276223DB0d19dA', bakery:'TRUE' },
  { symbol: 'GEN',  address: '0x04AD13a645748CEE762F11E43386FE2a275885b4', bakery:'TRUE' },
  { symbol: 'GOJI',  address: '0x04bAC3934f995E83CcD8CafB583Eb5ef956b60ed', bakery:'TRUE' },
  { symbol: 'GOUR',  address: '0x900066A04FFCAC7EA0A5F472221A56aC6136dAD0', bakery:'TRUE' },
  { symbol: 'HDS',  address: '0x34caA1bD180B40f02502A9DCF96CBe33e81F2fe5', bakery:'TRUE' },
  { symbol: 'HITMAN',  address: '0x0F8a4B1C3d16EE64A8feBcDDC24b5F39da54b708', bakery:'TRUE' },
  { symbol: 'HOGE',  address: '0x0c3a3726b07f2153fBD80ED4417972aEFFEb0015', bakery:'TRUE' },
  { symbol: 'HP',  address: '0x540a335EA0e418b5c856581bF882362144b4f287', bakery:'TRUE' },
  { symbol: 'HYFI',  address: '0x9a319b959e33369C5eaA494a770117eE3e585318', bakery:'TRUE' },
  { symbol: 'INKS',  address: '0xb228967d7C4b993772f0b4443ABF46FFB1C1b918', bakery:'TRUE' },
  { symbol: 'INST',  address: '0x1dc36D6C434fF2Abef3CA2536F77D247C063A0a7', bakery:'TRUE' },
  { symbol: 'INSTAMOON',  address: '0x5a1dB8f44b0bBea1A94B3ab3c340Ee3Af122Dfdc', bakery:'TRUE' },
  { symbol: 'KACI',  address: '0x1189Cb79386bf2f309b86F3e3459a45CB2C05b94', bakery:'TRUE' },
  { symbol: 'LABO',  address: '0x171401a3d18B21BFa3f9bF4F9637F3691158365A', bakery:'TRUE' },
  { symbol: 'LFF',  address: '0x1fa31F67910cb7D20EC25d45636e64eD250D56e2', bakery:'TRUE' },
  { symbol: 'LMT',  address: '0x786d423a798Df8B2b5cABD73eE9A9eEf1eECe68C', bakery:'TRUE' },
  { symbol: 'LTC',  address: '0x4338665CBB7B2485A8855A139b75D5e34AB0DB94', bakery:'TRUE' },
  { symbol: 'LTRBT',  address: '0x17D749D3E2ac204a07e19D8096d9a05c423ea3af', bakery:'TRUE' },
  { symbol: 'LUGIA',  address: '0xb9b29910e6495ed1B98A637aCa74AAa13Bc84b05', bakery:'TRUE' },
  { symbol: 'MARS',  address: '0x89C21e1291717B51beaF3256DA59f049EE617C57', bakery:'TRUE' },
  { symbol: 'MEMES',  address: '0x40B165Fd5dDc75ad0bDDc9ADd0adAbff5431a975', bakery:'TRUE' },
  { symbol: 'MERO',  address: '0x476DA763fb6D22B8465f7886d2d652A428a93984', bakery:'TRUE' },
  { symbol: 'MF',  address: '0xBa79f0bE1D86723CcE79Df7E9d3aae972f06DF2E', bakery:'TRUE' },
  { symbol: 'MILK',  address: '0xb7CEF49d89321e22dd3F51a212d58398Ad542640', bakery:'TRUE' },
  { symbol: 'MILL',  address: '0x2E2f93dAf0eaCAda0c25fEFa5007F338f788FB2d', bakery:'TRUE' },
  { symbol: 'MK',  address: '0x8d8F82dfB25d0943C06302EeFD5Eb360B011B758', bakery:'TRUE' },
  { symbol: 'MOK-LP',  address: '0x124E171b871b3852579783a4e5835c2a71fa52D1', bakery:'TRUE' },
  { symbol: 'MON',  address: '0x854Cd4d6E9440Df7Cc02770bb72873E7e05c2DF3', bakery:'TRUE' },
  { symbol: 'MPN',  address: '0x7f1C9c56e6b4b639008c03fb567FB76e9F2268B0', bakery:'TRUE' },
  { symbol: 'MTF',  address: '0x95Ea82A63ee70f3cB141eC55ea4a37339746eB32', bakery:'TRUE' },
  { symbol: 'MX',  address: '0x9F882567A62a5560d147d64871776EeA72Df41D3', bakery:'TRUE' },
  { symbol: 'NANA',  address: '0x355ad7aBB7bdD53beC94c068F3ABbCB2E2571d0D', bakery:'TRUE' },
  { symbol: 'NAUT',  address: '0x05B339B0A346bF01f851ddE47a5d485c34FE220c', bakery:'TRUE' },
  { symbol: 'NIG',  address: '0x86f3496b0Ff38A17c1A361ef6Cc5d040853eb0b7', bakery:'TRUE' },
  { symbol: 'NINJA',  address: '0x93e7567f277F353d241973d6f85b5feA1dD84C10', bakery:'TRUE' },
  { symbol: 'NN',  address: '0x897fE07d613037c206429628611A2665E18C657d', bakery:'TRUE' },
  { symbol: 'NOTBAD',  address: '0x676855097117A6A32043dB65c046D53B72e72B04', bakery:'TRUE' },
  { symbol: 'NOWHALES',  address: '0xAD5e8494309D3C42C91e88b4698AcAac1814cCc0', bakery:'TRUE' },
  { symbol: 'NRV',  address: '0x3633144e8fA5E11f56Ff0B6eE00FE20F5fAd52D4', bakery:'TRUE' },
  { symbol: 'NYB',  address: '0x03910a6B6ca498aBce970c0F4ca747194872f279', bakery:'TRUE' },
  { symbol: 'Nemo',  address: '0x01eb0bc650900BF49eaB65B160bACCCb3A497914', bakery:'TRUE' },
  { symbol: 'OCT',  address: '0x49277cC5be56b519901E561096bfD416277b4F6d', bakery:'TRUE' },
  { symbol: 'OIL',  address: '0xb1b17DFf66d75b29d34f0Bf8622c406D8219B507', bakery:'TRUE' },
  { symbol: 'OPERAND',  address: '0x7Cb2f28505E733F60C0db208AfaA321c792F6Cf4', bakery:'TRUE' },
  { symbol: 'OYU',  address: '0x24C8dBf49B822F4CF77738275e4749Aac541729E', bakery:'TRUE' },
  { symbol: 'PARROT',  address: '0xB9c0fd96a07FaEeE4c552f056cbe42073C8999e7', bakery:'TRUE' },
  { symbol: 'PAYB',  address: '0x916792fD41855914Ba4B71285C8A05B866f0618b', bakery:'TRUE' },
  { symbol: 'PBANK',  address: '0x627c99cFC6421224a99B88Cec08BA9894253779c', bakery:'TRUE' },
  { symbol: 'PBS',  address: '0x2EaE17386Ea67f0FA13485FA90851C03BDc5a7A9', bakery:'TRUE' },
  { symbol: 'PEAK',  address: '0x630d98424eFe0Ea27fB1b3Ab7741907DFFEaAd78', bakery:'TRUE' },
  { symbol: 'PET',  address: '0x4d4e595d643dc61EA7FCbF12e4b1AAA39f9975B8', bakery:'TRUE' },
  { symbol: 'PHO',  address: '0xb9784C1633ef3b839563B988c323798634714368', bakery:'TRUE' },
  { symbol: 'PIG',  address: '0x8850D2c68c632E3B258e612abAA8FadA7E6958E5', bakery:'TRUE' },
  { symbol: 'PKGB',  address: '0x89A851764A427f48c21c1557d94458267FE3d372', bakery:'TRUE' },
  { symbol: 'PLite',  address: '0x7f4C06b9D4861b04f29d341ABD796745ff16dA55', bakery:'TRUE' },
  { symbol: 'PNIX',  address: '0x3C54fB88e1e465e805e41cdc4717c73b9f6A8D19', bakery:'TRUE' },
  { symbol: 'POLIS',  address: '0xb5bEa8a26D587CF665f2d78f077CcA3C7f6341BD', bakery:'TRUE' },
  { symbol: 'POOCOIN',  address: '0xB27ADAfFB9fEa1801459a1a81B17218288c097cc', bakery:'TRUE' },
  { symbol: 'POODL',  address: '0x4a68C250486a116DC8D6A0C5B0677dE07cc09C5D', bakery:'TRUE' },
  { symbol: 'PROM',  address: '0xaF53d56ff99f1322515E54FdDE93FF8b3b7DAFd5', bakery:'TRUE' },
  { symbol: 'PROPEL',  address: '0x9B44Df3318972bE845d83f961735609137C4C23c', bakery:'TRUE' },
  { symbol: 'PROT',  address: '0x190e450e0345FaD4C2999461760c079bfD2F3501', bakery:'TRUE' },
  { symbol: 'PXL',  address: '0x5B2b5BD1e5C53870fE135Fb7b289D686f762858d', bakery:'TRUE' },
  { symbol: 'QND',  address: '0x3dd74E198F641B0b556680417E08e25228E47D41', bakery:'TRUE' },
  { symbol: 'RELX',  address: '0x1430C804B8309FB38Aa4f6e953c2178c7fc62e34', bakery:'TRUE' },
  { symbol: 'RICK',  address: '0x9751afB4C102CCE9C2bE87FC4dEC238Be7fc625a', bakery:'TRUE' },
  { symbol: 'RPG',  address: '0xb853d8ff87fca78207e21Acd6A94362251f208dA', bakery:'TRUE' },
  { symbol: 'RSTAR',  address: '0x9ACCCad365562970EAedF8219D134902c97Ee6B4', bakery:'TRUE' },
  { symbol: 'RTF',  address: '0xb4A92eDAb7c9Ba94b6637E8052D8bd133EC4221C', bakery:'TRUE' },
  { symbol: 'RUN',  address: '0x31e5b96e5D4190bCb5245CBa71736736b5Ab060a', bakery:'TRUE' },
  { symbol: 'SACT',  address: '0x1bA8c21c623C843Cd4c60438d70E7Ad50f363fbb', bakery:'TRUE' },
  { symbol: 'SAFEBTC',  address: '0x380624A4a7e69dB1cA07deEcF764025FC224D056', bakery:'TRUE' },
  { symbol: 'SAFEMOON',  address: '0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3', bakery:'TRUE' },
  { symbol: 'SAFEOP',  address: '0x828612167Ffe9b5d0aCC0448FE1B27da51839707', bakery:'TRUE' },
  { symbol: 'SAFEROCKET',  address: '0x81DC275f32F2Abd9eb498749B7A833f286e2d516', bakery:'TRUE' },
  { symbol: 'SAFR',  address: '0x0ba3870E67650dcbB42A616A989ffa9249d937d5', bakery:'TRUE' },
  { symbol: 'SAFU',  address: '0x654456F62510EaBf663515f5b7df93b096BB7042', bakery:'TRUE' },
  { symbol: 'SANTA',  address: '0xBaD8571d81Ee4C459cA98494cd4A07367E10072F', bakery:'TRUE' },
  { symbol: 'SFB',  address: '0x4855a6F6ec544804e51392E563591BCC2F870705', bakery:'TRUE' },
  { symbol: 'SFD',  address: '0x9C440cAC3368f79C5d2488D5036b6943999FE3FB', bakery:'TRUE' },
  { symbol: 'SFUND',  address: '0x477bC8d23c634C154061869478bce96BE6045D12', bakery:'TRUE' },
  { symbol: 'SHIELD',  address: '0x60b3BC37593853c04410c4F07fE4D6748245BF77', bakery:'TRUE' },
  { symbol: 'SHWA',  address: '0x3076A2179A142c2b71b4B408943264d39244eb69', bakery:'TRUE' },
  { symbol: 'SNEED',  address: '0x51CA0B3Aefa6fDB2575b70D9ACcb42B30060f4a0', bakery:'TRUE' },
  { symbol: 'SOCCER',  address: '0x338d44d19c8d45ed9771b8D2B95D988F0e42187F', bakery:'TRUE' },
  { symbol: 'STONK',  address: '0x8EFb12D656F112725A06abAdbe3AcA0ADEDCb4EB', bakery:'TRUE' },
  { symbol: 'SUPER',  address: '0x51BA0b044d96C3aBfcA52B64D733603CCC4F0d4D', bakery:'TRUE' },
  { symbol: 'SWAMP',  address: '0xA520d7177BF0717bAa98c87c55bD834C55fe27a2', bakery:'TRUE' },
  { symbol: 'SWAT',  address: '0x82e7Eb8f4c307F2dcf522fDCA7b7038296584f29', bakery:'TRUE' },
  { symbol: 'SYRUP',  address: '0x009cF7bC57584b7998236eff51b98A168DceA9B0', bakery:'TRUE' },
  { symbol: 'Shield Finance',  address: '0x5A054554b3F0C75063D29250984A921402E1E3a7', bakery:'TRUE' },
  { symbol: 'TBAKE',  address: '0x26D6e280F9687c463420908740AE59f712419147', bakery:'TRUE' },
  { symbol: 'TCORE',  address: '0x40318becc7106364D6C41981956423a7058b7455', bakery:'TRUE' },
  { symbol: 'TDG',  address: '0x80Dd27d8C389b1cb44FF366e048B0214d7519dc9', bakery:'TRUE' },
  { symbol: 'TEDDY',  address: '0x271617ca107c3Bc6d844750276a08bFBBfEf75Fa', bakery:'TRUE' },
  { symbol: 'TIGS',  address: '0x017A6d12Ca6e591d684e63791fD2de1e8A550169', bakery:'TRUE' },
  { symbol: 'TKO',  address: '0x9f589e3eabe42ebC94A44727b3f3531C0c877809', bakery:'TRUE' },
  { symbol: 'TLM',  address: '0x2222227E22102Fe3322098e4CBfE18cFebD57c95', bakery:'TRUE' },
  { symbol: 'TOGE',  address: '0x3ad28Eb2e0970F7b925a2E242EE0aAa99f55a6C3', bakery:'TRUE' },
  { symbol: 'TOK',  address: '0xB20C3C3F44b2AF0ee93Ab5Ebddb32AcCa0Fe04a2', bakery:'TRUE' },
  { symbol: 'TRDG',  address: '0x92a42Db88Ed0F02c71D439e55962Ca7CAB0168b5', bakery:'TRUE' },
  { symbol: 'TRFXB',  address: '0x03834C0917258A43Fa8ed19bd8fD9e0dE47fB197', bakery:'TRUE' },
  { symbol: 'TRIAS',  address: '0x53aa17B90F15265c0F007e7d1c30ED31Bd763f64', bakery:'TRUE' },
  { symbol: 'TSA',  address: '0x5f99ACF13CAff815DD9cB4A415c0fB34e9F4545b', bakery:'TRUE' },
  { symbol: 'TSUKI',  address: '0x3Fd9e7041C45622e8026199A46f763C9807f66f3', bakery:'TRUE' },
  { symbol: 'TUNA',  address: '0x40929FB2008c830731A3d972950bC13f70161c75', bakery:'TRUE' },
  { symbol: 'TWT',  address: '0x4B0F1812e5Df2A09796481Ff14017e6005508003', bakery:'TRUE' },
  { symbol: 'Teddy',  address: '0x9b1e2709f860d5EF736FCb6c79697F8140237eDc', bakery:'TRUE' },
  { symbol: 'USDC',  address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', bakery:'TRUE' },
  { symbol: 'USDT',  address: '0x55d398326f99059fF775485246999027B3197955', bakery:'TRUE' },
  { symbol: 'VLAD',  address: '0x279d41f3f78fe5C1f0BA41aE963d6E545113C973', bakery:'TRUE' },
  { symbol: 'VSION',  address: '0xba4Ce0070deEf6703e1b47bFDe36f41Ade70df2D', bakery:'TRUE' },
  { symbol: 'WAR',  address: '0x42dbD44a8883D4363B395F77547812DC7dB806d5', bakery:'TRUE' },
  { symbol: 'WATCH',  address: '0x7A9f28EB62C791422Aa23CeAE1dA9C847cBeC9b0', bakery:'TRUE' },
  { symbol: 'WBBK',  address: '0x9045B0eda6B6A556cf9B3d81C2db47411714f847', bakery:'TRUE' },
  { symbol: 'WEAPON',  address: '0x3664d30A612824617e3Cf6935d6c762c8B476eDA', bakery:'TRUE' },
  { symbol: 'WEX',  address: '0xa9c41A46a6B3531d28d5c32F6633dd2fF05dFB90', bakery:'TRUE' },
  { symbol: 'WHALE',  address: '0x67c3a528C13d5b03fc5d4f847fcc8F290Dd276b7', bakery:'TRUE' },
  { symbol: 'WHIRL',  address: '0x7f479d78380Ad00341fdD7322fE8AEf766e29e5A', bakery:'TRUE' },
  { symbol: 'WILLIE',  address: '0x27327672D1dc51F4Dc58c9F413E1FA7e7ad8245e', bakery:'TRUE' },
  { symbol: 'WMUE',  address: '0x00abaA93fAF8fDc4f382135a7A56F9Cf7C3EdD21', bakery:'TRUE' },
  { symbol: 'WNYC',  address: '0x6c015277B0f9b8c24B20BD8BbbD29FDb25738A69', bakery:'TRUE' },
  { symbol: 'WOOL',  address: '0x02E3eFcc9d912fbf2bf33D39F43427b56512C9B4', bakery:'TRUE' },
  { symbol: 'WOONKLY',  address: '0x3Eb5713CBFa8e30cF9a0EF2c3F1372E450242b58', bakery:'TRUE' },
  { symbol: 'WSA',  address: '0x53b3bE80206DFC1E82389ebE656aF2e6f81c6BE6', bakery:'TRUE' },
  { symbol: 'WZCR',  address: '0x1F01Dc57C66C2f87D8eab9C625D335e9defE6912', bakery:'TRUE' },
  { symbol: 'WoW',  address: '0x2DD337F94A36449C6e5fD4f523Ce2e55A5Ad1008', bakery:'TRUE' },
  { symbol: 'XBN',  address: '0x547CBE0f0c25085e7015Aa6939b28402EB0CcDAC', bakery:'TRUE' },
  { symbol: 'XDITTO',  address: '0xB0a1DE764A033A76f28E821fBe402EDBFEe937dB', bakery:'TRUE' },
  { symbol: 'YAL',  address: '0x8431C096076F16F67199D971470f9E25fEb91F4b', bakery:'TRUE' },
  { symbol: 'YFBK',  address: '0x2fF3f078DDd0C13Fd55bB45418730995Bfb6e908', bakery:'TRUE' },
  { symbol: 'YMF',  address: '0x2280908dCbF7d63098164162dF5eFc3A8C929aEa', bakery:'TRUE' },
  { symbol: 'bATD',  address: '0x280a8f9FC9bCd8c17E5b60Ae87EEdFDf639F10B6', bakery:'TRUE' },
  { symbol: 'blink',  address: '0x63870A18B6e42b01Ef1Ad8A2302ef50B7132054F', bakery:'TRUE' },
  { symbol: 'opfi',  address: '0xA06f1Dee3046ff6ACB3EE1B701EF95C8dC9b7279', bakery:'TRUE' },
  { symbol: 'test',  address: '0x564158C32c99c846286944862104297F1A36776e', bakery:'TRUE' },
  { symbol: 'upBNB',  address: '0x9C3Bbff333F4AEAB60B3c060607b7C505Ff30C82', bakery:'TRUE' },
  { symbol: 'wSOTE',  address: '0x541E619858737031A1244A5d0Cd47E5ef480342c', bakery:'TRUE' },
  { symbol: 'yPANDA',  address: '0x9806aec346064183b5cE441313231DFf89811f7A', bakery:'TRUE' },
{ symbol: 'MTV',   address:  '0x8aa688AB789d1848d131C65D98CEAA8875D97eF1',burger:'TRUE' },
{ symbol: 'BHC',   address:  '0x6fd7c98458a943f469E1Cf4eA85B173f5Cd342F4',burger:'TRUE' },
{ symbol: 'FISH',   address:  '0x8fFe38Cd2aE77B1ABF2ba50c6D97319613621715',burger:'TRUE' },
{ symbol: 'xBURGER',   address:  '0xAFE24E29Da7E9b3e8a25c9478376B6AD6AD788dD',burger:'TRUE' },
{ symbol: 'ATD',   address:  '0x6B3AF2080864daa44ec2841706747f759f32f676',burger:'TRUE' },
{ symbol: 'MGA',   address:  '0x2f9c1e720A8892B7cCf74d02309178F65cBc4888',burger:'TRUE' },
{ symbol: 'JDI',   address:  '0x0491648C910ad2c1aFaab733faF71D30313Df7FC',burger:'TRUE' },
{ symbol: 'brDAO',   address:  '0x0fd161F2AA52Bc2B7b04Ddd6001610D84b8De726',burger:'TRUE' },
{ symbol: 'YAL',   address:  '0x8431C096076F16F67199D971470f9E25fEb91F4b',burger:'TRUE' },
{ symbol: 'MBOX',   address:  '0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377',burger:'TRUE' },
{ symbol: 'ROCKS',   address:  '0xA01000C52b234a92563BA61e5649b7C76E1ba0f3',burger:'TRUE' },
{ symbol: 'bTRS',   address:  '0x2F95985348018a72b7DB6d0401E0A6535d370A39',burger:'TRUE' },
{ symbol: 'bTBB',   address:  '0xB1aC5dAC9099fDA18390901371Ce03c5eC637C89',burger:'TRUE' },
{ symbol: 'bFREDX',   address:  '0x321614Eb36245bf2e2F2e58bADAAAaD1475e1026',burger:'TRUE' },
{ symbol: 'POGE',   address:  '0xb24D6eEa5F545Ed2F0cE65f53c74b9CB0b3771f8',burger:'TRUE' },
{ symbol: 'AIRx',   address:  '0x6Fb05b156788E88c8ad1e057e729362ff8c39d93',burger:'TRUE' },
{ symbol: 'RICK',   address:  '0x9751afB4C102CCE9C2bE87FC4dEC238Be7fc625a',burger:'TRUE' },
{ symbol: 'POLIS',   address:  '0xb5bEa8a26D587CF665f2d78f077CcA3C7f6341BD',burger:'TRUE' },
{ symbol: 'SNEED',   address:  '0x51CA0B3Aefa6fDB2575b70D9ACcb42B30060f4a0',burger:'TRUE' },
{ symbol: 'bMIXS',   address:  '0x7f98ae8eD806713175d13d26386B34fa75db8893',burger:'TRUE' },
{ symbol: 'INKS',   address:  '0xb228967d7C4b993772f0b4443ABF46FFB1C1b918',burger:'TRUE' },
{ symbol: 'bVLO',   address:  '0xa1390b8ADeD286ce33AC8300919A18992744FA51',burger:'TRUE' },
{ symbol: 'IEON',   address:  '0x64ac4023A7c9a4987A75420295f68a5435484Dd1',burger:'TRUE' },
{ symbol: 'ERC20',   address:  '0x58730ae0FAA10d73b0cDdb5e7b87C3594f7a20CB',burger:'TRUE' },
{ symbol: 'bWAIF',   address:  '0x86cd933Da7b51DDC859497C15D6560a68c611Cf9',burger:'TRUE' },
{ symbol: 'DARUMA',   address:  '0x1d9984B2b493be23A7d572BC77Ef6A8da1DA85EE',burger:'TRUE' },
{ symbol: 'SATT',   address:  '0x448BEE2d93Be708b54eE6353A7CC35C4933F1156',burger:'TRUE' },
{ symbol: 'LMT',   address:  '0x786d423a798Df8B2b5cABD73eE9A9eEf1eECe68C',burger:'TRUE' },
{ symbol: 'AGN',   address:  '0x48Dbfac1f0D23A12C2E0DeC4a037601D7980a9E4',burger:'TRUE' },
{ symbol: 'DXW',   address:  '0x89675DcCFE0c19bca178A0E0384Bd8E273a45cbA',burger:'TRUE' },
{ symbol: 'FVF',   address:  '0x74a9AF33F413dba56caAdCd96fEd2CD539FCeda0',burger:'TRUE' },
{ symbol: 'DEL',   address:  '0xaFFD46849A8317501A595E702DCD5C3E21638E17',burger:'TRUE' },
{ symbol: 'bBITTO',   address:  '0x816e9e589F8C07149dA4E2496C547952338B27e2',burger:'TRUE' },
{ symbol: 'bIMTY',   address:  '0x5Aaf9ddd8AeEC564AAaa0F76B8E5f2B2B1a6d295',burger:'TRUE' },
{ symbol: 'MOMO',   address:  '0x269266bA03F563D4Ef0e93F2A8DB06e13cD80550',burger:'TRUE' },
{ symbol: 'PKGB',   address:  '0x89A851764A427f48c21c1557d94458267FE3d372',burger:'TRUE' },
{ symbol: 'bCAPC',   address:  '0x25561f452C49c68A25c4E330763c1F00EcaFe3d4',burger:'TRUE' },
{ symbol: 'DUCK',   address:  '0xb8E611ef184F9e30D5e095746b9ad85ae018B37A',burger:'TRUE' },
{ symbol: 'BAT',   address:  '0x101d82428437127bF1608F699CD651e6Abf9766E',burger:'TRUE' },
{ symbol: 'bDFSocial',   address:  '0x75de745a333a47Fe786e8DbBf3E9440d3d5Bc809',burger:'TRUE' },
{ symbol: 'PHO',   address:  '0xb9784C1633ef3b839563B988c323798634714368',burger:'TRUE' },
{ symbol: 'VSION',   address:  '0xba4Ce0070deEf6703e1b47bFDe36f41Ade70df2D',burger:'TRUE' },
{ symbol: 'HSWAP',   address:  '0x5D52406799F18eB2BBA01a2380D6AD8cC08ab093',burger:'TRUE' },
{ symbol: 'HLB',   address:  '0x1350a6DCbE53D8F40CEf9a649cC6221Ca16d0816',burger:'TRUE' },
{ symbol: 'HBANK',   address:  '0xBB03b7c6c291739c0856b36377adB75AeB143600',burger:'TRUE' },
{ symbol: 'bHGET',   address:  '0x8181a59fA31cb16D3F3145365E4C294BbB781251',burger:'TRUE' },
{ symbol: 'CLBK',   address:  '0x5845FCe0577FefE869b53E143d3014b3D2bE406C',burger:'TRUE' },
{ symbol: 'WZCR',   address:  '0x1F01Dc57C66C2f87D8eab9C625D335e9defE6912',burger:'TRUE' },
{ symbol: 'bWHF',   address:  '0x188B038EAAfa14F9883C86Cc8BAdB7A457A561eC',burger:'TRUE' },
{ symbol: 'PBS',   address:  '0x2EaE17386Ea67f0FA13485FA90851C03BDc5a7A9',burger:'TRUE' },
{ symbol: 'AMPT',   address:  '0x5eD4C7634A7B3d175a5aF4D14278beE12688b837',burger:'TRUE' },
{ symbol: 'TWT',   address:  '0x4B0F1812e5Df2A09796481Ff14017e6005508003',burger:'TRUE' },
{ symbol: 'BETH',   address:  '0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B',burger:'TRUE' },
{ symbol: 'WMUE',   address:  '0x00abaA93fAF8fDc4f382135a7A56F9Cf7C3EdD21',burger:'TRUE' },
{ symbol: 'QUSD',   address:  '0xb8C540d00dd0Bf76ea12E4B4B95eFC90804f924E',burger:'TRUE' },
{ symbol: 'ZUMD',   address:  '0xb8aa1ac7ebe9D2a00340FcD48269fadA698b9314',burger:'TRUE' },
{ symbol: 'bALBT',   address:  '0x72fAa679E1008Ad8382959FF48E392042A8b06f7',burger:'TRUE' },
{ symbol: 'CYFM',   address:  '0x9001fD53504F7Bf253296cfFAdF5b6030CD61abb',burger:'TRUE' },
{ symbol: 'SANTA',   address:  '0xBaD8571d81Ee4C459cA98494cd4A07367E10072F',burger:'TRUE' },
{ symbol: 'YFIG',   address:  '0x115C6Aa68A1bFa7e8B00b31C137105925E767233',burger:'TRUE' },
{ symbol: 'BFI',   address:  '0x81859801b01764D4f0Fa5E64729f5a6C3b91435b',burger:'TRUE' },
{ symbol: 'MER',   address:  '0x6877b56E376C55D93f6A5A510FDA2Be39C5E21a7',burger:'TRUE' },
{ symbol: 'DSWAP',   address:  '0x8b22b70A44dc17316B96a6C3FCa3C5e4Fc80AaF1',burger:'TRUE' },
{ symbol: 'FOR',   address:  '0xa4C8e834654262B8460Eb45Ff859C3dFb5e1D108',burger:'TRUE' },
{ symbol: 'gwUSDN',   address:  '0x72d273faaC4f851cC6534FA37572b6fFffE29fbb',burger:'TRUE' },
{ symbol: 'DANGO',   address:  '0x0957C57C9EB7744850dCC95db5A06eD4a246236E',burger:'TRUE' },
{ symbol: 'bUSDT',   address:  '0x47a7CfF90c0aA865AA56CbeB4c71be0a27ec9f63',burger:'TRUE' },
{ symbol: 'SYRUP',   address:  '0x009cF7bC57584b7998236eff51b98A168DceA9B0',burger:'TRUE' },
{ symbol: 'BSC',   address:  '0x17bc015607Fdf93e7C949e9Ca22f96907cFBeF88',burger:'TRUE' },
{ symbol: 'SHLIAPA',   address:  '0x32BBE16775B98a1a474269ff5b8993e73d793BB7',burger:'TRUE' },
{ symbol: 'FIL',   address:  '0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153',burger:'TRUE' },
{ symbol: '7UP',   address:  '0x29f350B3822F51dc29619C583AdBC9628646E315',burger:'TRUE' },
{ symbol: 'DEGO',   address:  '0x3FdA9383A84C05eC8f7630Fe10AdF1fAC13241CC',burger:'TRUE' },
{ symbol: 'bGL',   address:  '0x4e5A337D646323df39EECaF44454A88E9EFA14Da',burger:'TRUE' },
{ symbol: 'STR',   address:  '0x17028c42a8BB4011f28e975c520A72A0e939Eee1',burger:'TRUE' },
{ symbol: 'bATD',   address:  '0x280a8f9FC9bCd8c17E5b60Ae87EEdFDf639F10B6',burger:'TRUE' },
{ symbol: 'JNTR/b',   address:  '0x78e1936f065Fd4082387622878C7d11c9f05ECF4',burger:'TRUE' },
{ symbol: 'CRP',   address:  '0x1Ad8D89074AFA789A027B9a31d0bd14e254711D0',burger:'TRUE' },
{ symbol: 'GTEX',   address:  '0x2B75d3A5865874c9b356A1d6021fd48E2A576811',burger:'TRUE' },
{ symbol: 'CZ',   address:  '0xa65857c56485C0Cc798d511f99E332b75223335D',burger:'TRUE' },
{ symbol: 'FRIES',   address:  '0x393B312C01048b3ed2720bF1B090084C09e408A1',burger:'TRUE' },
{ symbol: 'FREE',   address:  '0x12e34cDf6A031a10FE241864c32fB03a4FDaD739',burger:'TRUE' },
{ symbol: 'STM',   address:  '0x90DF11a8ccE420675e73922419e3f4f3Fe13CCCb',burger:'TRUE' },
{ symbol: 'PROPEL',   address:  '0x9B44Df3318972bE845d83f961735609137C4C23c',burger:'TRUE' },
{ symbol: 'DICE',   address:  '0x748AD98b14C814B28812eB42ad219C8672909879',burger:'TRUE' },
{ symbol: 'Cake',   address:  '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',burger:'TRUE' },
{ symbol: 'bWETH',   address:  '0x8d0e18c97e5Dd8Ee2B539ae8cD3a3654DF5d79E5',burger:'TRUE' },
{ symbol: 'JULb',   address:  '0x32dFFc3fE8E3EF3571bF8a72c0d0015C5373f41D',burger:'TRUE' },
{ symbol: 'BOT',   address:  '0x48DC0190dF5ece990c649A7A07bA19D3650a9572',burger:'TRUE' },
{ symbol: 'WTF',   address:  '0xA297B465DF39477DA6E799A397aE809C25E2412C',burger:'TRUE' },
{ symbol: 'TUNA',   address:  '0x40929FB2008c830731A3d972950bC13f70161c75',burger:'TRUE' },
{ symbol: 'CAN',   address:  '0x007EA5C0Ea75a8DF45D288a4debdD5bb633F9e56',burger:'TRUE' },
{ symbol: 'BCH',   address:  '0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf',burger:'TRUE' },
{ symbol: 'BHC',   address:  '0xA6381C6Fd8f40A44721eF4f61eDc1a8CCCa7BF3d',burger:'TRUE' },
{ symbol: 'BFI',   address:  '0xAFa4f3D72f0803B50C99663B3E90806d9D290770',burger:'TRUE' },
{ symbol: 'EOS',   address:  '0x56b6fB708fC5732DEC1Afc8D8556423A2EDcCbD6',burger:'TRUE' },
{ symbol: 'TOK',   address:  '0xB20C3C3F44b2AF0ee93Ab5Ebddb32AcCa0Fe04a2',burger:'TRUE' },
{ symbol: 'DOT',   address:  '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',burger:'TRUE' },
{ symbol: 'XRP',   address:  '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE',burger:'TRUE' },
{ symbol: 'FOR',   address:  '0x658A109C5900BC6d2357c87549B651670E5b0539',burger:'TRUE' },
{ symbol: 'PROM',   address:  '0xaF53d56ff99f1322515E54FdDE93FF8b3b7DAFd5',burger:'TRUE' },
{ symbol: 'XTZ',   address:  '0x16939ef78684453bfDFb47825F8a5F714f12623a',burger:'TRUE' },
{ symbol: 'ADA',   address:  '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',burger:'TRUE' },
{ symbol: 'DEFI',   address:  '0x82D6aC355B178884E6aafdEAA6B5e1175D57Fce6',burger:'TRUE' },
{ symbol: 'DAI',   address:  '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',burger:'TRUE' },
{ symbol: 'MILK',   address:  '0x8E9f5173e16Ff93F81579d73A7f9723324d6B6aF',burger:'TRUE' },
{ symbol: 'LTC',   address:  '0x4338665CBB7B2485A8855A139b75D5e34AB0DB94',burger:'TRUE' },
{ symbol: 'USDT',   address:  '0x55d398326f99059fF775485246999027B3197955',burger:'TRUE' },
{ symbol: 'BTCB',   address:  '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',burger:'TRUE' },
{ symbol: 'BAND',   address:  '0xAD6cAEb32CD2c308980a548bD0Bc5AA4306c6c18',burger:'TRUE' },
{ symbol: 'ETH',   address:  '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',burger:'TRUE' },
{ symbol: 'COCO',   address:  '0x2D0C83E27B38C7CA3AAeb8306ba84FDc1Bb673d0',burger:'TRUE' },
{ symbol: 'BURGER',   address:  '0xAe9269f27437f0fcBC232d39Ec814844a51d6b8f',burger:'TRUE' },
]
const sushi_pairArray =[]
const pancake_pairArray = []
const combined_Array = []
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
const web3_binance = new Web3('https://bsc-dataseed1.binance.org:443');

const PANCAKESWAP_FACTORY_ADDRESS = '0xbcfccbde45ce874adcb698cc183debcf17952812'
const pancakeFactoryContract = new web3_binance.eth.Contract(PANCAKESWAP_FACTORY_ABI, PANCAKESWAP_FACTORY_ADDRESS)
const PANCAKESWAP_ROUTER_ADDRESS = '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'
const pancakeRouterContract = new web3_binance.eth.Contract(PANCAKESWAP_ROUTER_ABI, PANCAKESWAP_ROUTER_ADDRESS)

const BURGERSWAP_FACTORY_ADDRESS = '0x8a1E9d3aEbBBd5bA2A64d3355A48dD5E9b511256'
const burgerFactoryContract = new web3_binance.eth.Contract(BURGERSWAP_FACTORY_ABI, BURGERSWAP_FACTORY_ADDRESS)
const BURGERSWAP_ROUTER_ADDRESS = '0xBf6527834dBB89cdC97A79FCD62E6c08B19F8ec0'
const burgerRouterContract = new web3_binance.eth.Contract(BURGERSWAP_ROUTER_ABI, BURGERSWAP_ROUTER_ADDRESS)

const BAKERYSWAP_FACTORY_ADDRESS = '0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7'
const bakeryFactoryContract = new web3_binance.eth.Contract(BAKERYSWAP_FACTORY_ABI, BAKERYSWAP_FACTORY_ADDRESS)
const BAKERYSWAP_ROUTER_ADDRESS = '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F'
const bakeryRouterContract = new web3_binance.eth.Contract(BAKERYSWAP_ROUTER_ABI, BAKERYSWAP_ROUTER_ADDRESS)

const JULSWAP_FACTORY_ADDRESS = '0x553990F2CBA90272390f62C5BDb1681fFc899675'
const julFactoryContract = new web3_binance.eth.Contract(JULSWAP_FACTORY_ABI,JULSWAP_FACTORY_ADDRESS)
const JULSWAP_ROUTER_ADDRESS = '0xbd67d157502A23309Db761c41965600c2Ec788b2'
const julRouterContract = new web3_binance.eth.Contract(JULSWAP_ROUTER_ABI, JULSWAP_ROUTER_ADDRESS)

const APESWAP_FACTORY_ADDRESS = '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6'
const apeFactoryContract = new web3_binance.eth.Contract(APESWAP_FACTORY_ABI,APESWAP_FACTORY_ADDRESS)
const APESWAP_ROUTER_ADDRESS = '0xc0788a3ad43d79aa53b09c2eacc313a787d1d607'
const apeRouterContract = new web3_binance.eth.Contract(APESWAP_ROUTER_ABI,APESWAP_ROUTER_ADDRESS)




async function getPairs(){
 let pairLength = await apeFactoryContract.methods.allPairsLength().call()
 for (let i = 1; i < pairLength; i++){
   let pair = await apeFactoryContract.methods.allPairs(pairLength-i).call()
   //check pair for liqudity
   let erc20TokenContract = new web3_binance.eth.Contract(ERC20_ABI,pair)
   let Token0 = await erc20TokenContract.methods.token0().call()
   let Token1 = await erc20TokenContract.methods.token1().call()
   let WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
   let erc20SymbolContract = new web3_binance.eth.Contract(ERC20_ABI, Token0)
   if(Token1.toString() ==='0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'){
   let BNBsupply = await erc20TokenContract.methods.getReserves().call()
   count = pairLength-i
   if(count ==73){}else{
    //console.log(count, BNBsupply[0],Token0,Token1)
   if(parseInt(BNBsupply[0]) > parseInt('10000000000000000000')){
   let symbol = await erc20SymbolContract.methods.symbol().call()
   let pancake_commonPair = await pancakeFactoryContract.methods.getPair(Token0,'0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c').call()
   if(pancake_commonPair == '0x0000000000000000000000000000000000000000'){
   //console.log('No pancake pair for', count, pair)
 }
   else{
     console.log('{ symbol: ', symbol, '   address: ','*',Token0,' }')
 }
}
}

}
}
 /*
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
    */
//})


}

getPairs()

async function pairfile(arr){
await fs.writeFileSync('./abis/erc20/pairs.txt', arr.join('\n'));
}
