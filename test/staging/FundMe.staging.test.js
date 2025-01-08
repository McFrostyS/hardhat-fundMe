const { getNamedAccounts, network } = require('hardhat')
const { developmentChains } = require('../../helper-hardhat-config')
const { assert } = require('chai')

developmentChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', async () => {
      let fundMe
      let deployer
      const sendValue = ethers.parseEther('1')

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer

        const fundMeDeployment = await deployments.get('FundMe')
        fundMe = await ethers.getContractAt(
          fundMeDeployment.abi,
          fundMeDeployment.address,
        )
      })

      it('allows people to fund and withdraw', async () => {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(endingBalance.toString(), '0')
      })
    })
