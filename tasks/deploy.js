const { task } = require("hardhat/config");

task( "deploy", "Deploys the whole contracts suite and verifies source code on Etherscan")

    .addParam("tokenRegistryAddress", "The token registry address")

    .addParam("tokenRegistryListId", "The token registry list id to be used to validate tokens")

    .addParam("factoryAddress", "The address of swapper's pairs factory")

    .setAction(async (taskArguments, hre) => {
        const {
            tokenRegistryAddress,
            tokenRegistryListId,
            factoryAddress,
        } = taskArguments;

        await hre.run("clean");
        await hre.run("compile");

        const DefaultRewardTokensValidator = hre.artifacts.require(
            "DefaultRewardTokensValidator"
        );
        const rewardTokensValidator = await DefaultRewardTokensValidator.new(
            tokenRegistryAddress,
            tokenRegistryListId
        );

        const DefaultStakableTokenValidator = hre.artifacts.require(
            "DefaultStakableTokenValidator"
        );
        const stakableTokenValidator = await DefaultStakableTokenValidator.new(
            tokenRegistryAddress,
            tokenRegistryListId,
            factoryAddress
        );


        const dexswapERC20StakingRewardsDistributionFactory = hre.artifacts.require(
            "DexswapERC20StakingRewardsDistributionFactory"
        );

        const factory = await dexswapERC20StakingRewardsDistributionFactory.new(
            rewardTokensValidator.address,
            stakableTokenValidator.address
        );


        console.log(`--------------------------------------------------------------------------`);
        console.log( `reward tokens validator deployed at address ${rewardTokensValidator.address}`);
        console.log(`--------------------------------------------------------------------------`);

        console.log(`--------------------------------------------------------------------------`);
        console.log( `stakable token validator deployed at address ${stakableTokenValidator.address}`);
        console.log(`--------------------------------------------------------------------------`);

        console.log(`--------------------------------------------------------------------------`);
        console.log(`factory deployed at address ${factory.address}`);
        console.log(`--------------------------------------------------------------------------`);
        console.log(`DONE : ALL SOURCE IS VERIFIED`);
    });
