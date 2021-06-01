require("../utils/assertion");
const BN = require("bn.js");
const { expect } = require("chai");
const { createswapperPair, getOrderedTokensInPair } = require("../utils");

const dexswapERC20StakingRewardsDistributionFactory = artifacts.require(
    "DexswapERC20StakingRewardsDistributionFactory"
);
const ERC20StakingRewardsDistribution = artifacts.require(
    "ERC20StakingRewardsDistribution"
);
const FirstRewardERC20 = artifacts.require("FirstRewardERC20");
const FirstStakableERC20 = artifacts.require("FirstStakableERC20");
const SecondStakableERC20 = artifacts.require("SecondStakableERC20");
const DEXTokenRegistry = artifacts.require("DEXTokenRegistry");
const DEXswapFactory = artifacts.require("DEXswapFactory");
const DEXswapPair = artifacts.require("DEXswapPair");
const DefaultRewardTokensValidator = artifacts.require(
    "DefaultRewardTokensValidator"
);
const DefaultStakableTokenValidator = artifacts.require(
    "DefaultStakableTokenValidator"
);

contract("dexswapERC20StakingRewardsDistributionFactory", () => {
    let swapperERC20DistributionFactoryInstance,
        dexTokenRegistryInstance,
        DEXFactoryInstance,
        rewardTokenInstance,
        firstStakableTokenInstance,
        secondStakableTokenInstance,
        defaultRewardTokensValidatorInstance,
        defaultStakableTokensValidatorInstance,
        ownerAddress;

    beforeEach(async () => {
        const accounts = await web3.eth.getAccounts();
        ownerAddress = accounts[1];
        DEXFactoryInstance = await DEXswapFactory.new(
            "0x0000000000000000000000000000000000000000" // we don't care about fee to setter
        );
        rewardTokenInstance = await FirstRewardERC20.new();
        firstStakableTokenInstance = await FirstStakableERC20.new();
        secondStakableTokenInstance = await SecondStakableERC20.new();
        dexTokenRegistryInstance = await DEXTokenRegistry.new();
        defaultRewardTokensValidatorInstance = await DefaultRewardTokensValidator.new(
            dexTokenRegistryInstance.address,
            1,
            { from: ownerAddress }
        );
        defaultStakableTokensValidatorInstance = await DefaultStakableTokenValidator.new(
            dexTokenRegistryInstance.address,
            1,
            DEXFactoryInstance.address,
            { from: ownerAddress }
        );
        swapperERC20DistributionFactoryInstance = await dexswapERC20StakingRewardsDistributionFactory.new(
            defaultRewardTokensValidatorInstance.address,
            defaultStakableTokensValidatorInstance.address,
            { from: ownerAddress }
        );
    });

    it("should fail when trying to deploy a factory with a 0-address reward tokens validator", async () => {
        try {
            await dexswapERC20StakingRewardsDistributionFactory.new(
                "0x0000000000000000000000000000000000000000",
                defaultStakableTokensValidatorInstance.address,
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "dexswapERC20StakingRewardsDistributionFactory: 0-address reward tokens validator"
            );
        }
    });

    it("should fail when trying to deploy a factory with a 0-address stakable tokens validator", async () => {
        try {
            await dexswapERC20StakingRewardsDistributionFactory.new(
                defaultRewardTokensValidatorInstance.address,
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
        } catch (error) {
            expect(error.message).to.contain(
                "dexswapERC20StakingRewardsDistributionFactory: 0-address stakable token validator"
            );
        }
    });

    it("should have the expected owner", async () => {
        expect(await swapperERC20DistributionFactoryInstance.owner()).to.be.equal(
            ownerAddress
        );
    });

    it("should fail when a non-owner tries to set a new reward tokens validator address", async () => {
        try {
            await swapperERC20DistributionFactoryInstance.setRewardTokensValidator(
                defaultRewardTokensValidatorInstance.address
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "Ownable: caller is not the owner"
            );
        }
    });

    it("should succeed when an owner sets a valid reward tokens validator address", async () => {
        expect(
            await swapperERC20DistributionFactoryInstance.rewardTokensValidator()
        ).to.be.equal(defaultRewardTokensValidatorInstance.address);
        const newAddress = "0x0000000000000000000000000000000000000aBc";
        await swapperERC20DistributionFactoryInstance.setRewardTokensValidator(
            newAddress,
            { from: ownerAddress }
        );
        expect(
            await swapperERC20DistributionFactoryInstance.rewardTokensValidator()
        ).to.be.equal(newAddress);
    });

    it("should fail when a non-owner tries to set a new stakable tokens validator address", async () => {
        try {
            await swapperERC20DistributionFactoryInstance.setStakableTokenValidator(
                defaultRewardTokensValidatorInstance.address
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "Ownable: caller is not the owner"
            );
        }
    });

    it("should succeed when setting a valid stakable tokens validator address", async () => {
        expect(
            await swapperERC20DistributionFactoryInstance.stakableTokenValidator()
        ).to.be.equal(defaultStakableTokensValidatorInstance.address);
        const newAddress = "0x0000000000000000000000000000000000000aBc";
        await swapperERC20DistributionFactoryInstance.setStakableTokenValidator(
            newAddress,
            { from: ownerAddress }
        );
        expect(
            await swapperERC20DistributionFactoryInstance.stakableTokenValidator()
        ).to.be.equal(newAddress);
    });

    it("should fail when setting a zero address as the supported reward tokens validator", async () => {
        try {
            await swapperERC20DistributionFactoryInstance.setRewardTokensValidator(
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "dexswapERC20StakingRewardsDistributionFactory: 0-address reward tokens validator"
            );
        }
    });

    it("should fail when setting a zero address as the supported stakable tokens validator", async () => {
        try {
            await swapperERC20DistributionFactoryInstance.setStakableTokenValidator(
                "0x0000000000000000000000000000000000000000",
                { from: ownerAddress }
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "dexswapERC20StakingRewardsDistributionFactory: 0-address stakable token validator"
            );
        }
    });

    it("should fail when trying to create a distribution with 0-address reward token", async () => {
        try {
            await swapperERC20DistributionFactoryInstance.createDistribution(
                ["0x0000000000000000000000000000000000000000"],
                "0x0000000000000000000000000000000000000000",
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultRewardTokensValidator: 0-address reward token"
            );
        }
    });

    it("should fail when trying to create a distribution with an unlisted reward token", async () => {
        try {
            // setting valid list on reward tokens validator
            await dexTokenRegistryInstance.addList("test");
            await defaultRewardTokensValidatorInstance.setDexTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            await swapperERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                "0x0000000000000000000000000000000000000000",
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultRewardTokensValidator: invalid reward token"
            );
        }
    });

    it("should fail when trying to create a distribution with 0-address stakable token", async () => {
        try {
            // listing reward token so that validation passes
            await dexTokenRegistryInstance.addList("test");
            await dexTokenRegistryInstance.addTokens(1, [
                rewardTokenInstance.address,
            ]);
            await swapperERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                "0x0000000000000000000000000000000000000000",
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokenValidator: 0-address stakable token"
            );
        }
    });

    it("should fail when trying to create a distribution with a swapper LP token related to a pair with an unlisted token0", async () => {
        try {
            const { token0Address, token1Address } = getOrderedTokensInPair(
                firstStakableTokenInstance.address,
                secondStakableTokenInstance.address
            );
            await dexTokenRegistryInstance.addList("test");
            await dexTokenRegistryInstance.addTokens(1, [
                rewardTokenInstance.address,
                token1Address,
            ]);
            await defaultRewardTokensValidatorInstance.setDexTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            const lpTokenAddress = await createswapperPair(
                DEXFactoryInstance,
                token0Address,
                token1Address
            );
            // setting valid list on stakable tokens validator
            await defaultStakableTokensValidatorInstance.setDexTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            await swapperERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                lpTokenAddress,
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokenValidator: invalid token 0 in swapper pair"
            );
        }
    });

    it("should fail when trying to create a distribution with a swapper LP token related to a pair with an unlisted token1", async () => {
        try {
            const { token0Address, token1Address } = getOrderedTokensInPair(
                firstStakableTokenInstance.address,
                secondStakableTokenInstance.address
            );
            await dexTokenRegistryInstance.addList("test");
            await dexTokenRegistryInstance.addTokens(1, [
                rewardTokenInstance.address,
                token0Address,
            ]);
            await defaultRewardTokensValidatorInstance.setDexTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            const lpTokenAddress = await createswapperPair(
                DEXFactoryInstance,
                token0Address,
                token1Address
            );
            // setting valid list on stakable tokens validator
            await defaultStakableTokensValidatorInstance.setDexTokenRegistryListId(
                1,
                { from: ownerAddress }
            );
            await swapperERC20DistributionFactoryInstance.createDistribution(
                [rewardTokenInstance.address],
                lpTokenAddress,
                ["1"],
                Math.floor(Date.now() / 1000) + 1000,
                Math.floor(Date.now() / 1000) + 2000,
                false
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "DefaultStakableTokenValidator: invalid token 1 in swapper pair"
            );
        }
    });

    it("should succeed when trying to create a distribution with a stakable token that represents a swapper pair with both tokens listed", async () => {
        // listing reward token so that validation passes
        await dexTokenRegistryInstance.addList("test");
        await dexTokenRegistryInstance.addTokens(1, [
            rewardTokenInstance.address,
        ]);
        // listing both one stakable tokens
        await dexTokenRegistryInstance.addTokens(1, [
            firstStakableTokenInstance.address,
        ]);
        await dexTokenRegistryInstance.addTokens(1, [
            secondStakableTokenInstance.address,
        ]);
        // setting validation token list to correct id for validators. This has
        // already been done in the before each hook, but redoing it here for
        // clarity
        await defaultRewardTokensValidatorInstance.setDexTokenRegistryListId(1, {
            from: ownerAddress,
        });
        await defaultStakableTokensValidatorInstance.setDexTokenRegistryListId(
            1,
            { from: ownerAddress }
        );
        const { token0Address, token1Address } = getOrderedTokensInPair(
            firstStakableTokenInstance.address,
            secondStakableTokenInstance.address
        );
        // creating pair on swapper. Both tokens are listed
        const createdPairAddress = await createswapperPair(
            DEXFactoryInstance,
            token0Address,
            token1Address
        );
        const createdPairInstance = await DEXswapPair.at(createdPairAddress);
        expect(await createdPairInstance.token0()).to.be.equal(token0Address);
        expect(await createdPairInstance.token1()).to.be.equal(token1Address);
        expect(await createdPairInstance.factory()).to.be.equal(
            DEXFactoryInstance.address
        );
        // minting approving reward tokens to avoid balance and allowance-related fails
        const rewardAmount = new BN(web3.utils.toWei("1"));
        await rewardTokenInstance.mint(ownerAddress, rewardAmount);
        await rewardTokenInstance.approve(
            swapperERC20DistributionFactoryInstance.address,
            rewardAmount,
            { from: ownerAddress }
        );
        const startingTimestamp = new BN(Math.floor(Date.now() / 1000) + 1000);
        const endingTimestamp = new BN(Math.floor(Date.now() / 1000) + 2000);
        const duration = endingTimestamp.sub(startingTimestamp);
        await swapperERC20DistributionFactoryInstance.createDistribution(
            [rewardTokenInstance.address],
            createdPairAddress,
            [rewardAmount],
            startingTimestamp,
            endingTimestamp,
            false,
            { from: ownerAddress }
        );
        expect(
            await swapperERC20DistributionFactoryInstance.getDistributionsAmount()
        ).to.be.equalBn(new BN(1));
        const erc20DistributionInstance = await ERC20StakingRewardsDistribution.at(
            await swapperERC20DistributionFactoryInstance.distributions(0)
        );
        expect(await erc20DistributionInstance.initialized()).to.be.true;

        // reward token related checks
        const onchainRewardTokens = await erc20DistributionInstance.getRewardTokens();
        expect(onchainRewardTokens).to.have.length(1);
        expect(onchainRewardTokens[0]).to.be.equal(rewardTokenInstance.address);
        expect(
            await erc20DistributionInstance.rewardTokenMultiplier(
                rewardTokenInstance.address
            )
        ).to.be.equalBn(new BN(10).pow(await rewardTokenInstance.decimals()));
        expect(
            await rewardTokenInstance.balanceOf(
                erc20DistributionInstance.address
            )
        ).to.be.equalBn(rewardAmount);
        expect(
            await erc20DistributionInstance.rewardAmount(
                rewardTokenInstance.address
            )
        ).to.be.equalBn(rewardAmount);
        expect(
            await erc20DistributionInstance.rewardPerSecond(
                rewardTokenInstance.address
            )
        ).to.be.equalBn(new BN(rewardAmount).div(duration));

        // stakable token related checks
        expect(await erc20DistributionInstance.stakableToken()).to.be.equal(
            createdPairAddress
        );

        const onchainStartingTimestamp = await erc20DistributionInstance.startingTimestamp();
        expect(onchainStartingTimestamp).to.be.equalBn(startingTimestamp);
        const onchainEndingTimestamp = await erc20DistributionInstance.endingTimestamp();
        expect(
            onchainEndingTimestamp.sub(onchainStartingTimestamp)
        ).to.be.equalBn(duration);
    });
});
