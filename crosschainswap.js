
/*
const cross_pairs = [
  { symbol: 'ALCX',   bi_address:  '0xdbdb4d16eda451d0503b854cf79d55697f90c8df', eth_address: '0xdbdb4d16eda451d0503b854cf79d55697f90c8df', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'ALEPH',  eth_address: '0x27702a26126e0b3702af63ee09ac4d1a084ef628', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'ALPHA',  eth_address: '0xa1faa113cbe53436df28ff0aee54275c13b40975', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'AMPL',   eth_address: '0xd46ba6d942050d489dbd938a2c909a5d5039a161', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'ANY' ,   eth_address: '0xf99d58e463a2e07e5692127302c20a191861b4d6', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'API3',   eth_address: '0x0b38210ea11411557c13457d4da7dc6ea731b88a', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'ARMOR',  eth_address: '0x1337def16f9b486faed0293eb623dc8395dfe46a', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'AXS' ,   eth_address: '0xf5d669627376ebd411e34b98f19c868c8aba5ada', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'ARCH',   eth_address: '0x1f3f9d3068568f8040775be2e8c03c103c61f3af', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'BAO',    eth_address: '0x374cb8c27130e2c9e04f44303f3c8351b9de61c1', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'BAL' ,   eth_address: '0xba100000625a3754423978a60c9317c58a424e3d', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'COMBO',  eth_address: '0xffffffff2ba8f66d4e51811c5190992176930278', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'COMP',   eth_address: '0xc00e94cb662c3520282e6f5717214004a7f26888', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'COVER',  eth_address: '0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'CREAM',  eth_address: '0x2ba592F78dB6436527729929AAf6c908497cB200', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'CRV' ,   eth_address: '0xd533a949740bb3306d119cc777fa900ba034cd52', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'CVP',    eth_address: '0x38e4adb44ef08f22f5b5b76a8f0c2d0dcbe7dca1', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'DAI',    eth_address: '0x6b175474e89094c44da98b954eedeac495271d0f', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'DEXTF',  eth_address: '0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'DFD' ,   eth_address: '0x20c36f062a31865bed8a5b1e512d9a1a20aa333a', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'DFX',    eth_address: '0x888888435fde8e7d4c54cab67f206e4199454c60', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'DPI' ,   eth_address: '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'DUSD',   eth_address: '0x5bc25f649fc4e26069ddf4cf4010f9f706c23831', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'FARM',   eth_address: '0xa0246c9032bc3a600820415ae600c6388619a14d', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'FTM' ,   eth_address: '0x4e15361fd6b4bb609fa63c81a2be19d873717870', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'FTT' ,   eth_address: '0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'GNO' ,   eth_address: '0x6810e776880c02933d47db1b9fc05908e5386b96', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'HEGIC',  eth_address: '0x584bc13c7d411c00c01a62e8019472de68768430', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'ICHI',   eth_address: '0x903bef1736cddf2a537176cf3c64579c3867a881', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'INDEX',  eth_address: '0x0954906da0bf32d5479e25f46056d22f08464cab', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'IDLE',   eth_address: '0x875773784af8135ea0ef43b5a374aad105c5d39e', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'INJ',    eth_address: '0xe28b3b32b6c345a34ff64674606124dd5aceca30', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'INV' ,   eth_address: '0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'JRT' ,   eth_address: '0x8a9c67fee641579deba04928c4bc45f66e26343a', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'KP3R',   eth_address: '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'LINK',   eth_address: '0x514910771af9ca656af840dff83e8264ecf986ca', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'LON' ,   eth_address: '0x0000000000095413afc295d19edeb1ad7b71c952', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'MATIC',  eth_address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'MKR' ,   eth_address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'MPH' ,   eth_address: '0x8888801af4d980682e47f1a9036e589479e835c5', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'MTA' ,   eth_address: '0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'MUST',   eth_address: '0x6810e776880c02933d47db1b9fc05908e5386b96', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'OMG' ,   eth_address: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'PERP',   eth_address: '0xbc396689893d065f41bc2c6ecbee5e0085233447', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'PICKLE', eth_address: '0x429881672b9ae42b8eba0e26cd9c73711b891ca5', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },//
  { symbol: 'RARI',   eth_address: '0xfca59cd816ab1ead66534d82bc21e7515ce441cf', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'REN' ,   eth_address: '0x408e41876cccdc0f92210600ef50372656052a38', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'RGT' ,   eth_address: '0xd291e7a03283640fdc51b121ac401383a46cc623', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'RLC',    eth_address: '0x607f4c5bb672230e8672085532f7e901544a7375', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'ROOK',   eth_address: '0xfa5047c9c78b8877af97bdcb85db743fd7313d4a', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'SDT',    eth_address: '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'SECRET', eth_address: '0x2b89bf8ba858cd2fcee1fada378d5cd6936968be', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'SEEN',   eth_address: '0xca3fe04c7ee111f0bbb02c328c699226acf9fd33', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'SPANK',  eth_address: '0x42d6622dece394b54999fbd73d108123806f6a18', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'SRM' ,   eth_address: '0x476c5e26a75bd202a9683ffd34359c0cc15be0ff', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'STAKE',  eth_address: '0x0ae055097c6d159879521c384f1d2123d1f195e6', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'SUPER',  eth_address: '0xe53ec727dbdeb9e2d5456c3be40cff031ab40a55', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'SUSHI',  eth_address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'SX',     eth_address: '0x99fe3b1391503a1bc1788051347a1324bff41452', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'TORN' ,  eth_address: '0x77777feddddffc19ff86db637967013e6c6a116c', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'TRDL',   eth_address: '0x297d33e17e61c2ddd812389c2105193f8348188a', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'TRU',    eth_address: '0x4c19596f5aaff459fa38b0f7ed92f11ae6543784', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'TUSD' ,  eth_address: '0x0000000000085d4780b73119b644ae5ecd22b376', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'USDC',   eth_address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'UST' ,   eth_address: '0xa47c8bf37f92abed4a126bda807a7b7498661acd', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'UWL',    eth_address: '0xdbdd6f355a37b94e6c7d32fef548e98a280b8df5', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'VSP' ,   eth_address: '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'WBTC',   eth_address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'XFT',    eth_address: '0xabe580e7ee158da464b51ee1a83ac0289622e6be', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'YAM' ,   eth_address: '0x0aacfbec6a24756c20d41914f2caba817c0d8521', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'YFI' ,   eth_address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'YLD' ,   eth_address: '0xf94b5c5651c888d928439ab6514b93944eee6f48', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'YPIE',   eth_address: '0x17525e4f4af59fbc29551bc4ece6ab60ed49ce31', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' },
  { symbol: 'ZRX' ,   eth_address: '0xe41d2489571d322189246dafa5ebde1f4699f498', Uni:'TRUE', Sushi:'TRUE', Pancake:'TRUE', Burger:'TRUE', Bakery:'TRUE', Jul:'TRUE', Ape:'TRUE' }
];
*
