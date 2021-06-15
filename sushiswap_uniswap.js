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
let slippage = .95 // Returns at least 97% of what is expected
let ethPrice
let currentgasPrice
let priceMonitor
let monitoringPrice = false
let pairs_priceMonitor
let pairs_monitoringPrice = false
const pairs = [
 { symbol: '$DG', address: '0xEE06A81a695750E71a662B51066F2c74CF4478a0'},
 { symbol: '$ROPE', address: '0x9D47894f8BECB68B9cF3428d256311Affe8B068B'},
 { symbol: '$TRDL', address: '0x297D33e17e61C2Ddd812389C2105193f8348188a'},
 { symbol: '1INCH', address: '0x111111111117dC0aa78b770fA6A738034120C302'},
 { symbol: '1ONE', address: '0xD5cd84D6f044AbE314Ee7E414d37cae8773ef9D3'},
 { symbol: '2KEY', address: '0xE48972fCd82a274411c01834e2f031D4377Fa2c0'},
 { symbol: 'AAVE', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'},
 { symbol: 'ADX', address: '0xADE00C28244d5CE17D72E40330B1c318cD12B7c3'},
 { symbol: 'AERGO', address: '0x91Af0fBB28ABA7E31403Cb457106Ce79397FD4E6'},
 { symbol: 'AKRO', address: '0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7'},
 { symbol: 'ALCX', address: '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF'},
 { symbol: 'ALEPH', address: '0x27702a26126e0B3702af63Ee09aC4d1A084EF628'},
 { symbol: 'ALPA', address: '0x7cA4408137eb639570F8E647d9bD7B7E8717514A'},
 { symbol: 'ALPHA', address: '0xa1faa113cbE53436Df28FF0aEe54275c13B40975'},
 { symbol: 'AMP', address: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2'},
 { symbol: 'ANKR', address: '0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4'},
 { symbol: 'ANT', address: '0xa117000000f279D81A1D3cc75430fAA017FA5A2e'},
 { symbol: 'ANY', address: '0xf99d58e463A2E07e5692127302C20A191861b4D6'},
 { symbol: 'API3', address: '0x0b38210ea11411557c13457D4dA7dC6ea731B88a'},
 { symbol: 'ARCH', address: '0x1F3f9D3068568F8040775be2e8C03C103C61f3aF'},
 { symbol: 'ARIA20', address: '0xeDF6568618A00C6F0908Bf7758A16F76B6E04aF9'},
 { symbol: 'ARMOR', address: '0x1337DEF16F9B486fAEd0293eb623Dc8395dFE46a'},
 { symbol: 'ART', address: '0xfec0cF7fE078a500abf15F1284958F22049c2C7e'},
 { symbol: 'ASTRO', address: '0xcbd55D4fFc43467142761A764763652b48b969ff'},
 { symbol: 'AUC', address: '0xc12d099be31567add4e4e4d0D45691C3F58f5663'},
 { symbol: 'AVINOC', address: '0xF1cA9cb74685755965c7458528A36934Df52A3EF'},
 { symbol: 'AXS', address: '0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b'},
 { symbol: 'AXS', address: '0xF5D669627376EBd411E34b98F19C868c8ABA5ADA'},
 { symbol: 'BAC', address: '0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a'},
 { symbol: 'BAND', address: '0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55'},
 { symbol: 'BANK', address: '0x24A6A37576377F63f194Caa5F518a60f45b42921'},
 { symbol: 'BANK', address: '0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198'},
 { symbol: 'BAO', address: '0x374CB8C27130E2c9E04F44303f3c8351B9De61C1'},
 { symbol: 'BASE', address: '0x07150e919B4De5fD6a63DE1F9384828396f25fDC'},
 { symbol: 'BAT', address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF'},
 { symbol: 'BEL', address: '0xA91ac63D040dEB1b7A5E4d4134aD23eb0ba07e14'},
 { symbol: 'BLO', address: '0x68481f2c02BE3786987ac2bC3327171C5D05F9Bd'},
 { symbol: 'BLT', address: '0x107c4504cd79C5d2696Ea0030a8dD4e92601B82e'},
 { symbol: 'BOBA', address: '0xce9aFAF5b0dA6cE0366aB40435A48ccff65d2ED7'},
 { symbol: 'BOND', address: '0x0391D2021f89DC339F60Fff84546EA23E337750f'},
 { symbol: 'BOND', address: '0x5Dc02Ea99285E17656b8350722694c35154DB1E8'},
 { symbol: 'BOR', address: '0x3c9d6c1C73b31c837832c72E04D3152f051fc1A9'},
 { symbol: 'BPRO', address: '0xbbBBBBB5AA847A2003fbC6b5C16DF0Bd1E725f61'},
 { symbol: 'BTY', address: '0xe8679fe133f38f19e1cFFEBA98a4BAA5c897Ce51'},
 { symbol: 'BZRX', address: '0x56d811088235F11C8920698a204A5010a788f4b3'},
 { symbol: 'Bone', address: '0x5C84bc60a796534bfeC3439Af0E6dB616A966335'},
 { symbol: 'CAVO', address: '0x24eA9c1cfD77A8DB3fB707F967309cF013CC1078'},
 { symbol: 'CFour', address: '0x52b0b8D859fB6a3ff9206f6957e9957a7eAb5505'},
 { symbol: 'CNFI', address: '0xEABB8996eA1662cAd2f7fB715127852cd3262Ae9'},
 { symbol: 'COIN', address: '0x87b008E57F640D94Ee44Fd893F0323AF933F9195'},
 { symbol: 'COL', address: '0xC76FB75950536d98FA62ea968E1D6B45ffea2A55'},
 { symbol: 'COMBO', address: '0xfFffFffF2ba8F66D4e51811C5190992176930278'},
 { symbol: 'COMP', address: '0xc00e94Cb662C3520282E6f5717214004A7f26888'},
 { symbol: 'COTI', address: '0xDDB3422497E61e13543BeA06989C0789117555c5'},
 { symbol: 'COVER', address: '0x4688a8b1F292FDaB17E9a90c8Bc379dC1DBd8713'},
 { symbol: 'COVER', address: '0x5D8d9F5b96f4438195BE9b99eee6118Ed4304286'},
 { symbol: 'CRD', address: '0xcAaa93712BDAc37f736C323C93D4D5fDEFCc31CC'},
 { symbol: 'CREAM', address: '0x2ba592F78dB6436527729929AAf6c908497cB200'},
 { symbol: 'CRV', address: '0xD533a949740bb3306d119CC777fa900bA034cd52'},
 { symbol: 'CTX', address: '0x321C2fE4446C7c963dc41Dd58879AF648838f98D'},
 { symbol: 'CVP', address: '0x38e4adB44ef08F22F5B5b76A8f0c2d0dCbE7DcA1'},
 { symbol: 'CZZ', address: '0x20bf12A7bdb6d7B84069fb3b939892A301C981d1'},
 { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F'},
 { symbol: 'DAO', address: '0x0f51bb10119727a7e5eA3538074fb341F56B09Ad'},
 { symbol: 'DEGEN', address: '0x126c121f99e1E211dF2e5f8De2d96Fa36647c855'},
 { symbol: 'DELTA rLP', address: '0xfcfC434ee5BfF924222e084a8876Eee74Ea7cfbA'},
 { symbol: 'DELTA', address: '0x9EA3b5b4EC044b70375236A281986106457b20EF'},
 { symbol: 'DEP', address: '0x1A3496C18d558bd9C6C8f609E1B129f67AB08163'},
 { symbol: 'DEV', address: '0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26'},
 { symbol: 'DEXTF', address: '0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0'},
 { symbol: 'DFD', address: '0x20c36f062a31865bED8a5B1e512D9a1A20AA333A'},
 { symbol: 'DFX', address: '0x888888435FDe8e7d4c54cAb67f206e4199454c60'},
 { symbol: 'DIA', address: '0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419'},
 { symbol: 'DNA', address: '0xef6344de1fcfC5F48c30234C16c1389e8CdC572C'},
 { symbol: 'DNT', address: '0x0AbdAce70D3790235af448C88547603b945604ea'},
 { symbol: 'DOGEBEAR', address: '0xF1d32952E2fbB1a91e620b0FD7fBC8a8879A47f3'},
 { symbol: 'DOGEGF', address: '0xfb130d93E49DcA13264344966A611dc79a456Bc5'},
 { symbol: 'DOGES', address: '0xb4FBed161bEbcb37afB1Cb4a6F7cA18b977cCB25'},
 { symbol: 'DOPL.', address: '0xCccB6460bC41A6Db9C830b8318F3557bAff0Dfd1'},
 { symbol: 'DOUGH', address: '0xad32A8e6220741182940c5aBF610bDE99E737b2D'},
 { symbol: 'DPI', address: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b'},
 { symbol: 'DRC', address: '0xb78B3320493a4EFaa1028130C5Ba26f0B6085Ef8'},
 { symbol: 'DSCPL', address: '0xdECE0F6864c1511369ae2c30B90Db9f5fe92832c'},
 { symbol: 'DSD', address: '0xBD2F0Cd039E0BFcf88901C98c0bFAc5ab27566e3'},
 { symbol: 'DUCK', address: '0x92E187a03B6CD19CB6AF293ba17F2745Fd2357D5'},
 { symbol: 'DUNG', address: '0xDADA00A9C23390112D08a1377cc59f7d03D9df55'},
 { symbol: 'DUSD', address: '0x5BC25f649fc4e26069dDF4cF4010F9f706c23831'},
 { symbol: 'DestroyElon', address: '0x4EEac9248CB9A2919899B9f834C8b25524E50d75'},
 { symbol: 'ECAM', address: '0xa67E83917b438E11A58f119A2Bd9cC5dAaB86041'},
 { symbol: 'ECZZ', address: '0x150BbCfF6b1B4D528b48f1A300585Dea0b6490B6'},
 { symbol: 'EGT', address: '0x2aA5cE395b00CC486159aDbDD97c55b535CF2cf9'},
 { symbol: 'ENJ', address: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c'},
 { symbol: 'ESD', address: '0x36F3FD68E7325a35EB768F1AedaAe9EA0689d723'},
 { symbol: 'ETHV', address: '0xEeEeeeeEe2aF8D0e1940679860398308e0eF24d6'},
 { symbol: 'ETM', address: '0xF3eb8B90C763b8B2B53E7819ac27eca8f94C8Ec2'},
 { symbol: 'FARM', address: '0xa0246c9032bC3A600820415aE600c6388619A14D'},
 { symbol: 'FCKS', address: '0xc6e2da4A9dBe3DFe5A0836B182e0a762A0F8ebd9'},
 { symbol: 'FNX', address: '0xeF9Cd7882c067686691B6fF49e650b43AFBBCC6B'},
 { symbol: 'FORCE', address: '0x2C31b10ca416b82Cec4c5E93c615ca851213d48D'},
 { symbol: 'FORTH', address: '0x77FbA179C79De5B7653F68b5039Af940AdA60ce0'},
 { symbol: 'FOUR', address: '0x4730fB1463A6F1F44AEB45F6c5c422427f37F4D0'},
 { symbol: 'FRONT', address: '0xf8C3527CC04340b208C854E985240c02F7B7793f'},
 { symbol: 'FTM', address: '0x4E15361FD6b4BB609Fa63C81A2be19d873717870'},
 { symbol: 'FTX Token', address: '0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9'},
 { symbol: 'FUSE', address: '0x970B9bB2C0444F5E81e9d0eFb84C8ccdcdcAf84d'},
 { symbol: 'FVT', address: '0x45080a6531d671DDFf20DB42f93792a489685e32'},
 { symbol: 'FXS', address: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0'},
 { symbol: 'GENE', address: '0xf6ec87DFE1Ed3a7256Cc0c38e3c8139103e9aF3b'},
 { symbol: 'GLM', address: '0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429'},
 { symbol: 'GMT', address: '0x7Ddc52c4De30e94Be3A6A0A2b259b2850f421989'},
 { symbol: 'GNO', address: '0x6810e776880C02933D47DB1b9fc05908e5386b96'},
 { symbol: 'GNYerc20', address: '0xb1f871Ae9462F1b2C6826E88A7827e76f86751d4'},
 { symbol: 'GOLDUCK', address: '0x378E8c47eb42cCE0dd9Cff48276a2aB73e9C254F'},
 { symbol: 'GOVI', address: '0xeEAA40B28A2d1b0B08f6f97bB1DD4B75316c6107'},
 { symbol: 'GRT', address: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7'},
 { symbol: 'GWEI', address: '0xBC5CeF436eADAcadfa8daFb63088F09F21dEa7E9'},
 { symbol: 'HEGIC', address: '0x584bC13c7D411c00c01A62e8019472dE68768430'},
 { symbol: 'HEZ', address: '0xEEF9f339514298C6A857EfCfC1A762aF84438dEE'},
 { symbol: 'HXRO', address: '0x4bD70556ae3F8a6eC6C4080A0C327B24325438f3'},
 { symbol: 'ICE', address: '0xf16e81dce15B08F326220742020379B855B87DF9'},
 { symbol: 'ICHI', address: '0x903bEF1736CDdf2A537176cf3C64579C3867A881'},
 { symbol: 'ID', address: '0xEBd9D99A3982d547C5Bb4DB7E3b1F9F14b67Eb83'},
 { symbol: 'IDLE', address: '0x875773784Af8135eA0ef43b5a374AaD105c5D39e'},
 { symbol: 'IDRT', address: '0x998FFE1E43fAcffb941dc337dD0468d52bA5b48A'},
 { symbol: 'ILV', address: '0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E'},
 { symbol: 'INDEX', address: '0x0954906da0Bf32d5479e25f46056d22f08464cab'},
 { symbol: 'INJ', address: '0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30'},
 { symbol: 'INV', address: '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68'},
 { symbol: 'JRT', address: '0x8A9C67fee641579dEbA04928c4BC45F66e26343A'},
 { symbol: 'KP3R', address: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44'},
 { symbol: 'L2', address: '0xBbff34E47E559ef680067a6B1c980639EEb64D24'},
 { symbol: 'LAGER', address: '0xC4376cFdaB7302c47155b8D40c0E1941aE662526'},
 { symbol: 'LCX', address: '0x037A54AaB062628C9Bbae1FDB1583c195585fe41'},
 { symbol: 'LDN', address: '0xb29663Aa4E2e81e425294193616c1B102B70a158'},
 { symbol: 'LDO', address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'},
 { symbol: 'LEND', address: '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03'},
 { symbol: 'LEV', address: '0xbc194e6f748a222754C3E8b9946922c09E7d4e91'},
 { symbol: 'LINA', address: '0x3E9BC21C9b189C09dF3eF1B824798658d5011937'},
 { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA'},
 { symbol: 'LON', address: '0x0000000000095413afC295d19EDeb1Ad7B71c952'},
 { symbol: 'LPT', address: '0x58b6A8A3302369DAEc383334672404Ee733aB239'},
 { symbol: 'LTE2', address: '0xf121848269B49B97B1EAbcFeceAdC5f701d20e80'},
 { symbol: 'LUNA', address: '0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9'},
 { symbol: 'MANA', address: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'},
 { symbol: 'MAPS', address: '0x2b915b505c017ABb1547aA5Ab355FbE69865cC6D'},
 { symbol: 'MASK', address: '0x0fe629d1E84E171f8fF0C1Ded2Cc2221Caa48a3f'},
 { symbol: 'MASQ', address: '0x06F3C323f0238c72BF35011071f2b5B7F43A054c'},
 { symbol: 'MATH', address: '0x08d967bb0134F2d07f7cfb6E246680c53927DD30'},
 { symbol: 'MATIC', address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'},
 { symbol: 'MIC', address: '0x368B3a58B5f49392e5C9E4C998cb0bB966752E51'},
 { symbol: 'MIR', address: '0x09a3EcAFa817268f77BE1283176B946C4ff2E608'},
 { symbol: 'MLN', address: '0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'},
 { symbol: 'MM', address: '0xa283aA7CfBB27EF0cfBcb2493dD9F4330E0fd304'},
 { symbol: 'MOVE', address: '0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C'},
 { symbol: 'MPH', address: '0x8888801aF4d980682e47f1A9036e589479e835C5'},
 { symbol: 'MTA', address: '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2'},
 { symbol: 'MUA', address: '0xD7F8032777C50aFD2e7AFa41912a4d8038127271'},
 { symbol: 'MUSH', address: '0xea6412Fb370e8d1605E6aEeAA21aD07C3C7e9F24'},
 { symbol: 'MUST', address: '0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f'},
 { symbol: 'MYFI', address: '0x1Efb2286BF89F01488C6B2a22B2556C0f45e972b'},
 { symbol: 'MYFI', address: '0x22FE5BcAdA4E30A7310eFB1DfF7f90168dC42b62'},
 { symbol: 'NAOS', address: '0x4a615bB7166210CCe20E6642a6f8Fb5d4D044496'},
 { symbol: 'NCT', address: '0x8A9c4dfe8b9D8962B31e4e16F8321C44d48e246E'},
 { symbol: 'NDX', address: '0x86772b1409b61c639EaAc9Ba0AcfBb6E238e5F83'},
 { symbol: 'NFTI', address: '0xe5feeaC09D36B18b3FA757E5Cf3F8dA6B8e27F4C'},
 { symbol: 'NFTX', address: '0x87d73E916D7057945c9BcD8cdd94e42A6F47f776'},
 { symbol: 'NU', address: '0x4fE83213D56308330EC302a8BD641f1d0113A4Cc'},
 { symbol: 'OCEAN', address: '0x967da4048cD07aB37855c090aAF366e4ce1b9F48'},
 { symbol: 'OGN', address: '0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26'},
 { symbol: 'OMG', address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07'},
 { symbol: 'ONX', address: '0xE0aD1806Fd3E7edF6FF52Fdb822432e847411033'},
 { symbol: 'OPIUM', address: '0x888888888889C00c67689029D7856AAC1065eC11'},
 { symbol: 'ORBS', address: '0xff56Cc6b1E6dEd347aA0B7676C85AB0B3D08B0FA'},
 { symbol: 'OSST', address: '0xdC57e9B624b931aa8202F3A8d54F09fa8ce7981F'},
 { symbol: 'OXY', address: '0x965697b4ef02F0DE01384D0d4F9F782B1670c163'},
 { symbol: 'PEAK', address: '0x630d98424eFe0Ea27fB1b3Ab7741907DFFEaAd78'},
 { symbol: 'PENDLE', address: '0x808507121B80c02388fAd14726482e061B8da827'},
 { symbol: 'PERP', address: '0xbC396689893D065F41bc2C6EcbeE5e0085233447'},
 { symbol: 'PIC', address: '0xF1A9e30FcF023145939D9C56e5c79440c99707b3'},
 { symbol: 'PICKLE', address: '0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5'},
 { symbol: 'PLR', address: '0xe3818504c1B32bF1557b16C238B2E01Fd3149C17'},
 { symbol: 'PMON', address: '0x1796ae0b0fa4862485106a0de9b654eFE301D0b2'},
 { symbol: 'PNK', address: '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d'},
 { symbol: 'POND', address: '0x57B946008913B82E4dF85f501cbAeD910e58D26C'},
 { symbol: 'POOL', address: '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e'},
 { symbol: 'POOLZ', address: '0xcc5CB920D39d4d43E68d373a4889Bb6d88ED2497'},
 { symbol: 'POWR', address: '0x595832F8FC6BF59c85C527fEC3740A1b7a361269'},
 { symbol: 'PREMIA', address: '0x6399C842dD2bE3dE30BF99Bc7D1bBF6Fa3650E70'},
 { symbol: 'PTF', address: '0xC57d533c50bC22247d49a368880fb49a1caA39F7'},
 { symbol: 'PUNK', address: '0x9cea2eD9e47059260C97d697f82b8A14EfA61EA5'},
 { symbol: 'RAC', address: '0xc22B30E4cce6b78aaaADae91E44E73593929a3e9'},
 { symbol: 'RARI', address: '0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF'},
 { symbol: 'RAY', address: '0x5245C0249e5EEB2A0838266800471Fd32Adb1089'},
 { symbol: 'RCN', address: '0xF970b8E36e23F7fC3FD752EeA86f8Be8D83375A6'},
 { symbol: 'REM', address: '0x83984d6142934bb535793A82ADB0a46EF0F66B6d'},
 { symbol: 'REN', address: '0x408e41876cCCDC0F92210600ef50372656052a38'},
 { symbol: 'REQ', address: '0x8f8221aFbB33998d8584A2B05749bA73c37a938a'},
 { symbol: 'REVV', address: '0x557B933a7C2c45672B610F8954A3deB39a51A8Ca'},
 { symbol: 'RGT', address: '0xD291E7a03283640FDc51b121aC401383A46cC623'},
 { symbol: 'RIO', address: '0xf21661D0D1d76d3ECb8e1B9F1c923DBfffAe4097'},
 { symbol: 'RLC', address: '0x607F4C5BB672230e8672085532f7e901544a7375'},
 { symbol: 'ROBO', address: '0x6FC2f1044A3b9bB3e43A43EC8F840843Ed753061'},
 { symbol: 'ROOK', address: '0xfA5047c9c78B8877af97BDcb85Db743fD7313d4a'},
 { symbol: 'ROOM', address: '0xAd4f86a25bbc20FfB751f2FAC312A0B4d8F88c64'},
 { symbol: 'RSR', address: '0x8762db106B2c2A0bccB3A80d1Ed41273552616E8'},
 { symbol: 'RUDA', address: '0xCe78AB22CD0331a52Af7Bb4b622edFa792819D47'},
 { symbol: 'RULER', address: '0x2aECCB42482cc64E087b6D2e5Da39f5A7A7001f8'},
 { symbol: 'RUNE', address: '0x3155BA85D5F96b2d030a4966AF206230e46849cb'},
 { symbol: 'SASHIMI', address: '0xC28E27870558cF22ADD83540d2126da2e4b464c2'},
 { symbol: 'SDT', address: '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'},
 { symbol: 'SEC', address: '0x9C061DF134d11412151E9c200ce3F9f6F295094a'},
 { symbol: 'SEED', address: '0x30cF203b48edaA42c3B4918E955fED26Cd012A3F'},
 { symbol: 'SEEN', address: '0xCa3FE04C7Ee111F0bbb02C328c699226aCf9Fd33'},
 { symbol: 'SFI', address: '0xb753428af26E81097e7fD17f40c88aaA3E04902c'},
 { symbol: 'SI', address: '0xD23Ac27148aF6A2f339BD82D0e3CFF380b5093de'},
 { symbol: 'SKL', address: '0x00c83aeCC790e8a4453e5dD3B0B4b3680501a7A7'},
 { symbol: 'SNX', address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F'},
 { symbol: 'SPANK', address: '0x42d6622deCe394b54999Fbd73D108123806f6a18'},
 { symbol: 'SRM', address: '0x476c5E26a75bd202a9683ffD34359C0CC15be0fF'},
 { symbol: 'STAKE', address: '0x0Ae055097C6d159879521C384F1D2123D1f195e6'},
 { symbol: 'SUPER', address: '0xe53EC727dbDEB9E2d5456c3be40cFF031AB40A55'},
 { symbol: 'SURF', address: '0xEa319e87Cf06203DAe107Dd8E5672175e3Ee976c'},
 { symbol: 'SUSHI', address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2'},
 { symbol: 'SWAG', address: '0x87eDfFDe3E14c7a66c9b9724747a1C5696b742e6'},
 { symbol: 'SX', address: '0x99fE3B1391503A1bC1788051347A1324bff41452'},
 { symbol: 'SYNC', address: '0xB6ff96B8A8d214544Ca0dBc9B33f7AD6503eFD32'},
 { symbol: 'TCAP', address: '0x16c52CeeCE2ed57dAd87319D91B5e3637d50aFa4'},
 { symbol: 'TORN', address: '0x77777FeDdddFfC19Ff86DB637967013e6C6A116C'},
 { symbol: 'TRU', address: '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784'},
 { symbol: 'TRU', address: '0xf65B5C5104c4faFD4b709d9D60a185eAE063276c'},
 { symbol: 'TST', address: '0xf67041758D3B6e56D6fDafA5B32038302C3634DA'},
 { symbol: 'TUSD', address: '0x0000000000085d4780B73119b644AE5ecd22b376'},
 { symbol: 'TXL', address: '0x8eEF5a82E6Aa222a60F009ac18c24EE12dBf4b41'},
 { symbol: 'UBXT', address: '0x8564653879a18C560E7C0Ea0E084c516C62F5653'},
 { symbol: 'UFT', address: '0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1'},
 { symbol: 'UMA', address: '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828'},
 { symbol: 'UMB', address: '0x6fC13EACE26590B80cCCAB1ba5d51890577D83B2'},
 { symbol: 'UNI', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'},
 { symbol: 'UNI', address: '0xcae516AA57D04EBf9b92813050282333F7587d2F'},
 { symbol: 'UOP', address: '0xE4AE84448DB5CFE1DaF1e6fb172b469c161CB85F'},
 { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'},
 { symbol: 'USDP', address: '0x1456688345527bE1f37E9e627DA0837D6f08C925'},
 { symbol: 'UST', address: '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD'},
 { symbol: 'UWL', address: '0xdbDD6F355A37b94e6C7D32fef548e98A280B8Df5'},
 { symbol: 'UniFi', address: '0x9E78b8274e1D6a76a0dBbf90418894DF27cBCEb5'},
 { symbol: 'VSP', address: '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421'},
 { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'},
 { symbol: 'WDOGE', address: '0x35a532d376FFd9a705d0Bb319532837337A398E7'},
 { symbol: 'WINE', address: '0x2056680C780B91f0774C571b5Fd9720f7bAe6ef0'},
 { symbol: 'WOOFY', address: '0xD0660cD418a64a1d44E9214ad8e459324D8157f1'},
 { symbol: 'WSCRT', address: '0x2B89bF8ba858cd2FCee1faDa378D5cd6936968Be'},
 { symbol: 'WSTA', address: '0xeDEec5691f23E4914cF0183A4196bBEb30d027a0'},
 { symbol: 'WZEC', address: '0x4A64515E5E1d1073e83f30cB97BEd20400b66E10'},
 { symbol: 'XFT', address: '0xABe580E7ee158dA464b51ee1a83Ac0289622e6be'},
 { symbol: 'XYO', address: '0x55296f69f40Ea6d20E478533C15A6B08B654E758'},
 { symbol: 'YAM', address: '0x0AaCfbeC6a24756c20D41914F2caba817C0d8521'},
 { symbol: 'YETI', address: '0xb4bebD34f6DaaFd808f73De0d10235a92Fbb6c3D'},
 { symbol: 'YFI', address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'},
 { symbol: 'YLD', address: '0xDcB01cc464238396E213a6fDd933E36796eAfF9f'},
 { symbol: 'YLD', address: '0xF94b5C5651c888d928439aB6514B93944eEE6F48'},
 { symbol: 'YOP', address: '0xAE1eaAE3F627AAca434127644371b67B18444051'},
 { symbol: 'YPIE', address: '0x17525E4f4Af59fbc29551bC4eCe6AB60Ed49CE31'},
 { symbol: 'ZEON', address: '0xE5B826Ca2Ca02F09c1725e9bd98d9a8874C30532'},
 { symbol: 'ZIG', address: '0x7BeBd226154E865954A87650FAefA8F485d36081'},
 { symbol: 'ZRX', address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498'},
 { symbol: 'aETHc', address: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb'},
 { symbol: 'arNXM', address: '0x1337DEF18C680aF1f9f45cBcab6309562975b1dD'},
 { symbol: 'arte', address: '0x34612903Db071e888a4dADcaA416d3EE263a87b9'},
 { symbol: 'buidl', address: '0x7b123f53421b1bF8533339BFBdc7C98aA94163db'},
 { symbol: 'bulldoge', address: '0xCa7e925bA8938A1b587172658b6C24054329aeF8'},
 { symbol: 'eMax', address: '0x15874d65e649880c2614e7a480cb7c9A55787FF6'},
 { symbol: 'erowan', address: '0x07baC35846e5eD502aA91AdF6A9e7aA210F2DcbE'},
 { symbol: 'mbBASED', address: '0x26cF82e4aE43D31eA51e72B663d26e26a75AF729'},
 { symbol: 'renDOGE', address: '0x3832d2F059E55934220881F831bE501D180671A7'},
 { symbol: 'sUSD', address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51'},
 { symbol: 'stETH', address: '0xDFe66B14D37C77F4E9b180cEb433d1b164f0281D'},
 { symbol: 'wNXM', address: '0x0d438F3b5175Bebc262bF23753C1E53d03432bDE'},
 { symbol: 'yveCRV-DAO', address: '0xc5bDdf9843308380375a611c18B50Fb9341f502A'},
 { symbol: 'yyDAI+yUSDC+yUSDT+yTUSD', address: '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c'},
 { symbol: 'zLOT', address: '0xA8e7AD77C60eE6f30BaC54E2E7c0617Bd7B5A03E'}];

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
 { symbol: '$DG', address: '0xEE06A81a695750E71a662B51066F2c74CF4478a0'},
 { symbol: '$ROPE', address: '0x9D47894f8BECB68B9cF3428d256311Affe8B068B'},
 { symbol: '$TRDL', address: '0x297D33e17e61C2Ddd812389C2105193f8348188a'},
 { symbol: '1INCH', address: '0x111111111117dC0aa78b770fA6A738034120C302'},
 { symbol: '1ONE', address: '0xD5cd84D6f044AbE314Ee7E414d37cae8773ef9D3'},
 { symbol: '2KEY', address: '0xE48972fCd82a274411c01834e2f031D4377Fa2c0'},
 { symbol: 'AAVE', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'},
 { symbol: 'ADX', address: '0xADE00C28244d5CE17D72E40330B1c318cD12B7c3'},
 { symbol: 'AERGO', address: '0x91Af0fBB28ABA7E31403Cb457106Ce79397FD4E6'},
 { symbol: 'ALCX', address: '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF'},
 { symbol: 'ALEPH', address: '0x27702a26126e0B3702af63Ee09aC4d1A084EF628'},
 { symbol: 'ALPA', address: '0x7cA4408137eb639570F8E647d9bD7B7E8717514A'},
 { symbol: 'ALPHA', address: '0xa1faa113cbE53436Df28FF0aEe54275c13B40975'},
 { symbol: 'ANKR', address: '0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4'},
 { symbol: 'ANY', address: '0xf99d58e463A2E07e5692127302C20A191861b4D6'},
 { symbol: 'API3', address: '0x0b38210ea11411557c13457D4dA7dC6ea731B88a'},
 { symbol: 'ARCH', address: '0x1F3f9D3068568F8040775be2e8C03C103C61f3aF'},
 { symbol: 'ARIA20', address: '0xeDF6568618A00C6F0908Bf7758A16F76B6E04aF9'},
 { symbol: 'ART', address: '0xfec0cF7fE078a500abf15F1284958F22049c2C7e'},
 { symbol: 'ASTRO', address: '0xcbd55D4fFc43467142761A764763652b48b969ff'},
 { symbol: 'AUC', address: '0xc12d099be31567add4e4e4d0D45691C3F58f5663'},
 { symbol: 'AVINOC', address: '0xF1cA9cb74685755965c7458528A36934Df52A3EF'},
 { symbol: 'AXS', address: '0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b'},
 { symbol: 'AXS', address: '0xF5D669627376EBd411E34b98F19C868c8ABA5ADA'},
 { symbol: 'BANK', address: '0x24A6A37576377F63f194Caa5F518a60f45b42921'},
 { symbol: 'BANK', address: '0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198'},
 { symbol: 'BAO', address: '0x374CB8C27130E2c9E04F44303f3c8351B9De61C1'},
 { symbol: 'BASE', address: '0x07150e919B4De5fD6a63DE1F9384828396f25fDC'},
 { symbol: 'BAT', address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF'},
 { symbol: 'BEL', address: '0xA91ac63D040dEB1b7A5E4d4134aD23eb0ba07e14'},
 { symbol: 'BLO', address: '0x68481f2c02BE3786987ac2bC3327171C5D05F9Bd'},
 { symbol: 'BLT', address: '0x107c4504cd79C5d2696Ea0030a8dD4e92601B82e'},
 { symbol: 'BOBA', address: '0xce9aFAF5b0dA6cE0366aB40435A48ccff65d2ED7'},
 { symbol: 'BOND', address: '0x0391D2021f89DC339F60Fff84546EA23E337750f'},
 { symbol: 'BOND', address: '0x5Dc02Ea99285E17656b8350722694c35154DB1E8'},
 { symbol: 'BOR', address: '0x3c9d6c1C73b31c837832c72E04D3152f051fc1A9'},
 { symbol: 'BPRO', address: '0xbbBBBBB5AA847A2003fbC6b5C16DF0Bd1E725f61'},
 { symbol: 'BTY', address: '0xe8679fe133f38f19e1cFFEBA98a4BAA5c897Ce51'},
 { symbol: 'Bone', address: '0x5C84bc60a796534bfeC3439Af0E6dB616A966335'},
 { symbol: 'CAVO', address: '0x24eA9c1cfD77A8DB3fB707F967309cF013CC1078'},
 { symbol: 'CFour', address: '0x52b0b8D859fB6a3ff9206f6957e9957a7eAb5505'},
 { symbol: 'CNFI', address: '0xEABB8996eA1662cAd2f7fB715127852cd3262Ae9'},
 { symbol: 'COIN', address: '0x87b008E57F640D94Ee44Fd893F0323AF933F9195'},
 { symbol: 'COL', address: '0xC76FB75950536d98FA62ea968E1D6B45ffea2A55'},
 { symbol: 'COMBO', address: '0xfFffFffF2ba8F66D4e51811C5190992176930278'},
 { symbol: 'COMP', address: '0xc00e94Cb662C3520282E6f5717214004A7f26888'},
 { symbol: 'COTI', address: '0xDDB3422497E61e13543BeA06989C0789117555c5'},
 { symbol: 'COVER', address: '0x4688a8b1F292FDaB17E9a90c8Bc379dC1DBd8713'},
 { symbol: 'COVER', address: '0x5D8d9F5b96f4438195BE9b99eee6118Ed4304286'},
 { symbol: 'CRD', address: '0xcAaa93712BDAc37f736C323C93D4D5fDEFCc31CC'},
 { symbol: 'CREAM', address: '0x2ba592F78dB6436527729929AAf6c908497cB200'},
 { symbol: 'CRV', address: '0xD533a949740bb3306d119CC777fa900bA034cd52'},
 { symbol: 'CTX', address: '0x321C2fE4446C7c963dc41Dd58879AF648838f98D'},
 { symbol: 'CVP', address: '0x38e4adB44ef08F22F5B5b76A8f0c2d0dCbE7DcA1'},
 { symbol: 'CZZ', address: '0x20bf12A7bdb6d7B84069fb3b939892A301C981d1'},
 { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F'},
 { symbol: 'DAO', address: '0x0f51bb10119727a7e5eA3538074fb341F56B09Ad'},
 { symbol: 'DEGEN', address: '0x126c121f99e1E211dF2e5f8De2d96Fa36647c855'},
 { symbol: 'DELTA rLP', address: '0xfcfC434ee5BfF924222e084a8876Eee74Ea7cfbA'},
 { symbol: 'DELTA', address: '0x9EA3b5b4EC044b70375236A281986106457b20EF'},
 { symbol: 'DEP', address: '0x1A3496C18d558bd9C6C8f609E1B129f67AB08163'},
 { symbol: 'DEV', address: '0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26'},
 { symbol: 'DEXTF', address: '0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0'},
 { symbol: 'DFD', address: '0x20c36f062a31865bED8a5B1e512D9a1A20AA333A'},
 { symbol: 'DFX', address: '0x888888435FDe8e7d4c54cAb67f206e4199454c60'},
 { symbol: 'DIA', address: '0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419'},
 { symbol: 'DNA', address: '0xef6344de1fcfC5F48c30234C16c1389e8CdC572C'},
 { symbol: 'DOGEBEAR', address: '0xF1d32952E2fbB1a91e620b0FD7fBC8a8879A47f3'},
 { symbol: 'DOGEGF', address: '0xfb130d93E49DcA13264344966A611dc79a456Bc5'},
 { symbol: 'DOGES', address: '0xb4FBed161bEbcb37afB1Cb4a6F7cA18b977cCB25'},
 { symbol: 'DOPL.', address: '0xCccB6460bC41A6Db9C830b8318F3557bAff0Dfd1'},
 { symbol: 'DPI', address: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b'},
 { symbol: 'DRC', address: '0xb78B3320493a4EFaa1028130C5Ba26f0B6085Ef8'},
 { symbol: 'DSCPL', address: '0xdECE0F6864c1511369ae2c30B90Db9f5fe92832c'},
 { symbol: 'DSD', address: '0xBD2F0Cd039E0BFcf88901C98c0bFAc5ab27566e3'},
 { symbol: 'DUCK', address: '0x92E187a03B6CD19CB6AF293ba17F2745Fd2357D5'},
 { symbol: 'DUNG', address: '0xDADA00A9C23390112D08a1377cc59f7d03D9df55'},
 { symbol: 'DUSD', address: '0x5BC25f649fc4e26069dDF4cF4010F9f706c23831'},
 { symbol: 'DestroyElon', address: '0x4EEac9248CB9A2919899B9f834C8b25524E50d75'},
 { symbol: 'ECAM', address: '0xa67E83917b438E11A58f119A2Bd9cC5dAaB86041'},
 { symbol: 'ECZZ', address: '0x150BbCfF6b1B4D528b48f1A300585Dea0b6490B6'},
 { symbol: 'ENJ', address: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c'},
 { symbol: 'ETHV', address: '0xEeEeeeeEe2aF8D0e1940679860398308e0eF24d6'},
 { symbol: 'ETM', address: '0xF3eb8B90C763b8B2B53E7819ac27eca8f94C8Ec2'},
 { symbol: 'FARM', address: '0xa0246c9032bC3A600820415aE600c6388619A14D'},
 { symbol: 'FCKS', address: '0xc6e2da4A9dBe3DFe5A0836B182e0a762A0F8ebd9'},
 { symbol: 'FNX', address: '0xeF9Cd7882c067686691B6fF49e650b43AFBBCC6B'},
 { symbol: 'FORCE', address: '0x2C31b10ca416b82Cec4c5E93c615ca851213d48D'},
 { symbol: 'FORTH', address: '0x77FbA179C79De5B7653F68b5039Af940AdA60ce0'},
 { symbol: 'FOUR', address: '0x4730fB1463A6F1F44AEB45F6c5c422427f37F4D0'},
 { symbol: 'FRONT', address: '0xf8C3527CC04340b208C854E985240c02F7B7793f'},
 { symbol: 'FTM', address: '0x4E15361FD6b4BB609Fa63C81A2be19d873717870'},
 { symbol: 'FTX Token', address: '0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9'},
 { symbol: 'FUSE', address: '0x970B9bB2C0444F5E81e9d0eFb84C8ccdcdcAf84d'},
 { symbol: 'FVT', address: '0x45080a6531d671DDFf20DB42f93792a489685e32'},
 { symbol: 'FXS', address: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0'},
 { symbol: 'GENE', address: '0xf6ec87DFE1Ed3a7256Cc0c38e3c8139103e9aF3b'},
 { symbol: 'GLM', address: '0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429'},
 { symbol: 'GMT', address: '0x7Ddc52c4De30e94Be3A6A0A2b259b2850f421989'},
 { symbol: 'GNO', address: '0x6810e776880C02933D47DB1b9fc05908e5386b96'},
 { symbol: 'GNYerc20', address: '0xb1f871Ae9462F1b2C6826E88A7827e76f86751d4'},
 { symbol: 'GOLDUCK', address: '0x378E8c47eb42cCE0dd9Cff48276a2aB73e9C254F'},
 { symbol: 'GOVI', address: '0xeEAA40B28A2d1b0B08f6f97bB1DD4B75316c6107'},
 { symbol: 'GWEI', address: '0xBC5CeF436eADAcadfa8daFb63088F09F21dEa7E9'},
 { symbol: 'HEGIC', address: '0x584bC13c7D411c00c01A62e8019472dE68768430'},
 { symbol: 'HEZ', address: '0xEEF9f339514298C6A857EfCfC1A762aF84438dEE'},
 { symbol: 'HXRO', address: '0x4bD70556ae3F8a6eC6C4080A0C327B24325438f3'},
 { symbol: 'ICE', address: '0xf16e81dce15B08F326220742020379B855B87DF9'},
 { symbol: 'ICHI', address: '0x903bEF1736CDdf2A537176cf3C64579C3867A881'},
 { symbol: 'ID', address: '0xEBd9D99A3982d547C5Bb4DB7E3b1F9F14b67Eb83'},
 { symbol: 'IDLE', address: '0x875773784Af8135eA0ef43b5a374AaD105c5D39e'},
 { symbol: 'IDRT', address: '0x998FFE1E43fAcffb941dc337dD0468d52bA5b48A'},
 { symbol: 'ILV', address: '0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E'},
 { symbol: 'INDEX', address: '0x0954906da0Bf32d5479e25f46056d22f08464cab'},
 { symbol: 'INJ', address: '0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30'},
 { symbol: 'INV', address: '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68'},
 { symbol: 'JRT', address: '0x8A9C67fee641579dEbA04928c4BC45F66e26343A'},
 { symbol: 'KP3R', address: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44'},
 { symbol: 'L2', address: '0xBbff34E47E559ef680067a6B1c980639EEb64D24'},
 { symbol: 'LAGER', address: '0xC4376cFdaB7302c47155b8D40c0E1941aE662526'},
 { symbol: 'LCX', address: '0x037A54AaB062628C9Bbae1FDB1583c195585fe41'},
 { symbol: 'LDN', address: '0xb29663Aa4E2e81e425294193616c1B102B70a158'},
 { symbol: 'LEND', address: '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03'},
 { symbol: 'LEV', address: '0xbc194e6f748a222754C3E8b9946922c09E7d4e91'},
 { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA'},
 { symbol: 'LON', address: '0x0000000000095413afC295d19EDeb1Ad7B71c952'},
 { symbol: 'LPT', address: '0x58b6A8A3302369DAEc383334672404Ee733aB239'},
 { symbol: 'LTE2', address: '0xf121848269B49B97B1EAbcFeceAdC5f701d20e80'},
 { symbol: 'LUNA', address: '0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9'},
 { symbol: 'MANA', address: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'},
 { symbol: 'MAPS', address: '0x2b915b505c017ABb1547aA5Ab355FbE69865cC6D'},
 { symbol: 'MASK', address: '0x0fe629d1E84E171f8fF0C1Ded2Cc2221Caa48a3f'},
 { symbol: 'MASQ', address: '0x06F3C323f0238c72BF35011071f2b5B7F43A054c'},
 { symbol: 'MATH', address: '0x08d967bb0134F2d07f7cfb6E246680c53927DD30'},
 { symbol: 'MATIC', address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'},
 { symbol: 'MIC', address: '0x368B3a58B5f49392e5C9E4C998cb0bB966752E51'},
 { symbol: 'MIR', address: '0x09a3EcAFa817268f77BE1283176B946C4ff2E608'},
 { symbol: 'MLN', address: '0xec67005c4E498Ec7f55E092bd1d35cbC47C91892'},
 { symbol: 'MM', address: '0xa283aA7CfBB27EF0cfBcb2493dD9F4330E0fd304'},
 { symbol: 'MOVE', address: '0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C'},
 { symbol: 'MPH', address: '0x8888801aF4d980682e47f1A9036e589479e835C5'},
 { symbol: 'MTA', address: '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2'},
 { symbol: 'MUA', address: '0xD7F8032777C50aFD2e7AFa41912a4d8038127271'},
 { symbol: 'MUSH', address: '0xea6412Fb370e8d1605E6aEeAA21aD07C3C7e9F24'},
 { symbol: 'MUST', address: '0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f'},
 { symbol: 'MYFI', address: '0x1Efb2286BF89F01488C6B2a22B2556C0f45e972b'},
 { symbol: 'MYFI', address: '0x22FE5BcAdA4E30A7310eFB1DfF7f90168dC42b62'},
 { symbol: 'NAOS', address: '0x4a615bB7166210CCe20E6642a6f8Fb5d4D044496'},
 { symbol: 'NCT', address: '0x8A9c4dfe8b9D8962B31e4e16F8321C44d48e246E'},
 { symbol: 'NDX', address: '0x86772b1409b61c639EaAc9Ba0AcfBb6E238e5F83'},
 { symbol: 'NFTI', address: '0xe5feeaC09D36B18b3FA757E5Cf3F8dA6B8e27F4C'},
 { symbol: 'NU', address: '0x4fE83213D56308330EC302a8BD641f1d0113A4Cc'},
 { symbol: 'OGN', address: '0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26'},
 { symbol: 'OMG', address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07'},
 { symbol: 'ONX', address: '0xE0aD1806Fd3E7edF6FF52Fdb822432e847411033'},
 { symbol: 'OPIUM', address: '0x888888888889C00c67689029D7856AAC1065eC11'},
 { symbol: 'ORBS', address: '0xff56Cc6b1E6dEd347aA0B7676C85AB0B3D08B0FA'},
 { symbol: 'OSST', address: '0xdC57e9B624b931aa8202F3A8d54F09fa8ce7981F'},
 { symbol: 'OXY', address: '0x965697b4ef02F0DE01384D0d4F9F782B1670c163'},
 { symbol: 'PEAK', address: '0x630d98424eFe0Ea27fB1b3Ab7741907DFFEaAd78'},
 { symbol: 'PENDLE', address: '0x808507121B80c02388fAd14726482e061B8da827'},
 { symbol: 'PERP', address: '0xbC396689893D065F41bc2C6EcbeE5e0085233447'},
 { symbol: 'PIC', address: '0xF1A9e30FcF023145939D9C56e5c79440c99707b3'},
 { symbol: 'PICKLE', address: '0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5'},
 { symbol: 'PLR', address: '0xe3818504c1B32bF1557b16C238B2E01Fd3149C17'},
 { symbol: 'PMON', address: '0x1796ae0b0fa4862485106a0de9b654eFE301D0b2'},
 { symbol: 'PNK', address: '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d'},
 { symbol: 'POND', address: '0x57B946008913B82E4dF85f501cbAeD910e58D26C'},
 { symbol: 'POOL', address: '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e'},
 { symbol: 'POOLZ', address: '0xcc5CB920D39d4d43E68d373a4889Bb6d88ED2497'},
 { symbol: 'POWR', address: '0x595832F8FC6BF59c85C527fEC3740A1b7a361269'},
 { symbol: 'PREMIA', address: '0x6399C842dD2bE3dE30BF99Bc7D1bBF6Fa3650E70'},
 { symbol: 'PTF', address: '0xC57d533c50bC22247d49a368880fb49a1caA39F7'},
 { symbol: 'PUNK', address: '0x9cea2eD9e47059260C97d697f82b8A14EfA61EA5'},
 { symbol: 'RAC', address: '0xc22B30E4cce6b78aaaADae91E44E73593929a3e9'},
 { symbol: 'RARI', address: '0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF'},
 { symbol: 'RAY', address: '0x5245C0249e5EEB2A0838266800471Fd32Adb1089'},
 { symbol: 'RCN', address: '0xF970b8E36e23F7fC3FD752EeA86f8Be8D83375A6'},
 { symbol: 'REM', address: '0x83984d6142934bb535793A82ADB0a46EF0F66B6d'},
 { symbol: 'REN', address: '0x408e41876cCCDC0F92210600ef50372656052a38'},
 { symbol: 'REQ', address: '0x8f8221aFbB33998d8584A2B05749bA73c37a938a'},
 { symbol: 'REVV', address: '0x557B933a7C2c45672B610F8954A3deB39a51A8Ca'},
 { symbol: 'RGT', address: '0xD291E7a03283640FDc51b121aC401383A46cC623'},
 { symbol: 'RIO', address: '0xf21661D0D1d76d3ECb8e1B9F1c923DBfffAe4097'},
 { symbol: 'RLC', address: '0x607F4C5BB672230e8672085532f7e901544a7375'},
 { symbol: 'ROBO', address: '0x6FC2f1044A3b9bB3e43A43EC8F840843Ed753061'},
 { symbol: 'ROOK', address: '0xfA5047c9c78B8877af97BDcb85Db743fD7313d4a'},
 { symbol: 'ROOM', address: '0xAd4f86a25bbc20FfB751f2FAC312A0B4d8F88c64'},
 { symbol: 'RSR', address: '0x8762db106B2c2A0bccB3A80d1Ed41273552616E8'},
 { symbol: 'RUDA', address: '0xCe78AB22CD0331a52Af7Bb4b622edFa792819D47'},
 { symbol: 'RULER', address: '0x2aECCB42482cc64E087b6D2e5Da39f5A7A7001f8'},
 { symbol: 'RUNE', address: '0x3155BA85D5F96b2d030a4966AF206230e46849cb'},
 { symbol: 'SASHIMI', address: '0xC28E27870558cF22ADD83540d2126da2e4b464c2'},
 { symbol: 'SDT', address: '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'},
 { symbol: 'SEC', address: '0x9C061DF134d11412151E9c200ce3F9f6F295094a'},
 { symbol: 'SEED', address: '0x30cF203b48edaA42c3B4918E955fED26Cd012A3F'},
 { symbol: 'SEEN', address: '0xCa3FE04C7Ee111F0bbb02C328c699226aCf9Fd33'},
 { symbol: 'SFI', address: '0xb753428af26E81097e7fD17f40c88aaA3E04902c'},
 { symbol: 'SI', address: '0xD23Ac27148aF6A2f339BD82D0e3CFF380b5093de'},
 { symbol: 'SKL', address: '0x00c83aeCC790e8a4453e5dD3B0B4b3680501a7A7'},
 { symbol: 'SPANK', address: '0x42d6622deCe394b54999Fbd73D108123806f6a18'},
 { symbol: 'SRM', address: '0x476c5E26a75bd202a9683ffD34359C0CC15be0fF'},
 { symbol: 'STAKE', address: '0x0Ae055097C6d159879521C384F1D2123D1f195e6'},
 { symbol: 'SUPER', address: '0xe53EC727dbDEB9E2d5456c3be40cFF031AB40A55'},
 { symbol: 'SURF', address: '0xEa319e87Cf06203DAe107Dd8E5672175e3Ee976c'},
 { symbol: 'SUSHI', address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2'},
 { symbol: 'SX', address: '0x99fE3B1391503A1bC1788051347A1324bff41452'},
 { symbol: 'SYNC', address: '0xB6ff96B8A8d214544Ca0dBc9B33f7AD6503eFD32'},
 { symbol: 'TCAP', address: '0x16c52CeeCE2ed57dAd87319D91B5e3637d50aFa4'},
 { symbol: 'TORN', address: '0x77777FeDdddFfC19Ff86DB637967013e6C6A116C'},
 { symbol: 'TRU', address: '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784'},
 { symbol: 'TRU', address: '0xf65B5C5104c4faFD4b709d9D60a185eAE063276c'},
 { symbol: 'TST', address: '0xf67041758D3B6e56D6fDafA5B32038302C3634DA'},
 { symbol: 'TUSD', address: '0x0000000000085d4780B73119b644AE5ecd22b376'},
 { symbol: 'TXL', address: '0x8eEF5a82E6Aa222a60F009ac18c24EE12dBf4b41'},
 { symbol: 'UBXT', address: '0x8564653879a18C560E7C0Ea0E084c516C62F5653'},
 { symbol: 'UFT', address: '0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1'},
 { symbol: 'UMB', address: '0x6fC13EACE26590B80cCCAB1ba5d51890577D83B2'},
 { symbol: 'UNI', address: '0xcae516AA57D04EBf9b92813050282333F7587d2F'},
 { symbol: 'UOP', address: '0xE4AE84448DB5CFE1DaF1e6fb172b469c161CB85F'},
 { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'},
 { symbol: 'USDP', address: '0x1456688345527bE1f37E9e627DA0837D6f08C925'},
 { symbol: 'UST', address: '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD'},
 { symbol: 'UWL', address: '0xdbDD6F355A37b94e6C7D32fef548e98A280B8Df5'},
 { symbol: 'UniFi', address: '0x9E78b8274e1D6a76a0dBbf90418894DF27cBCEb5'},
 { symbol: 'VSP', address: '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421'},
 { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'},
 { symbol: 'WDOGE', address: '0x35a532d376FFd9a705d0Bb319532837337A398E7'},
 { symbol: 'WINE', address: '0x2056680C780B91f0774C571b5Fd9720f7bAe6ef0'},
 { symbol: 'WOOFY', address: '0xD0660cD418a64a1d44E9214ad8e459324D8157f1'},
 { symbol: 'WSCRT', address: '0x2B89bF8ba858cd2FCee1faDa378D5cd6936968Be'},
 { symbol: 'WSTA', address: '0xeDEec5691f23E4914cF0183A4196bBEb30d027a0'},
 { symbol: 'WZEC', address: '0x4A64515E5E1d1073e83f30cB97BEd20400b66E10'},
 { symbol: 'XFT', address: '0xABe580E7ee158dA464b51ee1a83Ac0289622e6be'},
 { symbol: 'XYO', address: '0x55296f69f40Ea6d20E478533C15A6B08B654E758'},
 { symbol: 'YAM', address: '0x0AaCfbeC6a24756c20D41914F2caba817C0d8521'},
 { symbol: 'YFI', address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'},
 { symbol: 'YLD', address: '0xDcB01cc464238396E213a6fDd933E36796eAfF9f'},
 { symbol: 'YLD', address: '0xF94b5C5651c888d928439aB6514B93944eEE6F48'},
 { symbol: 'YOP', address: '0xAE1eaAE3F627AAca434127644371b67B18444051'},
 { symbol: 'YPIE', address: '0x17525E4f4Af59fbc29551bC4eCe6AB60Ed49CE31'},
 { symbol: 'ZEON', address: '0xE5B826Ca2Ca02F09c1725e9bd98d9a8874C30532'},
 { symbol: 'ZIG', address: '0x7BeBd226154E865954A87650FAefA8F485d36081'},
 { symbol: 'ZRX', address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498'},
 { symbol: 'aETHc', address: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb'},
 { symbol: 'arNXM', address: '0x1337DEF18C680aF1f9f45cBcab6309562975b1dD'},
 { symbol: 'arte', address: '0x34612903Db071e888a4dADcaA416d3EE263a87b9'},
 { symbol: 'buidl', address: '0x7b123f53421b1bF8533339BFBdc7C98aA94163db'},
 { symbol: 'bulldoge', address: '0xCa7e925bA8938A1b587172658b6C24054329aeF8'},
 { symbol: 'eMax', address: '0x15874d65e649880c2614e7a480cb7c9A55787FF6'},
 { symbol: 'erowan', address: '0x07baC35846e5eD502aA91AdF6A9e7aA210F2DcbE'},
 { symbol: 'mbBASED', address: '0x26cF82e4aE43D31eA51e72B663d26e26a75AF729'},
 { symbol: 'renDOGE', address: '0x3832d2F059E55934220881F831bE501D180671A7'},
 { symbol: 'sUSD', address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51'},
 { symbol: 'stETH', address: '0xDFe66B14D37C77F4E9b180cEb433d1b164f0281D'},
 { symbol: 'wNXM', address: '0x0d438F3b5175Bebc262bF23753C1E53d03432bDE'},
 { symbol: 'yveCRV-DAO', address: '0xc5bDdf9843308380375a611c18B50Fb9341f502A'},
 { symbol: 'yyDAI+yUSDC+yUSDT+yTUSD', address: '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c'},];

let veryhighgas_eth_pairs = [ //not worth arbitrage
   { symbol:  'ARMOR', address:  '0x1337DEF16F9B486fAEd0293eb623Dc8395dFE46a'},//228
   { symbol:  'AKRO',  address:  '0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7'},//192
   { symbol:  'FXS',   address:  '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0'},//200
   { symbol: 'AAVE', address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'},//361
   { symbol: 'AKRO', address: '0x8ab7404063ec4dbcfd4598215992dc3f8ec853d7'},//192
   { symbol: 'AMP' , address: '0xff20817765cb7f73d4bde2e66e067e58d11095c2'},//271
   { symbol: 'ANT' , address: '0xa117000000f279d81a1d3cc75430faa017fa5a2e'},//237
   { symbol: 'BAC',    address: '0x3449fc1cd036255ba1eb19d65ff4ba2b8903a69a'},//290
   { symbol: 'BADGER', address: '0x3472a5a71965499acd81997a54bba8d852c6e53d'},//264
   { symbol: 'BAND', address: '0xba11d00c5f74255f56a5e366f4f77f5a186d7f55'},//260
   { symbol: 'BZRX', address: '0x77777feddddffc19ff86db637967013e6c6a116c'},//264
   { symbol: 'DIGG', address: '0x798d1be841a82a273720ce31c822c61a67a601c3'},//238
   { symbol: 'DNT',    address: '0x0abdace70d3790235af448c88547603b945604ea'},//271
   { symbol: 'DOUGH', address: '0xad32a8e6220741182940c5abf610bde99e737b2d'},//270
   { symbol: 'ESD' , address: '0x36f3fd68e7325a35eb768f1aedaae9ea0689d723'},//271
   { symbol: 'GRT' , address: '0xc944e90c64b2c07662a292be6244bdf05cda44a7'},//228
   { symbol: 'LDO' , address: '0x5a98fcbea516cf06857215779fd812ca3bef1b32'},//264
   { symbol: 'LINA', address: '0x3e9bc21c9b189c09df3ef1b824798658d5011937'},//193
   { symbol: 'MARK', address: '0x67c597624b17b16fb77959217360b7cd18284253'},
   { symbol: 'NFTX', address: '0x87d73e916d7057945c9bcd8cdd94e42a6f47f776'},//264
   { symbol: 'OCEAN', address: '0x967da4048cd07ab37855c090aaf366e4ce1b9f48'},//222
   { symbol: 'RENDOG', address: '0x3832d2f059e55934220881f831be501d180671a7'},//271
   { symbol: 'REVV', address: '0x557B933a7C2c45672B610F8954A3deB39a51A8Ca'},
   { symbol: 'SNX ', address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f'},
   { symbol: 'sUSD', address: '0x57ab1ec28d129707052df4df418d58a2d46d5f51'},
   { symbol: 'SWAG', address: '0x87edffde3e14c7a66c9b9724747a1c5696b742e6'},
   { symbol: 'UMA' , address: '0x04fa0d235c4abf4bcf4787af4cf447de572ef828'},
   { symbol: 'UNI' , address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'},
   { symbol: 'USDN', address: '0x674c6ad92fd080e4004b2312b45f796a192d27a0'},
   { symbol: 'YETI', address: '0xb4bebd34f6daafd808f73de0d10235a92fbb6c3d'},
   { symbol: 'ZLOT', address: '0xa8e7ad77c60ee6f30bac54e2e7c0617bd7b5a03e'},//NEW
]

let low_liquidity_pairs = [
   { symbol: 'AERGO',  address: '0x91Af0fBB28ABA7E31403Cb457106Ce79397FD4E6'},
   { symbol: 'AKITA',  address: '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6'},
   { symbol: 'BAL' ,   address: '0xba100000625a3754423978a60c9317c58a424e3d'},
   { symbol: 'BANK',   address: '0x24a6a37576377f63f194caa5f518a60f45b42921'},
   { symbol: 'BOR' ,   address: '0x3c9d6c1c73b31c837832c72e04d3152f051fc1a9'},//
   { symbol: 'DAO',    address: '0x0f51bb10119727a7e5ea3538074fb341f56b09ad'},//
   { symbol: 'PREMIA', address: '0x6399c842dd2be3de30bf99bc7d1bbf6fa3650e70'},
   { symbol: 'DELTA',  address: '0x9EA3b5b4EC044b70375236A281986106457b20EF'},
   { symbol: 'USDP',   address: '0x1456688345527be1f37e9e627da0837d6f08c925'},
   { symbol: 'UOP',    address: '0xe4ae84448db5cfe1daf1e6fb172b469c161cb85f'},
   { symbol: 'MASK',   address: '0x69af81e73a73b40adf4f3d4223cd9b1ece623074'},//
   { symbol: 'mbBased',address: '0x26cf82e4ae43d31ea51e72b663d26e26a75af729'},
   { symbol: 'EGT',    address: '0x2aa5ce395b00cc486159adbdd97c55b535cf2cf9'},//
   { symbol: 'JUB',   address:  '0x3D3E392a734C07c7C97F3355F6024b408598F5A6'},
]

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
const SUSHI_ROUTER_ADDRESS = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
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
  let cut = -10
  let zero = -2
  let price
  let swapprofit_inETH
  let est_gascost = (currentgasPrice*1) * (test_gas*2)
  const gascost_inETH = web3.utils.fromWei(est_gascost.toString())

 try{
  uniswapAmountsOut = await uniswapRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
  num_uni =uniswapAmountsOut[1]
//  console.log('Return for UNI:',outputSymbol,num_uni)


  sushiswapAmountsOut = await sushiRouterContract.methods.getAmountsOut(flash_amount,([inputAddress,outputAddress])).call()
  num_sushi =sushiswapAmountsOut[1]
//  console.log('Return for SUSHI:',outputSymbol,num_sushi)
}catch(e){
  console.log(outputSymbol, 'has little or no liquidity')
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
  if(profit > zero && profit <200){
    console.log(outputSymbol,'Un->Su',financial(profit),'USD')
      gasPrice = await web3.eth.getGasPrice()
      console.log('GAS PRICE NORMAL TRANSACTION', gasPrice, 'TRANASCTION COST = ',(((((gasPrice*1.2)/1000000000000000000)*est_gas)*2)*ethPrice_inDai))

      monitoringPrice = true
      if (currentgasPrice>=10000000000){
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

   if(profit > zero && profit <200){
    console.log(_outputSymbol,'Su->Un',financial(profit),'USD')
      gasPrice = await web3.eth.getGasPrice()
      console.log('GAS PRICE NORMAL TRANSACTION', gasPrice,'TRANASCTION COST = ',(((((gasPrice*1.2)/100000000000000000)*est_gas)*2)*ethPrice_inDai))
      monitoringPrice = true
      trading_address = _outputAddress
      if (currentgasPrice>=10000000000){
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
  if(bal > flash_amount){
  console.log('ETH BALANCE IS GOOD', web3.utils.fromWei(bal))
  }else{
  console.log('ETH BALANCE IS TOO LOW', web3.utils.fromWei(bal), web3.utils.fromWei(flash_amount))
  monitoringPrice = false
  clearInterval(priceMonitor)
  return
  }
  if(monitoringPrice) {return}
  ethPrice_inDai = await uniswapRouterContract.methods.getAmountsIn('1000000000000000000',(['0x6b175474e89094c44da98b954eedeac495271d0f','0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'])).call()
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
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'mainnet' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
  })

  receipt = await sendRawTransaction(txData)
  forceReceipt()

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
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'mainnet' }) // or 'rinkeby'
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex');
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    return web3.eth.sendSignedTransaction('0x' + serializedTx)
  })

  receipt = await sendRawTransaction(txData)
  forceReceipt()

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
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'mainnet' }) // or 'rinkeby'
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
    const transaction = new Tx({ ...txData, nonce: newNonce }, { chain: 'mainnet' }) // or 'rinkeby'
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
  swapToken_SUSHI(trading_address)
}
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

priceMonitor = setInterval(async () => { await monitorPrice() }, 80000) //75 seconds 6 hours of infura
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
