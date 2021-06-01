// SPDX-License-Identifier: GPL-3.0


pragma solidity ^0.6.12;

import "./IStakableTokenValidator.sol";
import "dexswap-core/contracts/interfaces/IDEXswapPair.sol";
import "dexswap-core/contracts/interfaces/IDEXswapFactory.sol";
import "dexswap-registry/contracts/dexTokenRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DefaultStakableTokenValidator is IStakableTokenValidator, Ownable {
    DEXTokenRegistry public dexTokenRegistry;
    uint256 public dexTokenRegistryListId;
    IDEXswapFactory public dexSwapFactory;

    constructor(
        address _dexTokenRegistryAddress,
        uint256 _dexTokenRegistryListId,
        address _dexSwapFactoryAddress
    ) public {
        require(
            _dexTokenRegistryAddress != address(0),
            "DefaultStakableTokenValidator: 0-address token registry address"
        );
        require(
            _dexTokenRegistryListId > 0,
            "DefaultStakableTokenValidator: invalid token list id"
        );
        require(
            _dexSwapFactoryAddress != address(0),
            "DefaultStakableTokenValidator: 0-address factory address"
        );
        dexTokenRegistry = DEXTokenRegistry(_dexTokenRegistryAddress);
        dexTokenRegistryListId = _dexTokenRegistryListId;
        dexSwapFactory = IDEXswapFactory(_dexSwapFactoryAddress);
    }

    function setDexTokenRegistry(address _dexTokenRegistryAddress)
        external
        onlyOwner
    {
        require(
            _dexTokenRegistryAddress != address(0),
            "DefaultStakableTokenValidator: 0-address token registry address"
        );
        dexTokenRegistry = DEXTokenRegistry(_dexTokenRegistryAddress);
    }

    function setDexTokenRegistryListId(uint256 _dexTokenRegistryListId)
        external
        onlyOwner
    {
        require(
            _dexTokenRegistryListId > 0,
            "DefaultStakableTokenValidator: invalid token list id"
        );
        dexTokenRegistryListId = _dexTokenRegistryListId;
    }

    function setDexSwapFactory(address _dexSwapFactoryAddress)
        external
        onlyOwner
    {
        require(
            _dexSwapFactoryAddress != address(0),
            "DefaultStakableTokenValidator: 0-address factory address"
        );
        dexSwapFactory = IDEXswapFactory(_dexSwapFactoryAddress);
    }

    function validateToken(address _stakableTokenAddress)
        external
        view
        override
    {
        require(
            _stakableTokenAddress != address(0),
            "DefaultStakableTokenValidator: 0-address stakable token"
        );
        IDEXswapPair _potentialDexSwapPair = IDEXswapPair(_stakableTokenAddress);
        address _token0;
        try _potentialDexSwapPair.token0() returns (address _fetchedToken0) {
            _token0 = _fetchedToken0;
        } catch {
            revert(
                "DefaultStakableTokenValidator: could not get token0 for pair"
            );
        }
        require(
            dexTokenRegistry.isTokenActive(dexTokenRegistryListId, _token0),
            "DefaultStakableTokenValidator: invalid token 0 in swapper pair"
        );
        address _token1;
        try _potentialDexSwapPair.token1() returns (address _fetchedToken1) {
            _token1 = _fetchedToken1;
        } catch {
            revert(
                "DefaultStakableTokenValidator: could not get token1 for pair"
            );
        }
        require(
            dexTokenRegistry.isTokenActive(dexTokenRegistryListId, _token1),
            "DefaultStakableTokenValidator: invalid token 1 in swapper pair"
        );
        require(
            dexSwapFactory.getPair(_token0, _token1) == _stakableTokenAddress,
            "DefaultStakableTokenValidator: pair not registered in factory"
        );
    }
}
