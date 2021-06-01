// SPDX-License-Identifier: GPL-3.0


pragma solidity ^0.6.12;

import "./IRewardTokensValidator.sol";
import "dexswap-registry/contracts/dexTokenRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DefaultRewardTokensValidator is IRewardTokensValidator, Ownable {
    DEXTokenRegistry public dexTokenRegistry;
    uint256 public dexTokenRegistryListId;

    constructor(address _dexTokenRegistryAddress, uint256 _dexTokenRegistryListId)
        public
    {
        require(
            _dexTokenRegistryAddress != address(0),
            "DefaultRewardTokensValidator: 0-address token registry address"
        );
        require(
            _dexTokenRegistryListId > 0,
            "DefaultRewardTokensValidator: invalid token list id"
        );
        dexTokenRegistry = DEXTokenRegistry(_dexTokenRegistryAddress);
        dexTokenRegistryListId = _dexTokenRegistryListId;
    }

    function setdexTokenRegistry(address _dexTokenRegistryAddress)
        external
        onlyOwner
    {
        require(
            _dexTokenRegistryAddress != address(0),
            "DefaultRewardTokensValidator: 0-address token registry address"
        );
        dexTokenRegistry = DEXTokenRegistry(_dexTokenRegistryAddress);
    }

    function setdexTokenRegistryListId(uint256 _dexTokenRegistryListId)
        external
        onlyOwner
    {
        require(
            _dexTokenRegistryListId > 0,
            "DefaultRewardTokensValidator: invalid token list id"
        );
        dexTokenRegistryListId = _dexTokenRegistryListId;
    }

    function validateTokens(address[] calldata _rewardTokens)
        external
        view
        override
    {
        require(
            _rewardTokens.length > 0,
            "DefaultRewardTokensValidator: 0-length reward tokens array"
        );
        for (uint256 _i = 0; _i < _rewardTokens.length; _i++) {
            address _rewardToken = _rewardTokens[_i];
            require(
                _rewardToken != address(0),
                "DefaultRewardTokensValidator: 0-address reward token"
            );
            require(
                dexTokenRegistry.isTokenActive(
                    dexTokenRegistryListId,
                    _rewardToken
                ),
                "DefaultRewardTokensValidator: invalid reward token"
            );
        }
    }
}
