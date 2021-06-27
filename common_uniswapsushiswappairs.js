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
const web3 = new Web3(new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL))
const UNISWAP_ROUTER_ABI = require('./abis/uniswap/uni_router_abi.json')
const UNISWAP_FACTORY_ABI = require('./abis/uniswap/uni_factory_abi.json')
const SUSHI_ROUTER_ABI = require('./abis/sushiswap/sushi_router_abi.json')
const SUSHI_FACTORY_ABI =require('./abis/sushiswap/sushi_factory_abi.json')

const UNISWAP_FACTORY_ADDRESS = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
const uniswapFactoryContract = new web3.eth.Contract(UNISWAP_FACTORY_ABI, UNISWAP_FACTORY_ADDRESS)
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const uniswapRouterContract = new web3.eth.Contract(UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS)
const SUSHI_FACTORY_ADDRESS = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
const sushiFactoryContract = new web3.eth.Contract(SUSHI_FACTORY_ABI, SUSHI_FACTORY_ADDRESS)
const SUSHI_ROUTER_ADDRESS = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
const sushiRouterContract = new web3.eth.Contract(SUSHI_ROUTER_ABI,SUSHI_ROUTER_ADDRESS)
const SUSHIPAIR_ABI = require('./abis/sushiswap/sushipair_abi.json')
const UNI_PAIR_ABI = require('./abis/uniswap/uni_pair_abi.json')
const ERC20_ABI = require('./abis/erc20/erc20_abi.json')

let pairsize = 50
const sushi_pairArray =[]
const pancake_pairArray = []
const combined_Array = []
const su_pairs =[
{sy: 'CRV', adr: '0xD533a949740bb3306d119CC777fa900bA034cd52', sP: '0x58Dc5a51fE44589BEb22E8CE67720B5BC5378009', uP: '0x3dA1313aE46132A397D90d95B1424A9A7e3e0fCE'},
{sy: 'REN', adr: '0x408e41876cCCDC0F92210600ef50372656052a38', sP: '0x611CDe65deA90918c0078ac0400A72B0D25B9bb1', uP: '0x8Bd1661Da98EBDd3BD080F0bE4e6d9bE8cE9858c'},
{sy: 'SRM', adr: '0x476c5E26a75bd202a9683ffD34359C0CC15be0fF', sP: '0x117d4288B3635021a3D612FE05a3Cbf5C717fEf2', uP: '0xCc3d1EceF1F9fD25599dbeA2755019DC09db3c54'},
{sy: 'UMA', adr: '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828', sP: '0x001b6450083E531A5a7Bf310BD2c1Af4247E23D4', uP: '0x88D97d199b9ED37C29D846d00D443De980832a22'},
{sy: 'COMP', adr: '0xc00e94Cb662C3520282E6f5717214004A7f26888', sP: '0x31503dcb60119A812feE820bb7042752019F2355', uP: '0xCFfDdeD873554F362Ac02f8Fb1f02E5ada10516f'},
{sy: 'BAND', adr: '0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55', sP: '0xA75F7c2F025f470355515482BdE9EFA8153536A8', uP: '0xf421c3f2e695C2D4C0765379cCace8adE4a480D9'},
{sy: 'SNX', adr: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F', sP: '0xA1d7b2d891e3A1f9ef4bBC5be20630C2FEB1c470', uP: '0x43AE24960e5534731Fc831386c07755A2dc33D47'},
{sy: 'LEND', adr: '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03', sP: '0x5E63360E891BD60C69445970256C260b0A6A54c6', uP: '0xaB3F9bF1D81ddb224a2014e98B238638824bCf20'},
{sy: 'sUSD', adr: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51', sP: '0xF1F85b2C54a2bD284B1cf4141D64fD171Bd85539', uP: '0xf80758aB42C3B07dA84053Fd88804bCB6BAA4b5c'},
{sy: 'LINK', adr: '0x514910771AF9Ca656af840dff83E8264EcF986CA', sP: '0xC40D16476380e4037e6b1A2594cAF6a6cc8Da967', uP: '0xa2107FA5B38d9bbd2C461D6EDf11B11A50F6b974'},
{sy: 'YFI', adr: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', sP: '0x088ee5007C98a9677165D78dD2109AE4a3D04d0C', uP: '0x2fDbAdf3C4D5A8666Bc06645B8358ab803996E28'},
{sy: 'DAI', adr: '0x6B175474E89094C44Da98b954EedeAC495271d0F', sP: '0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f', uP: '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11'},
{sy: 'USDC', adr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', sP: '0x397FF1542f962076d0BFE58eA045FfA2d347ACa0', uP: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc'},
{sy: 'SUSHI', adr: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', sP: '0x795065dCc9f64b5614C407a6EFDC400DA6221FB0', uP: '0xCE84867c3c02B05dc570d0135103d3fB9CC19433'},
{sy: 'DIA', adr: '0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419', sP: '0xBb7aB09971E56Aaf248dCc6C3DF865aF69D97372', uP: '0x4Dc02e1bB2EC1CE4C50C351e6e06505E7B1dCe8d'},
{sy: 'PNK', adr: '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d', sP: '0xEF4F1D5007B4FF88c1A56261fec00264AF6001Fb', uP: '0x343FD171caf4F0287aE6b87D75A8964Dc44516Ab'},
{sy: 'ADX', adr: '0xADE00C28244d5CE17D72E40330B1c318cD12B7c3', sP: '0x9cBc2A6Ab3f10eDF7d71C9cf3B6BdB7eE5629550', uP: '0xD3772A963790feDE65646cFdae08734A17cd0f47'},
{sy: 'WBTC', adr: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', sP: '0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58', uP: '0xBb2b8038a1640196FbE3e38816F3e67Cba72D940'},
{sy: 'RARI', adr: '0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF', sP: '0x53aaBCcAE8C1713a6a150D9981D2ee867D0720e8', uP: '0x86fEf14C27C78dEAEb4349FD959CAA11fc5B5D75'},
{sy: 'BLT', adr: '0x107c4504cd79C5d2696Ea0030a8dD4e92601B82e', sP: '0x2D2Bc284c24b5deBE489Da59557862e0aF884F23', uP: '0xf1Ff4c672DaBf9AEa4813DdA6De66b860b0970b4'},
{sy: 'AMP', adr: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2', sP: '0x15e86E6f65EF7EA1dbb72A5E51a07926fB1c82E3', uP: '0x08650bb9dc722C9c8C62E79C2BAfA2d3fc5B3293'},
{sy: 'HEGIC', adr: '0x584bC13c7D411c00c01A62e8019472dE68768430', sP: '0x6463Bd6026A2E7bFab5851b62969A92f7cca0eB6', uP: '0x1273aD5D8f3596A7a39EfDb5a4b8f82E8F003fc3'},
{sy: 'UBXT', adr: '0x8564653879a18C560E7C0Ea0E084c516C62F5653', sP: '0xBCd6a2DdAfbaa7f424698ed69E717C0c0F1e99BF', uP: '0x6a928D733606943559556F7eb22057C1964ce56a'},
{sy: 'UNI', adr: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', sP: '0xDafd66636E2561b0284EDdE37e42d192F2844D40', uP: '0xd3d2E2692501A5c9Ca623199D38826e513033a17'},
{sy: 'REVV', adr: '0x557B933a7C2c45672B610F8954A3deB39a51A8Ca', sP: '0xc926990039045611eb1DE520C1E249Fd0d20a8eA', uP: '0x724d5c9c618A2152e99a45649a3B8cf198321f46'},
{sy: 'wNXM', adr: '0x0d438F3b5175Bebc262bF23753C1E53d03432bDE', sP: '0xFcff3b04C499A57778ae2CF05584ab24278A7FCb', uP: '0x23bFf8ca20AAc06EFDf23cEe3B8ae296A30Dfd27'},
{sy: 'yyDAI+yUSDC+yUSDT+yTUSD', adr: '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c', sP: '0x382c4a5147Fd4090F7BE3A9Ff398F95638F5D39E', uP: '0x9346C20186D1794101B8517177A1b15c49c9ff9b'},
{sy: 'CREAM', adr: '0x2ba592F78dB6436527729929AAf6c908497cB200', sP: '0xf169CeA51EB51774cF107c88309717ddA20be167', uP: '0xddF9b7a31b32EBAF5c064C80900046C9e5b7C65F'},
{sy: 'LCX', adr: '0x037A54AaB062628C9Bbae1FDB1583c195585fe41', sP: '0x51dcB8D09FAc22C974cB2EF169310cC501063F46', uP: '0xFCB910d871d7e94F5A566B7b32Fb2B19583c09D7'},
{sy: 'AAVE', adr: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', sP: '0xD75EA151a61d06868E31F8988D28DFE5E9df57B4', uP: '0xDFC14d2Af169B0D36C4EFF567Ada9b2E0CAE044f'},
{sy: 'OMG', adr: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07', sP: '0x742c15d71eA7444964BC39b0eD729B3729ADc361', uP: '0x48E313460DD00100e22230e56E0A87B394066844'},
{sy: 'PICKLE', adr: '0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5', sP: '0x269Db91Fc3c7fCC275C2E6f22e5552504512811c', uP: '0xdc98556Ce24f007A5eF6dC1CE96322d65832A819'},
{sy: 'YAM', adr: '0x0AaCfbeC6a24756c20D41914F2caba817C0d8521', sP: '0x0F82E57804D0B1F6FAb2370A43dcFAd3c7cB239c', uP: '0xe2aAb7232a9545F29112f9e6441661fD6eEB0a5d'},
{sy: 'CRD', adr: '0xcAaa93712BDAc37f736C323C93D4D5fDEFCc31CC', sP: '0xD3f85d18206829f917929BbBF738C1e0CE9AF7fC', uP: '0x526914CE1611849b9e1133Ff8F8b03A8fAa295Cb'},
{sy: 'UFT', adr: '0x0202Be363B8a4820f3F4DE7FaF5224fF05943AB1', sP: '0xC4b26b26d720467d96E18f08664A888d4116cEa6', uP: '0x99dFDE431b40321a35dEb6AEb55cf338dDD6eccd'},
{sy: 'DPI', adr: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b', sP: '0x34b13F8CD184F55d0Bd4Dd1fe6C07D46f245c7eD', uP: '0x4d5ef58aAc27d99935E5b6B4A6778ff292059991'},
{sy: 'DOUGH', adr: '0xad32A8e6220741182940c5aBF610bDE99E737b2D', sP: '0x97f34c8E5992EB985c5F740e7EE8c7e48a1de76a', uP: '0xE8846B27988FF52c371D5BD27Bf8DBA4097C93D2'},
{sy: 'FARM', adr: '0xa0246c9032bC3A600820415aE600c6388619A14D', sP: '0x69b39B89f9274a16e8A19B78E5eB47a4d91dAc9E', uP: '0x56feAccb7f750B997B36A68625C7C596F0B41A58'},
{sy: 'STAKE', adr: '0x0Ae055097C6d159879521C384F1D2123D1f195e6', sP: '0x9Fc5b87b74B9BD239879491056752EB90188106D', uP: '0x3B3d4EeFDc603b232907a7f3d0Ed1Eea5C62b5f7'},
{sy: 'RSR', adr: '0x8762db106B2c2A0bccB3A80d1Ed41273552616E8', sP: '0x6f58A1Aa0248A9F794d13Dc78E74Fc75140956D7', uP: '0xba65016890709dBC9491Ca7bF5DE395B8441DC8B'},
{sy: 'SEEN', adr: '0xCa3FE04C7Ee111F0bbb02C328c699226aCf9Fd33', sP: '0xC5Fa164247d2F8D68804139457146eFBde8370F6', uP: '0x005e5840FD5a4B47a4AC6AcbCD887cF414A94944'},
{sy: 'KP3R', adr: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44', sP: '0xaf988afF99d3d0cb870812C325C588D8D8CB7De8', uP: '0x87fEbfb3AC5791034fD5EF1a615e9d9627C2665D'},
{sy: 'AKRO', adr: '0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7', sP: '0x364248b2f1f57C5402d244b2D469A35B4C0e9dAB', uP: '0x8Cb77eA869DeF8f7fdEab9E4dA6cF02897bbF076'},
{sy: 'AXS', adr: '0xF5D669627376EBd411E34b98F19C868c8ABA5ADA', sP: '0x35a0d9579B1E886702375364Fe9c540f97E4517B', uP: '0x24b24Af104c961DA1BA5bCCce4410d49AA558477'},
{sy: 'POWR', adr: '0x595832F8FC6BF59c85C527fEC3740A1b7a361269', sP: '0x72075636be2603b91BE1cDA70fAB6ef21cA86989', uP: '0x3C442baB170F19Dd40D0b1a405C9d93b088B9332'},
{sy: 'ARIA20', adr: '0xeDF6568618A00C6F0908Bf7758A16F76B6E04aF9', sP: '0xdD62a1a85A24c8D8A1b0F81a16c6EF9b03F96c60', uP: '0xC5202e3f5F60423d7106A68278c627FD091b5C7D'},
{sy: 'ROOK', adr: '0xfA5047c9c78B8877af97BDcb85Db743fD7313d4a', sP: '0xf13eEF1C6485348B9C9FA0d5Df2d89AccC5b0147', uP: '0x70ec2fA6Eccf4010eaf572d1C1a7bCbC72DEC983'},
{sy: 'TRU', adr: '0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784', sP: '0xfCEAAf9792139BF714a694f868A215493461446D', uP: '0xeC6a6b7dB761A5c9910bA8fcaB98116d384b1B85'},
{sy: 'FTX Token', adr: '0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9', sP: '0x7825dE5586E4d2FD04459091bbe783fa243E1bf3', uP: '0xF04543fBF20DAEE9B0357db966428EF2A4Ae0F5A'},
{sy: 'DRC', adr: '0xb78B3320493a4EFaa1028130C5Ba26f0B6085Ef8', sP: '0xC79FAEed130816B38E5996b79B1b3b6568cc599F', uP: '0x276E62C70e0B540262491199Bc1206087f523AF6'},
{sy: '$ROPE', adr: '0x9D47894f8BECB68B9cF3428d256311Affe8B068B', sP: '0x67e475577B4036EE4f0F12fa2d538Ed18CEF48e3', uP: '0xfAAB5238F5D2163E25518B0C1aF205da0f783dD0'},
{sy: 'MM', adr: '0xa283aA7CfBB27EF0cfBcb2493dD9F4330E0fd304', sP: '0x41848373dec2867ef3924E47B2eBD0EE645a54F9', uP: '0x23ab44BfBFb2d60df173C4b89f7E8366474ab05f'},
{sy: 'DFD', adr: '0x20c36f062a31865bED8a5B1e512D9a1A20AA333A', sP: '0xb12aa722a3A4566645F079B6F10c89A3205b6c2c', uP: '0xAC8833b0DA01b8f2CA53f549F13b5790066a842D'},
{sy: 'SFI', adr: '0xb753428af26E81097e7fD17f40c88aaA3E04902c', sP: '0x23a9292830Fc80dB7f563eDb28D2fe6fB47f8624', uP: '0xC76225124F3CaAb07f609b1D147a31de43926cd6'},
{sy: 'IDLE', adr: '0x875773784Af8135eA0ef43b5a374AaD105c5D39e', sP: '0xA7f11E026a0Af768D285360a855F2BDEd3047530', uP: '0x29A9777DA2Bacd8C4a28b6fd8247C4Ca4F098f12'},
{sy: 'ICHI', adr: '0x903bEF1736CDdf2A537176cf3C64579C3867A881', sP: '0x9cD028B1287803250B1e226F0180EB725428d069', uP: '0xd07D430Db20d2D7E0c4C11759256adBCC355B20C'},
{sy: 'DUCK', adr: '0x92E187a03B6CD19CB6AF293ba17F2745Fd2357D5', sP: '0x69aa90C6cD099BF383Bd9A0ac29E61BbCbF3b8D9', uP: '0xc3601F3e1c26d1a47571c559348e4156786d1Fec'},
{sy: 'MPH', adr: '0x8888801aF4d980682e47f1A9036e589479e835C5', sP: '0xB2C29e311916a346304f83AA44527092D5bd4f0F', uP: '0x4D96369002fc5b9687ee924d458A7E5bAa5df34E'},
{sy: 'INJ', adr: '0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30', sP: '0xFb3cD0B8A5371fe93ef92E3988D30Df7931E2820', uP: '0x3C70f4FAeA49E50AdC8305F2E1Aa0EA326A54fFc'},
{sy: 'UOP', adr: '0xE4AE84448DB5CFE1DaF1e6fb172b469c161CB85F', sP: '0x8C2e6A4af15C94cF4a86Cd3C067159F08571d780', uP: '0x49E31002D5aF5E716B37547bef9C98aBdf22D259'},
{sy: 'CVP', adr: '0x38e4adB44ef08F22F5B5b76A8f0c2d0dCbE7DcA1', sP: '0x1C580CC549d03171B13b55074Dc1658F60641C73', uP: '0x12D4444f96C644385D8ab355F6DDf801315b6254'},
{sy: 'ARCH', adr: '0x1F3f9D3068568F8040775be2e8C03C103C61f3aF', sP: '0x4441eb3076f828D5176f4Fe74d7c775542daE106', uP: '0x48A91882552Dad988AE758fCb7070B8E9844DeC5'},
{sy: 'INDEX', adr: '0x0954906da0Bf32d5479e25f46056d22f08464cab', sP: '0xA73DF646512C82550C2b3C0324c4EEdEE53b400C', uP: '0x3452A7f30A712e415a0674C0341d44eE9D9786F9'},
{sy: 'JRT', adr: '0x8A9C67fee641579dEbA04928c4BC45F66e26343A', sP: '0xF1360C4ae1cead17B588ec1111983d2791B760d3', uP: '0x2b6A25f7C54F43C71C743e627F5663232586C39F'},
{sy: 'PERP', adr: '0xbC396689893D065F41bc2C6EcbeE5e0085233447', sP: '0x8486c538DcBD6A707c5b3f730B6413286FE8c854', uP: '0xf66369997ae562BC9eeC2AB9541581252f9Ca383'},
{sy: 'UWL', adr: '0xdbDD6F355A37b94e6C7D32fef548e98A280B8Df5', sP: '0x0040a2CEBc65894BC2cFb57565f9ACfa33Fab137', uP: '0x9d4b552C992ee3B863F3b51E95E46eCf38c21429'},
{sy: 'ALPHA', adr: '0xa1faa113cbE53436Df28FF0aEe54275c13B40975', sP: '0xf55C33D94150d93c2cfb833bcCA30bE388b14964', uP: '0x60B2cC2c6ECD3DD89b4fD76818EF83186e2F2931'},
{sy: 'DUSD', adr: '0x5BC25f649fc4e26069dDF4cF4010F9f706c23831', sP: '0xb1D38026062Ac10FEDA072CA0E9b7E35f1f5795a', uP: '0x8CCd68AF5E35fe01c56AD40cD2eD27CBD7767FB1'},
{sy: 'ANT', adr: '0xa117000000f279D81A1D3cc75430fAA017FA5A2e', sP: '0x201e6a9E75df132a8598720433Af35fe8d73e94D', uP: '0x9dEF9511fEc79f83AFCBFfe4776B1D817DC775aE'},
{sy: 'COVER', adr: '0x4688a8b1F292FDaB17E9a90c8Bc379dC1DBd8713', sP: '0x66Ae32178640813F3c32a9929520BFE4Fef5D167', uP: '0x84e99CCC19da8290A754cb015cA188676d695f0A'},
{sy: 'LDO', adr: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', sP: '0xC558F600B34A5f69dD2f0D06Cb8A88d829B7420a', uP: '0x454F11D58E27858926d7a4ECE8bfEA2c33E97B13'},
{sy: 'GRT', adr: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7', sP: '0x7B504a15ef05F4EED1C07208C5815c49022A0C19', uP: '0x2e81eC0B8B4022fAC83A21B2F2B4B8f5ED744D70'},
{sy: 'REM', adr: '0x83984d6142934bb535793A82ADB0a46EF0F66B6d', sP: '0x55822996c641aa13653D2372FadA3DAaA0f25714', uP: '0x73263767A9d5e6998BA408839E06C054A88448E1'},
{sy: 'FOUR', adr: '0x4730fB1463A6F1F44AEB45F6c5c422427f37F4D0', sP: '0x38505b190a83383d4e75a6aC36fB3CD790389FFF', uP: '0xB1562400FEAA849c363127Bb847693CcA05C1080'},
{sy: 'API3', adr: '0x0b38210ea11411557c13457D4dA7dC6ea731B88a', sP: '0xA8AEC03d5Cf2824fD984ee249493d6D4D6740E61', uP: '0x4Dd26482738bE6C06C31467a19dcdA9AD781e8C4'},
{sy: 'RUNE', adr: '0x3155BA85D5F96b2d030a4966AF206230e46849cb', sP: '0xcc39592f5cB193a70f262aA301f54DB1d600e6Da', uP: '0x8d2A4cC2E2cA0f7ab011b686449DC82C3aF924c7'},
{sy: 'HXRO', adr: '0x4bD70556ae3F8a6eC6C4080A0C327B24325438f3', sP: '0xE53c884C5A297713197217509ffB654c9677B347', uP: '0xd64224a4C2BeD96C75Df9517B2d77aEbb13F0E37'},
{sy: 'BAO', adr: '0x374CB8C27130E2c9E04F44303f3c8351B9De61C1', sP: '0x0Eee7f7319013df1f24F5eaF83004fCf9cF49245', uP: '0x9973bb0fE5F8DF5dE730776dF09E946c74254fb3'},
{sy: 'NFTX', adr: '0x87d73E916D7057945c9BcD8cdd94e42A6F47f776', sP: '0x31d64f9403E82243e71C2af9D8F56C7DBe10C178', uP: '0x7B890092f81B337Ed68FBa266AfC7b4c3710A55b'},
{sy: 'BZRX', adr: '0x56d811088235F11C8920698a204A5010a788f4b3', sP: '0xa30911e072A0C88D55B5D0A0984B66b0D04569d0', uP: '0xB9b752F7f4a4680eEb327ffe728f46666763A796'},
{sy: 'ALEPH', adr: '0x27702a26126e0B3702af63Ee09aC4d1A084EF628', sP: '0x7B98e476De2c50b6fa284DBd410Dd516f9a72b30', uP: '0x29bA3D899E8a819Cf920adAfF53ef1CF31969E66'},
{sy: 'SDT', adr: '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F', sP: '0x22DEF8cF4E481417cb014D9dc64975BA12E3a184', uP: '0xc465C0a16228Ef6fE1bF29C04Fdb04bb797fd537'},
{sy: 'MTA', adr: '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2', sP: '0x663242D053057f317A773D7c262B700616d0b9A0', uP: '0x0d0d65E7A7dB277d3E0F5E1676325E75f3340455'},
{sy: 'COMBO', adr: '0xfFffFffF2ba8F66D4e51811C5190992176930278', sP: '0x8Cd7DADc8E11c8706763E0DE7332f5Ea91E04E35', uP: '0x040bEf6A2984Ba28D8AF8A24dDb51D61fbF08A81'},
{sy: 'TUSD', adr: '0x0000000000085d4780B73119b644AE5ecd22b376', sP: '0x760166FA4f227dA29ecAC3BeC348f5fA853a1f3C', uP: '0xb4d0d9df2738abE81b87b66c80851292492D1404'},
{sy: 'RGT', adr: '0xD291E7a03283640FDc51b121aC401383A46cC623', sP: '0x18A797C7C70c1Bf22fDee1c09062aBA709caCf04', uP: '0xDc2b82Bc1106C9c5286e59344896fB0ceb932f53'},
{sy: 'aETHc', adr: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb', sP: '0xfa5bc40c3BD5aFA8bC2fe6b84562fEE16FB2Df5F', uP: '0x6147805e1011417B93e5D693424a62A70d09d0E5'},
{sy: 'GNO', adr: '0x6810e776880C02933D47DB1b9fc05908e5386b96', sP: '0x41328fdBA556c8C969418ccCcB077B7B8D932aA5', uP: '0x3e8468f66d30Fc99F745481d4B383f89861702C6'},
{sy: 'FXS', adr: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', sP: '0x61eB53ee427aB4E007d78A9134AaCb3101A2DC23', uP: '0xecBa967D84fCF0405F6b32Bc45F4d36BfDBB2E81'},
{sy: 'arNXM', adr: '0x1337DEF18C680aF1f9f45cBcab6309562975b1dD', sP: '0x43632E3448cd47440fEE797258081414D91A58cE', uP: '0x7CA51456b20697A0E5Be65e5AEb65dfE90f21150'},
{sy: 'ARMOR', adr: '0x1337DEF16F9B486fAEd0293eb623Dc8395dFE46a', sP: '0x17A2194D55f52Fd0C711e0e42B41975494bb109B', uP: '0x648450d9C30B73E2229303026107a1f7eB639f6c'},
{sy: 'LPT', adr: '0x58b6A8A3302369DAEc383334672404Ee733aB239', sP: '0xBbA271e4d9141eE6A54807Ee65b350221D2C8167', uP: '0x755C1a8F71f4210CD7B60b9439451EfCbeBa33D1'},
{sy: 'FTM', adr: '0x4E15361FD6b4BB609Fa63C81A2be19d873717870', sP: '0x0E26A21013f2F8C0362cFae608b4e69a249D5EFc', uP: '0x1ffC57cAda109985aD896a69FbCEBD565dB4290e'},
{sy: 'OPIUM', adr: '0x888888888889C00c67689029D7856AAC1065eC11', sP: '0xD84d55532B231DBB305908bc5A10B8c55ba21e5E', uP: '0x4802ceB046EF35af802Aa1be75eeacb4ec2a9bad'},
{sy: 'NCT', adr: '0x8A9c4dfe8b9D8962B31e4e16F8321C44d48e246E', sP: '0x0C48aE092A7D35bE0e8AD0e122A02351BA51FeDd', uP: '0x9f4aa9B4661F0c55B61FC12b1944F006a71c773f'},
{sy: 'DNT', adr: '0x0AbdAce70D3790235af448C88547603b945604ea', sP: '0xa1f967F25AE32bD3435E45EA8657De16Ce5A4Ae6', uP: '0xb062fcBB48154FD385f104B38A2F9F3FFD82ffe0'},
{sy: 'MAPS', adr: '0x2b915b505c017ABb1547aA5Ab355FbE69865cC6D', sP: '0x41E05211a0De162b4A131730a500F114F653A0aD', uP: '0xF0644757918d29e5a9B9ca62D8A4d599aB9f5109'},
{sy: 'UniFi', adr: '0x9E78b8274e1D6a76a0dBbf90418894DF27cBCEb5', sP: '0xB86b7A79A9b8cA2FaFD12a180aC08d4Ee4135e41', uP: '0x04840Eaa3497E4C3934698ff88050Ceb9893f78F'},
{sy: 'arte', adr: '0x34612903Db071e888a4dADcaA416d3EE263a87b9', sP: '0x6C2787df72590a2A124ba7930f5e1AF7A6406c79', uP: '0xadaFB7eCC4Fa0794c7A895Da0a53b153871E59B6'},
{sy: 'ANY', adr: '0xf99d58e463A2E07e5692127302C20A191861b4D6', sP: '0xEc78bD3b23aC867FcC028f2db405A1d9A0A2f712', uP: '0x0e6a01Fcd1420B719Cb570BE60B6bF80FBe460C4'},
{sy: 'YLD', adr: '0xDcB01cc464238396E213a6fDd933E36796eAfF9f', sP: '0xBbfd9B37ec6ea1cA612AB4ADef6d8c6ece1a4134', uP: '0x242d289b3EEb6842ce0FCc0d87932402299Ae5b3'},
{sy: 'TORN', adr: '0x77777FeDdddFfC19Ff86DB637967013e6C6A116C', sP: '0xb270176bA6075196dF88B855c3Ec7776871Fdb33', uP: '0x0C722a487876989Af8a05FFfB6e32e45cc23FB3A'},
{sy: 'OCEAN', adr: '0x967da4048cD07aB37855c090aAF366e4ce1b9F48', sP: '0xeE35E548C7457FcDd51aE95eD09108be660Ea374', uP: '0x9b7DaD79FC16106b47a3DAb791F389C167e15Eb0'},
{sy: 'REQ', adr: '0x8f8221aFbB33998d8584A2B05749bA73c37a938a', sP: '0x7ADb368141248d6c50b614aeE3B6a9ef9f8c20BD', uP: '0x4a7d4BE868e0b811ea804fAF0D3A325c3A29a9ad'},
{sy: 'OGN', adr: '0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26', sP: '0x72ea6Ca0D47b337f1EA44314d9d90E2A897eDaF5', uP: '0xce2Cc0513634CEf3a7C9C257E294EF5E3092f185'},
{sy: 'PLR', adr: '0xe3818504c1B32bF1557b16C238B2E01Fd3149C17', sP: '0x8FEdca1b2aA38dd751Bf4CB329D2A1FC5B26e8F2', uP: '0xaE2D4004241254aEd3f93873604d39883c8259F0'},
{sy: 'stETH', adr: '0xDFe66B14D37C77F4E9b180cEb433d1b164f0281D', sP: '0x1C615074c281c5d88ACc6914D408d7E71Eb894EE', uP: '0x448A0a42f55142971bb3ea45E64528D3e4114f9e'},
{sy: 'ZRX', adr: '0xE41d2489571d322189246DaFA5ebDe1F4699F498', sP: '0x0BC5AE46c32D99C434b7383183ACa16DD6E9BdC8', uP: '0xc6F348dd3B91a56D117ec0071C1e9b83C0996De4'},
{sy: 'YOP', adr: '0xAE1eaAE3F627AAca434127644371b67B18444051', sP: '0xE4275E185074AFA0b760a6b0787eF42F4b030813', uP: '0xD65E975c7D0d5871EfF8b079120E43C9F377aDa1'},
{sy: 'XFT', adr: '0xABe580E7ee158dA464b51ee1a83Ac0289622e6be', sP: '0xF39fF863730268C9bb867b3a69d031d1C1614b31', uP: '0x2B9e92A5B6e69Db9fEdC47a4C656C9395e8a26d2'},
{sy: 'VSP', adr: '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421', sP: '0x132eEb05d5CB6829Bd34F552cDe0b6b708eF5014', uP: '0x6D7B6DaD6abeD1DFA5eBa37a6667bA9DCFD49077'},
{sy: 'ONX', adr: '0xE0aD1806Fd3E7edF6FF52Fdb822432e847411033', sP: '0x0652687E87a4b8b5370b05bc298Ff00d205D9B5f', uP: '0x62f22A47e5D2F8b71cC44fD85863753618312f67'},
{sy: 'erowan', adr: '0x07baC35846e5eD502aA91AdF6A9e7aA210F2DcbE', sP: '0x13Cd8c3be06BaaE672f64bf3F59331B39A5ed5e9', uP: '0x659A9a43B32bea6C113C393930a45C7634a242d5'},
{sy: 'DAO', adr: '0x0f51bb10119727a7e5eA3538074fb341F56B09Ad', sP: '0x96F5b7C2bE10dC7dE02Fa8858A8f1Bd19C2fA72A', uP: '0x7DD3F5705504002dc946AEAfE6629b9481b72272'},
{sy: 'WSCRT', adr: '0x2B89bF8ba858cd2FCee1faDa378D5cd6936968Be', sP: '0x9c86BC3C72Ab97c2234CBA8c6c7069009465AE86', uP: '0x438d3e9CaCAB4614a8F1613ac7B182378d76e1F8'},
{sy: 'RAY', adr: '0x5245C0249e5EEB2A0838266800471Fd32Adb1089', sP: '0xD7DbFBF98e1d4cEeD14607f93Fe2Acf537D375dA', uP: '0x3c4adc4DC1A50bf6Ec59af196A204415bC708429'},
{sy: 'COTI', adr: '0xDDB3422497E61e13543BeA06989C0789117555c5', sP: '0x717385e1a702F90B6Eb8Cd23150702Ca7217b626', uP: '0xA2b04F8133fC25887A436812eaE384e32A8A84F2'},
{sy: 'DEXTF', adr: '0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0', sP: '0xD3c41c080a73181e108E0526475a690F3616a859', uP: '0xa1444AC5b8Ac4f20F748558fE4E848087f528E00'},
{sy: 'RLC', adr: '0x607F4C5BB672230e8672085532f7e901544a7375', sP: '0x75382c52b6F90B3f8014BfcadAC2386513F1e3bC', uP: '0x6d57a53A45343187905aaD6AD8eD532D105697c1'},
{sy: 'SX', adr: '0x99fE3B1391503A1bC1788051347A1324bff41452', sP: '0x5e496B7D72362ADd1EEA7D4903Ee2732cD00587d', uP: '0x7e451ab571a119fd6CF36E5B91B58303e81E1d4F'},
{sy: 'POOL', adr: '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e', sP: '0x577959C519c24eE6ADd28AD96D3531bC6878BA34', uP: '0x85Cb0baB616Fe88a89A35080516a8928F38B518b'},
{sy: 'INV', adr: '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68', sP: '0x328dFd0139e26cB0FEF7B0742B49b0fe4325F821', uP: '0x73E02EAAb68a41Ea63bdae9Dbd4b7678827B2352'},
{sy: 'ID', adr: '0xEBd9D99A3982d547C5Bb4DB7E3b1F9F14b67Eb83', sP: '0x77337FF10206480739a768124A18f3aA8C089153', uP: '0xBCFFa1619aB3cE350480AE0507408A3C6c3572Bd'},
{sy: 'MUST', adr: '0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f', sP: '0xA872D244B8948DFD6Cb7Bd19f79E7C1bfb7DB4a0', uP: '0x15861b072abAd08b24460Add30b09E1481290F94'},
{sy: 'GNYerc20', adr: '0xb1f871Ae9462F1b2C6826E88A7827e76f86751d4', sP: '0x16D6Ddf22fFdbc3793400AAEEb2aB51dCfb9e428', uP: '0x8da66B6E90cAc30dB0DCe239086Cfdb2dbf66A30'},
{sy: 'OXY', adr: '0x965697b4ef02F0DE01384D0d4F9F782B1670c163', sP: '0xD1B430Eb6F5de67Cc2f2FCCFA559b8dB70D9d96D', uP: '0xA03154BFB9a750B944b5F8DE7A744A34aC6dD16D'},
{sy: 'MATIC', adr: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', sP: '0x7f8F7Dd53D1F3ac1052565e3ff451D7fE666a311', uP: '0x819f3450dA6f110BA6Ea52195B3beaFa246062dE'},
{sy: 'GOVI', adr: '0xeEAA40B28A2d1b0B08f6f97bB1DD4B75316c6107', sP: '0x7E6782E37278994d1e99f1a5d03309B4b249d919', uP: '0x1EE312A6d5fe7b4B8c25f0a32fCA6391209eBEBF'},
{sy: 'NFTI', adr: '0xe5feeaC09D36B18b3FA757E5Cf3F8dA6B8e27F4C', sP: '0x07cd13c8dd03Ba5D899C59176410B92c3F3b1570', uP: '0x23BfedB92a5e5B8571650c975f9553c1113e75CB'},
{sy: 'SUPER', adr: '0xe53EC727dbDEB9E2d5456c3be40cFF031AB40A55', sP: '0x62CCB80f72CC5C975C5Bc7fb4433D3c336CE5CeB', uP: '0x25647E01Bd0967C1B9599FA3521939871D1d0888'},
{sy: 'DEP', adr: '0x1A3496C18d558bd9C6C8f609E1B129f67AB08163', sP: '0x0EdEB95D2460880ed686409e88b942FD6600fF88', uP: '0xAe904569686346ebb0aA92E07934189f14C2f656'},
{sy: 'MYFI', adr: '0x22FE5BcAdA4E30A7310eFB1DfF7f90168dC42b62', sP: '0x1138e39F8838eBAF63Dec72263ffeC55c5CD0626', uP: '0x0221FB549D63212c40AaA6E7fb491C66C5f78e1A'},
{sy: 'MANA', adr: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942', sP: '0x1bEC4db6c3Bc499F3DbF289F5499C30d541FEc97', uP: '0x11b1f53204d03E5529F09EB3091939e4Fd8c9CF3'},
{sy: 'YLD', adr: '0xF94b5C5651c888d928439aB6514B93944eEE6F48', sP: '0x662511a91734AEa8b06EF770D6Ed51cC539772d0', uP: '0x9339227Db67f747114C929B26B81fe7974436B94'},
{sy: 'NU', adr: '0x4fE83213D56308330EC302a8BD641f1d0113A4Cc', sP: '0x04444d365324134e58104B1D874D00dc68dCEA53', uP: '0x3a8afc58b70b34a0a5615d3A5FfE623cA1fA92B8'},
{sy: 'SYNC', adr: '0xB6ff96B8A8d214544Ca0dBc9B33f7AD6503eFD32', sP: '0x28C5A7bb3e81F279B1c3C8CA5F945B4aCb392Ecb', uP: '0xFb2F545A9AD62F38fe600E24f75ecD790d30a7Ba'},
{sy: 'ROBO', adr: '0x6FC2f1044A3b9bB3e43A43EC8F840843Ed753061', sP: '0x36E06522F0555f35dB55856b1Dc3842B7b4CD830', uP: '0x155c119aBedc4996Ba571cDa949f50D83470d23d'},
{sy: 'XYO', adr: '0x55296f69f40Ea6d20E478533C15A6B08B654E758', sP: '0x0C967dfF67bC0e7c4fb31b4BF67A513aE1752A00', uP: '0xa986F2A12d85c44429f574BA50C0e21052B18BA1'},
{sy: 'SI', adr: '0xD23Ac27148aF6A2f339BD82D0e3CFF380b5093de', sP: '0x30045ad74f4475E82DcDC269952581ECb7CD2bAd', uP: '0x5D8a31269A9f3336e3f23DE17B2EC7393BdD6916'},
{sy: 'WDOGE', adr: '0x35a532d376FFd9a705d0Bb319532837337A398E7', sP: '0x60Bce13608701789Ab9c8Faa9B82dE115Ea8744d', uP: '0xc3d7aA944105d3FaFE07fc1822102449C916a8d0'},
{sy: 'IDRT', adr: '0x998FFE1E43fAcffb941dc337dD0468d52bA5b48A', sP: '0xBE1dA348fD61bB6bF70670490722EEEFc72AF92E', uP: '0xff62b7767104FF2785CA4847b9445fd808516515'},
{sy: 'SHIB', adr: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', sP: '0x24D3dD4a62e29770cf98810b09F89D3A90279E7a', uP: '0x811beEd0119b4AfCE20D2583EB608C6F7AF1954f'},
{sy: 'PMON', adr: '0x1796ae0b0fa4862485106a0de9b654eFE301D0b2', sP: '0x69ab811953499Eb253c5a69aE06275A42b97c9aE', uP: '0xbf4fF08b9A3bBb77A362b609119100545C0445FE'},
{sy: 'TXL', adr: '0x8eEF5a82E6Aa222a60F009ac18c24EE12dBf4b41', sP: '0x1365707157a1ec841064a18d2A1771c677DF9A1C', uP: '0x0Fdc86703C938e3E1cbc9E14f21c6BF709c13aCc'},
{sy: 'CNFI', adr: '0xEABB8996eA1662cAd2f7fB715127852cd3262Ae9', sP: '0xE7FcE6c57FeDCe45f5d4434111109965Df2Df54E', uP: '0x8d4de8dc1650E73C1c238Fa3b4d01ccc4C1AAeE8'},
{sy: 'UMB', adr: '0x6fC13EACE26590B80cCCAB1ba5d51890577D83B2', sP: '0x7229d526d5fD693720B88Eb7129058dB5D497BCe', uP: '0xB1BbeEa2dA2905E6B0A30203aEf55c399C53D042'},
{sy: 'TRU', adr: '0xf65B5C5104c4faFD4b709d9D60a185eAE063276c', sP: '0xaFa43241cf1A1d12268E75f1e7258b805E708Da5', uP: '0x80b4d4e9d88D9f78198c56c5A27F3BACB9A685C5'},
{sy: 'ICE', adr: '0xf16e81dce15B08F326220742020379B855B87DF9', sP: '0x94b86CA6F7a495930Fe7f552eb9e4CbB5eF2b736', uP: '0x0EfEA698136d636e2babAD10821e9064fE08f418'},
{sy: 'MIR', adr: '0x09a3EcAFa817268f77BE1283176B946C4ff2E608', sP: '0x09071bd5ea1b26AD3b24be2839e2f8b44331C66D', uP: '0x57aB5AEB8baC2586A0d437163C3eb844246336CE'},
{sy: 'ZIG', adr: '0x7BeBd226154E865954A87650FAefA8F485d36081', sP: '0x4Fb3CAe84a1264b8BB1911e8915F56660eC8178E', uP: '0xD17351869eFe6cD11861AE9eAc87119A891d9Ac3'},
{sy: 'BOND', adr: '0x0391D2021f89DC339F60Fff84546EA23E337750f', sP: '0x613C836DF6695c10f0f4900528B6931441Ac5d5a', uP: '0xB17B1342579e4bcE6B6e9A426092EA57d33843D9'},
{sy: 'PEAK', adr: '0x630d98424eFe0Ea27fB1b3Ab7741907DFFEaAd78', sP: '0x5399a36F54cA91a5DB5C148eEB2B909bBA81B82C', uP: '0x9C18A2F9545112AB2FCBDd228536562406A53232'},
{sy: 'LDN', adr: '0xb29663Aa4E2e81e425294193616c1B102B70a158', sP: '0x3bFcA4FB8054fA42DA3E77749b21450a1290beED', uP: '0x0919Bbfa00f8c6e2131bd48C47e0534664a019Fb'},
{sy: '$DG', adr: '0xEE06A81a695750E71a662B51066F2c74CF4478a0', sP: '0xd3dA6236aEcb6b55F571249c011B8EEC340a418E', uP: '0x44c21F5DCB285D92320AE345C92e8B6204Be8CdF'},
{sy: 'NAOS', adr: '0x4a615bB7166210CCe20E6642a6f8Fb5d4D044496', sP: '0x82EbCD936C9E938704b65027850E42393F8BC4d4', uP: '0x9b577E849b128EE1a69144b218e809B8Bb98C35D'},
{sy: 'FVT', adr: '0x45080a6531d671DDFf20DB42f93792a489685e32', sP: '0x96335e7CdbCD91fB33C26991b00cc13a87A811b9', uP: '0x75001b3FfE0f77864c7Dc64c55e1E22b205e4a07'},
{sy: 'MLN', adr: '0xec67005c4E498Ec7f55E092bd1d35cbC47C91892', sP: '0x2F8AC927aa94293461C75406e90Ec0cCFb2748d9', uP: '0x15ab0333985FD1E289adF4fBBe19261454776642'},
{sy: 'Bone', adr: '0x5C84bc60a796534bfeC3439Af0E6dB616A966335', sP: '0x598d960Eeee655b57C1c5c60F516Cde001dc09F8', uP: '0x75A9D7ef9EEB3370E20df491c4153aC2B89A6afE'},
{sy: 'GMT', adr: '0x7Ddc52c4De30e94Be3A6A0A2b259b2850f421989', sP: '0x9C4032de39F564367fDeB6e7807179C7E6Df0D8e', uP: '0x8D5189e6B73A1Da3C2CE5c68eEa4380534b50baB'},
{sy: 'BANK', adr: '0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198', sP: '0x2c51eaa1BCc7b013C3f1D5985cDcB3c56DC3fbc1', uP: '0x59C1349BC6F28A427E78DdB6130ec669C2F39b48'},
{sy: 'MASQ', adr: '0x06F3C323f0238c72BF35011071f2b5B7F43A054c', sP: '0x26e6a391953169D141DF36834Acfd9c61d3D4D59', uP: '0xC724B925B99491b055750b37e564D17843053Cd9'},
{sy: 'DOGEGF', adr: '0xfb130d93E49DcA13264344966A611dc79a456Bc5', sP: '0xa416Df4D96cd547337A3e8893bf3F01C2a2AF5C0', uP: '0x6060ad7b2ABb5716aDc82C669353E5C5f3B9FB4d'},
{sy: 'BPRO', adr: '0xbbBBBBB5AA847A2003fbC6b5C16DF0Bd1E725f61', sP: '0x4a8428d6a407e57fF17878e8DB21b4706116606F', uP: '0x288d25592a995cA878B79762Cb8Ec5a95d2e888a'},
{sy: 'eMax', adr: '0x15874d65e649880c2614e7a480cb7c9A55787FF6', sP: '0xaB0E90f073C216Ff3FD577A1cF5fA07A9DcD0A29', uP: '0xb6CA52c7916ad7960C12Dc489FD93E5Af7cA257f'},
{sy: 'BEL', adr: '0xA91ac63D040dEB1b7A5E4d4134aD23eb0ba07e14', sP: '0x0018fb451a46AE397B8569936Bc5bb5FF03cfD18', uP: '0x9E98dEaC1A416C9CE3C892BD8EeF586f1291CA35'},
{sy: 'ANKR', adr: '0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4', sP: '0x1241F4a348162d99379A23E73926Cf0bfCBf131e', uP: '0x5201883feeb05822CE25c9Af8Ab41Fc78Ca73fA9'},
{sy: 'NDX', adr: '0x86772b1409b61c639EaAc9Ba0AcfBb6E238e5F83', sP: '0x8911fce375a8414B1b578BE66eE691A8D2D4DBf7', uP: '0x46af8AC1b82F73dB6Aacc1645D40c56191ab787b'},
{sy: 'DEGEN', adr: '0x126c121f99e1E211dF2e5f8De2d96Fa36647c855', sP: '0xe8eB0f7B866A85DA49401D04FfFcfC1aBbF24Dfd', uP: '0xFaAD1072E259B5ED342D3f16277477B46D379ABC'},
{sy: 'CWS', adr: '0xaC0104Cca91D167873B8601d2e71EB3D4D8c33e0', sP: '0x7818A7E2Ab095A15dcb348c7DD6D1d88d7CeaBfD', uP: '0x40449D1F4C2D4f88dfd5b18868c76738a4E52FD4'},
{sy: 'B20', adr: '0xc4De189Abf94c57f396bD4c52ab13b954FebEfD8', sP: '0x5D2bE03434fd42E232a6a34abcc764681bCcB458', uP: '0xE6f51e892046cb5B437e0033D990B527EA4367C8'},
{sy: 'VOL', adr: '0x5166E09628b696285E3A151e84FB977736a83575', sP: '0xB7df0EF1C1232de62C0D99Df9B5b92d35b522F6B', uP: '0xE04C1A564d8B42a589F25DBA20c2A210fB875C17'},
{sy: 'CAPS', adr: '0x03Be5C903c727Ee2C8C4e9bc0AcC860Cca4715e2', sP: '0x782dB22763c7d565d3833A9238f24237Ef44a233', uP: '0x456FB056a8D118300B624D3AEE3864e685ae086C'}]
let ethPrice_inDai;
let monitoringPrice

// SERVER CONFIG
const PORT = process.env.PORT || 5000
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))
let differenceMonitor

async function getPairDifference(symbol,sushipairaddress, unipairaddress){
  let sushiPrice
  let uniPrice
  let sushiPairTokenContract = new web3.eth.Contract(SUSHIPAIR_ABI,sushipairaddress)
  let sushipairs0address = await sushiPairTokenContract.methods.token0().call()
  let sushi_liquidity = await sushiPairTokenContract.methods.getReserves().call()
  if(sushipairs0address=='0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'){
    sushiPrice =(sushi_liquidity[0]/sushi_liquidity[1])*ethPrice_inDai
  }else{
    sushiPrice =(sushi_liquidity[1]/sushi_liquidity[0])*ethPrice_inDai
  }
  let uniPairTokenContract = new web3.eth.Contract(UNI_PAIR_ABI,unipairaddress)
  let unipairs0address = await uniPairTokenContract.methods.token0().call()
  let uni_liquidity = await uniPairTokenContract.methods.getReserves().call()
  if(unipairs0address=='0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'){
  uniPrice =(uni_liquidity[0]/uni_liquidity[1])*ethPrice_inDai
  }else{
  uniPrice =(uni_liquidity[1]/uni_liquidity[0])*ethPrice_inDai
}
if(create_readible_number(((sushiPrice-uniPrice) / ((sushiPrice+uniPrice)/2)*100))>10
  ||
  create_readible_number(((sushiPrice-uniPrice) / ((sushiPrice+uniPrice)/2)*100))<-10){
  console.log(symbol, create_readible_number(((sushiPrice-uniPrice) / ((sushiPrice+uniPrice)/2)*100)),'%')
  alertTerminal()}
  else{
  console.log(symbol, create_readible_number(((sushiPrice-uniPrice) / ((sushiPrice+uniPrice)/2)*100)),'%')}
}

function create_readible_number(x) {
return Number.parseFloat(x).toFixed(2);
}

async function monitorDifference() {
  if(monitoringPrice) {return}
  ethPrice_inDai = await uniswapRouterContract.methods.getAmountsIn('1000000000000000000',(['0x6b175474e89094c44da98b954eedeac495271d0f','0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'])).call()
  ethPrice_inDai = web3.utils.fromWei(ethPrice_inDai[0].toString())
  let time = moment().tz('America/Chicago').format()
  currentgasPrice = await web3.eth.getGasPrice()
  try {
    for (p in su_pairs) {
  await getPairDifference(su_pairs[p].sy, su_pairs[p].sP, su_pairs[p].uP)

    }
} catch (error) {
console.error(error)
return
}


monitoringPrice = false
}

async function getUniSushiPairs(){
 let sushi_pair
 let pairLength = await sushiFactoryContract.methods.allPairsLength().call()
 for (let i = 0; i < pairLength; i++) {
   let pair = await sushiFactoryContract.methods.allPairs(i).call()
   let SUSHI_PAIR_ADDRESS = pair
   let sushiPairContract = new web3.eth.Contract(SUSHIPAIR_ABI,SUSHI_PAIR_ADDRESS)
   try{
   let sushipairs0address = await sushiPairContract.methods.token0().call()
   let sushipairs1address = await sushiPairContract.methods.token1().call()
   let liquidity = await sushiPairContract.methods.getReserves().call()
   if (sushipairs0address.toLowerCase()=='0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'){
     let real_liquidity = web3.utils.fromWei(liquidity[0])
     if(web3.utils.fromWei(liquidity[0])>3){
     let sushiPairToken1Contract = new web3.eth.Contract(ERC20_ABI,sushipairs1address)
     let pairssymbol = await sushiPairToken1Contract.methods.symbol().call()
     let uniPairToken = await uniswapFactoryContract.methods.getPair('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',sushipairs1address).call()
     if(uniPairToken.toLowerCase()=='0x0000000000000000000000000000000000000000'){}else{
     let uniPairContract = new web3.eth.Contract(UNI_PAIR_ABI,uniPairToken)
     let unipairs0address = await uniPairContract.methods.token0().call()
     if(unipairs0address.toLowerCase=='0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'){
       let liquidity = await uniPairContract.methods.getReserves().call()
     if(web3.utils.fromWei(liquidity[0])>3){
       sushi_pair = 'symbol: '
       sushi_pair+=pairssymbol
       sushi_pair+=' address: '
       sushi_pair+=sushipairs1address
       sushi_pair+=' sushiPair: '
       sushi_pair+=pair
       sushi_pair+=' uniPair: '
       sushi_pair+=uniPairToken
       console.log(pairssymbol, sushipairs1address, pair, uniPairToken)
       sushi_pairArray.push({sushi_pair})
     }
     }
     else{
       let liquidity = await uniPairContract.methods.getReserves().call()
     if(web3.utils.fromWei(liquidity[1])>3){
     sushi_pair = 'symbol: '
     sushi_pair+=pairssymbol
     sushi_pair+=' address: '
     sushi_pair+=sushipairs1address
     sushi_pair+=' sushiPair: '
     sushi_pair+=pair
     sushi_pair+=' uniPair: '
     sushi_pair+=uniPairToken
     console.log(pairssymbol, sushipairs1address, pair, uniPairToken)
     sushi_pairArray.push({sushi_pair})
     }
}
      }
    }}
   if (sushipairs1address.toLowerCase()=='0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'){
     let real_liquidity = web3.utils.fromWei(liquidity[1])
     if(web3.utils.fromWei(liquidity[1])>3){
       let sushiPairToken0Contract = new web3.eth.Contract(ERC20_ABI,sushipairs0address)
       let pairssymbol = await sushiPairToken0Contract.methods.symbol().call()
       let uniPairToken = await uniswapFactoryContract.methods.getPair('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',sushipairs0address).call()
       if(uniPairToken.toLowerCase()=='0x0000000000000000000000000000000000000000'){}else{
         let uniPairContract = new web3.eth.Contract(UNI_PAIR_ABI,uniPairToken)
         let unipairs0address = await uniPairContract.methods.token0().call()
         if(unipairs0address.toLowerCase=='0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'){
           let liquidity = await uniPairContract.methods.getReserves().call()
         if(web3.utils.fromWei(liquidity[0])>3){
           sushi_pair = 'symbol: '
           sushi_pair+=pairssymbol
           sushi_pair+=' address: '
           sushi_pair+=sushipairs0address
           sushi_pair+=' sushiPair: '
           sushi_pair+=pair
           sushi_pair+=' uniPair: '
           sushi_pair+=uniPairToken
           console.log(pairssymbol, sushipairs0address, pair, uniPairToken)
           sushi_pairArray.push({sushi_pair})
         }
         }
         else{
           let liquidity = await uniPairContract.methods.getReserves().call()
         if(web3.utils.fromWei(liquidity[1])>3){
         sushi_pair = 'symbol: '
         sushi_pair+=pairssymbol
         sushi_pair+=' address: '
         sushi_pair+=sushipairs0address
         sushi_pair+=' sushiPair: '
         sushi_pair+=pair
         sushi_pair+=' uniPair: '
         sushi_pair+=uniPairToken
         console.log(pairssymbol, sushipairs0address, pair, uniPairToken)
         sushi_pairArray.push({sushi_pair})
         }
    }
     }}

   }


}catch(e){
  console.log(e)
  continue;

}
}

/*
 sushi_pairArray.sort(function(a,b){
    return a.pairings.localeCompare(b.pairings);
})
*/
fs.writeFileSync('./abis/erc20/pairs.txt', JSON.stringify(sushi_pairArray));

}

/*
async function getUniPairs(){
 let pairLength = await pancakeswapFactoryContract.methods.allPairsLength().call()
 for (let i = 0; i < pairsize; i++) {
   let pair = await pancakeswapFactoryContract.methods.allPairs(i).call()
   let UNI_PAIR_ADDRESS = pair
   let pancakePairContract = new web3.eth.Contract(UNI_PAIR_ABI,UNI_PAIR_ADDRESS)

   //let liquidity = await pancakePairContract.methods.getReserves().call()
   //let real_liquidity = web3.utils.fromWei(liquidity[1])
   //console.log('LIQUIDITY', web3.utils.fromWei(liquidity[1]),'Ether');
   try{
   let pairs0 = await pancakePairContract.methods.token0().call()
   let PAIR_ADDRESS0 = pairs0
   let pancakePairToken0Contract = new web3.eth.Contract(ERC20_ABI,PAIR_ADDRESS0)
   let pairs0symbol = await pancakePairToken0Contract.methods.symbol().call()

   let pairs1 = await pancakePairContract.methods.token1().call()
   let PAIR_ADDRESS1 = pairs1
   let pancakePairToken1Contract = new web3.eth.Contract(ERC20_ABI,PAIR_ADDRESS1)
   let pairs1symbol = await pancakePairToken1Contract.methods.symbol().call()


  console.log('Pair',i, pairs0symbol,pairs1symbol)
  const pancake_pair = pairs0symbol+'-'+pairs1symbol
  pancake_pairArray.push({pancake_pair})
}catch(e){
  console.log(e)
  continue;

}}

combined_Array.push(sushi_pairArray.concat(pancake_pairArray));
combined_Array.sort(function(a,b){
    return a.pairings.localeCompare(b.pairings);
})
console.log(combined_Array)
fs.writeFileSync('./abis/erc20/pairs.txt', JSON.stringify(combined_Array));
}
//getUniPairs()
*/
async function createFile(arr){
await fs.writeFileSync('./abis/erc20/pairs.txt', arr.join('\n'));
}

function alertTerminal(){
  console.log("\007");
}

differenceMonitor = setInterval(async () => { await monitorDifference() }, 600000) //Calls monitorDifference function every 6 minutes