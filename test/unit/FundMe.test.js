const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const {developmentChains} = require("../../helper-hardhat-config")


!developmentChains.includes(network.name) ?
    describe.skip:
    describe("FundMe", async function () {
    let fundMe, deployer, mockV3Aggregator, accounts
    const sendValue = ethers.utils.parseEther("1")

    beforeEach("", async function () {
        // deploy your fundme contract
        // using hardhat-deploy
        // await deployment.fixture (["fundme"]) // we just depoly fundme

        accounts = await ethers.getSigners()
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"]) // deploy all conntracts
        fundMe = await ethers.getContract("FundMe", deployer) // get us the most recent deployed fundme
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })

    describe("constructor", async function () {
        it("set the aggregator address correctly", async function () {
        const response = await fundMe.getPriceFeed()
        assert.equal(response, mockV3Aggregator.address)
        console.log(deployer)
        console.log(accounts[0].address)
        })
    })

    describe("fund", async function () {
        it("Fails if you don't send enough ether", async function () {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })

        it("update the amount funded data structure", async function () {
            await fundMe.fund({value: sendValue})
            const response = await fundMe.getAddressToAmountFunded(deployer)
            console.log(response)
            expect(response.toString()).to.be.equal(sendValue.toString())
        })

        it("adds funder to array of funders", async function () {
            await fundMe.fund({value: sendValue})
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({value: sendValue})
        })
        it("withdraw ETH from a single founder", async function () {
            // arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            // const 

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString() )
        })
        it('allows us to withdraw with multiple funders', async function() {
            // arrange
            const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++){
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
                )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
                )
            // assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString() )

            await expect(fundMe.getFunder(0)).to.be.reverted

            for( let i = 1; i < 6; i ++ ) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address), 0
                )
            }
        })
        it("only allows owners to cheaperWithdraw", async function() {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")

        })
        it('allows us to cheaperWithdraw with multiple funders', async function() {
            // arrange
            const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++){
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            )
            // act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const {gasUsed, effectiveGasPrice} = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
                )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
                )
            // assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString() )

            await expect(fundMe.getFunder(0)).to.be.reverted

            for( let i = 1; i < 6; i ++ ) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address), 0
                )
            }
        })
    })
    })

