const { assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", async function () {
          let deployer
          let fundMe
          const sendValue = ethers.utils.parseEther("0.0039")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer) // assuming it is already deployed
          })

          it("allows people to fund and withdraw", async function () {
            const transactionResponse = await fundMe.fund({ value: sendValue })
            await transactionResponse.wait(1)
            await fundMe.withdraw();

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            console.log(
                endingFundMeBalance.toString() +
                    " should equal 0, running assert equal..."
            )
            assert.equal(endingFundMeBalance.toString(), "0")
          })
      })