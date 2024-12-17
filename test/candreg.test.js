const candreg = artifacts.require('./candreg.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('candreg', ([deployer, seller, buyer]) => {
  let candireg

  before(async () => {
    candireg = await candreg.deployed()
  })
 
  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await candireg.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await candireg.name()
      assert.equal(name, 'Candidate Contract')
    })
  })

  describe('candidates', async () => {
    let result, candidateCount

    before(async () => {
      result = await candireg.createCandidate('A', web3.utils.toWei('1', 'Ether'), { from: seller })
      candidateCount = await candireg.candidateCount()
    })

    it('creates candidate', async () => {
      // SUCCESS
      assert.equal(candidateCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), candidateCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'A', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, seller, 'owner is correct')
      assert.equal(event.purchased, false, 'purchased is correct')

      // FAILURE: Product must have a name
      await await candireg.createCandidate('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      // FAILURE: Product must have a price
      await await candireg.createCandidate('A', 0, { from: seller }).should.be.rejected;
    })

      // Check logs
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), candidateCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'A', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, buyer, 'owner is correct')
      assert.equal(event.purchased, true, 'purchased is correct')

      // Check that seller received funds
      let newSellerBalance
      newSellerBalance = await web3.eth.getBalance(seller)
      newSellerBalance = new web3.utils.BN(newSellerBalance)

      let price
      price = web3.utils.toWei('1', 'Ether')
      price = new web3.utils.BN(price)

      const exepectedBalance = oldSellerBalance.add(price)

      assert.equal(newSellerBalance.toString(), exepectedBalance.toString())

    })

  })

