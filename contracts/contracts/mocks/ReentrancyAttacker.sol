// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IFinanceVault {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function getMyBalance() external view returns (uint256);
}

/**
 * @title ReentrancyAttacker
 * @dev Mock malicious contract designed to test reentrancy resistance in FinanceVault.
 */
contract ReentrancyAttacker {
    IFinanceVault public immutable vault;
    uint256 public attackCount;

    constructor(address _vaultAddress) {
        vault = IFinanceVault(_vaultAddress);
    }

    // Function to initiate attack
    function initiateAttack() external payable {
        require(msg.value > 0, "Need ETH to attack");
        vault.deposit{value: msg.value}();
        vault.withdraw(msg.value);
    }

    // Fallback attempts recursive reentrancy
    receive() external payable {
        attackCount++;
        if (address(vault).balance >= msg.value && attackCount < 3) {
            vault.withdraw(msg.value);
        }
    }
}
