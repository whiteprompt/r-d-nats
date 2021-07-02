const HDWalletProvider = require('truffle-hdwallet-provider');
const web3 = require('web3');

module.exports = class PackageContract {
  constructor (abiPath, contractAddress, networkEndpoint, options = {}) {
    if (!process.env.MNEMONIC && !options.mnemonic) {
      throw new Error('set environment variable MNEMONIC or pass a `mnemonic` option')
    }

    const MNEMONIC = process.env.MNEMONIC || options.mnemonic;
    const provider = new HDWalletProvider(MNEMONIC, networkEndpoint);
    this.abi = require(abiPath).abi;
    this.contractAddress = contractAddress.toUpperCase();
    this.web3Instance = new web3(provider);
    this.instance = new this.web3Instance.eth.Contract(
      this.abi,
      this.contractAddress,
      {gasLimit: '1000000'}
    );
    this.minterAccount = options.minterAccount;

  }

  async safeMint(tokenURI) {
    return await this.instance.methods
                              .safeMint(tokenURI, this.minterAccount)
                              .send({from: this.minterAccount});
  }

  async addUpdateTo(tokenId, stage) {
    return await this.instance.methods
      .addUpdateForPackage(tokenId, stage)
      .send({from: this.minterAccount});
  }
}
