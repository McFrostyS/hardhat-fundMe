const { deployments, ethers, getNamedAccounts, network } = require('hardhat')
const { assert, expect } = require('chai')
const { developmentChains } = require('../../helper-hardhat-config')

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', () => {
      let fundMe
      let deployer
      let mockV3Aggregator
      const sendValue = ethers.parseEther('1')
      beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0].address
        await deployments.fixture(['all'])

        const fundMeDeployment = await deployments.get('FundMe')
        fundMe = await ethers.getContractAt(
          fundMeDeployment.abi,
          fundMeDeployment.address,
        )

        const mockV3AggregatorDeployment =
          await deployments.get('MockV3Aggregator')
        mockV3Aggregator = await ethers.getContractAt(
          mockV3AggregatorDeployment.abi,
          mockV3AggregatorDeployment.address,
        )
      })

      describe('constructor', () => {
        it('sets the aggregator addresses correctly', async () => {
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.target)
        })
      })

      describe('fund', () => {
        it('Fails if you dont send enough ETH', async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            'You need to spend more ETH!',
          )
        })

        it('Updated the amount funded data structure', async () => {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.getAddressToAmountFunded(deployer)
          assert.equal(response.toString(), sendValue.toString())
        })

        it('Add funder to array of funders', async () => {
          await fundMe.fund({ value: sendValue })
          const funder = await fundMe.getFunder(0)
          assert.equal(funder, deployer)
        })
      })

      describe('withdraw', () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })

        it('Withdraw ETH from a single funder', async () => {
          const fundMeDeployment = await deployments.get('FundMe')
          fundMe = await ethers.getContractAt(
            fundMeDeployment.abi,
            fundMeDeployment.address,
          )
          // Arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMeDeployment.address,
          )
          const startingDeployerBalance =
            await ethers.provider.getBalance(deployer)
          // Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, gasPrice } = transactionReceipt
          const gasCost = gasUsed * gasPrice

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMeDeployment.address,
          )
          const endingDeployerBalance =
            await ethers.provider.getBalance(deployer)

          // Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost,
          )
        })

        it('Only allow the owner to withdraw', async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          const attackerConnectedContract = fundMe.connect(attacker)
          await expect(
            attackerConnectedContract.withdraw(),
          ).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner')
        })
      })
    })
