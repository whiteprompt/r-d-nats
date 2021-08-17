const Package = artifacts.require('Package');

module.exports = function(deployer) {
  deployer.deploy(Package);
};
