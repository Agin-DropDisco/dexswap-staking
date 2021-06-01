require("dotenv").config();
require("@nomiclabs/hardhat-truffle5");
require("solidity-coverage");
require("hardhat-gas-reporter");
require('@nomiclabs/hardhat-ethers');
require("./tasks/deploy");

const infuraId = process.env.INFURA_ID;

module.exports = {
    networks: {
        mainnet: {
            url: `https://mainnet.infura.io/v3/${infuraId}`,
        },
        rinkeby: {
            url:`https://rinkeby.infura.io/v3/${infuraId}`,
            accounts: [process.env.PRIVATE_KEY],
            network_id: '4',
            gasPrice: 1000000000,
            timeout: 100000,
        },
        moonalpha: {
            url:"https://rpc.testnet.moonbeam.network",
            accounts: [process.env.PRIVATE_KEY],
            network_id: 1287,
            gasPrice: 0,
            timeout: 100000,
        },
        oasis: {
            url:"https://rpc.oasiseth.org:8545",
            accounts: [process.env.PRIVATE_KEY],
            network_id: 69,
            gasPrice: 0,
            gas: 1000000000,
            timeout: 100000,
        },
        matic: {
            url:"https://rpc-mumbai.matic.today",
            accounts: [process.env.PRIVATE_KEY],
            network_id: 80001,
            gasPrice: 0,
            gas: 1000000000,
            timeout: 100000,
        }

    },
    solidity: {
        compilers: [
            {
                version: "0.6.12",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.5.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    gasReporter: {
        currency: "ETHER",
        enabled: process.env.GAS_REPORT_ENABLED === "true",
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
};
