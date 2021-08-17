const Package = artifacts.require("Package");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Package", accounts => {
  let instance;

  it('should be deployed and exist', async () => {
    instance = await Package.deployed();
    const symbol = await instance.symbol.call();
    const name = await instance.name.call();

    assert.equal(symbol, 'PAC');
    assert.equal(name, 'Package');
    assert.isTrue(true);
  });

  it('should have no owners yet', async () => {
    const balanceAccount0 = await instance.balanceOf.call(accounts[0]);
    assert.equal(balanceAccount0, 0);
  });

  it('should have balance after minting', async () => {
    await instance.mintPackage({value: '123', from: accounts[0]});
    let balanceAccount0 = await instance.balanceOf(accounts[0]);
    let balanceAccount1 = await instance.balanceOf(accounts[1]);
    assert.equal(balanceAccount0, 1);
    assert.equal(balanceAccount1, 0);
  });

  it('should mint to the correct accounts', async () => {
    const ownerOf1 = await instance.ownerOf(1);
    assert.equal(ownerOf1, accounts[0]);
  });

});
