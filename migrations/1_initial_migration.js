var Migrations = artifacts.require("./Migrations.sol");
var DTTBA = artifacts.require("./DTTBA.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(DTTBA);
};
