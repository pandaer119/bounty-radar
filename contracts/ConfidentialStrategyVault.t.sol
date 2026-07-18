// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {ConfidentialStrategyVault} from "./ConfidentialStrategyVault.sol";

contract ConfidentialStrategyVaultTest {
    function testNewWalletHasNoStrategy() public {
        ConfidentialStrategyVault vault = new ConfidentialStrategyVault();
        (bytes32 handle, uint64 updatedAt) = vault.getStrategy(address(this));

        require(handle == bytes32(0), "new wallet handle must be empty");
        require(updatedAt == 0, "new wallet timestamp must be empty");
    }
}
