// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FinanceVault (VAULTX)
 * @author VAULTX Protocol Core Team
 * @notice A secure, transparent, decentralized finance vault contract designed for
 *         self-custody Ethereum asset management.
 * @dev Implements strict Checks-Effects-Interactions pattern, OpenZeppelin ReentrancyGuard,
 *      and per-account balance isolation. Contains NO administrative backdoors or arbitrary
 *      owner withdrawal privileges.
 */
contract FinanceVault is ReentrancyGuard {
    // =========================================================================
    // CUSTOM ERRORS
    // =========================================================================

    /// @notice Thrown when an operation is attempted with zero ETH.
    error ZeroAmount();

    /// @notice Thrown when a withdrawal amount exceeds the caller's available balance.
    /// @param requested The amount of ETH requested for withdrawal.
    /// @param available The caller's current vault balance.
    error InsufficientBalance(uint256 requested, uint256 available);

    /// @notice Thrown when the low-level ETH transfer to the caller fails.
    error TransferFailed();

    // =========================================================================
    // EVENTS
    // =========================================================================

    /// @notice Emitted whenever a user successfully deposits ETH into the vault.
    /// @param user The address of the depositor.
    /// @param amount The amount of ETH deposited in wei.
    /// @param timestamp The block timestamp at the moment of deposit.
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);

    /// @notice Emitted whenever a user successfully withdraws ETH from the vault.
    /// @param user The address of the withdrawer.
    /// @param amount The amount of ETH withdrawn in wei.
    /// @param timestamp The block timestamp at the moment of withdrawal.
    event Withdrawal(address indexed user, uint256 amount, uint256 timestamp);

    // =========================================================================
    // STATE VARIABLES
    // =========================================================================

    /// @notice Current active vault balance per user address.
    mapping(address => uint256) public balances;

    /// @notice Cumulative lifetime ETH deposited per user address.
    mapping(address => uint256) public userDeposited;

    /// @notice Cumulative lifetime ETH withdrawn per user address.
    mapping(address => uint256) public userWithdrawn;

    /// @notice Global lifetime cumulative ETH deposited across all users.
    uint256 public totalVaultDeposited;

    /// @notice Global lifetime cumulative ETH withdrawn across all users.
    uint256 public totalVaultWithdrawn;

    // =========================================================================
    // EXTERNAL / PUBLIC FUNCTIONS
    // =========================================================================

    /**
     * @notice Deposit native ETH into the caller's vault account.
     * @dev Transaction value must be greater than zero. Updates caller's balance
     *      and lifetime deposit statistics.
     */
    function deposit() external payable nonReentrant {
        if (msg.value == 0) {
            revert ZeroAmount();
        }

        uint256 amount = msg.value;

        // State accounting (Effects)
        balances[msg.sender] += amount;
        userDeposited[msg.sender] += amount;
        totalVaultDeposited += amount;

        emit Deposit(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Withdraw a specified amount of ETH from the caller's vault balance.
     * @dev Adheres strictly to Checks-Effects-Interactions and nonReentrant protection.
     * @param amount The amount of ETH in wei to withdraw.
     */
    function withdraw(uint256 amount) external nonReentrant {
        // 1. Checks
        if (amount == 0) {
            revert ZeroAmount();
        }

        uint256 currentBalance = balances[msg.sender];
        if (amount > currentBalance) {
            revert InsufficientBalance(amount, currentBalance);
        }

        // 2. Effects (Update internal state BEFORE external transfer)
        balances[msg.sender] = currentBalance - amount;
        userWithdrawn[msg.sender] += amount;
        totalVaultWithdrawn += amount;

        emit Withdrawal(msg.sender, amount, block.timestamp);

        // 3. Interactions (Execute safe low-level transfer)
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    // =========================================================================
    // VIEW FUNCTIONS
    // =========================================================================

    /**
     * @notice Returns the active vault balance of the caller.
     * @return The caller's deposited balance in wei.
     */
    function getMyBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    /**
     * @notice Returns the active vault balance of any specific address.
     * @param user The address to query.
     * @return The user's deposited balance in wei.
     */
    function getUserBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /**
     * @notice Returns complete account statistics for a user.
     * @param user The address to query.
     * @return currentBalance Current active balance in wei.
     * @return depositedTotal Lifetime deposited ETH in wei.
     * @return withdrawnTotal Lifetime withdrawn ETH in wei.
     */
    function getUserStats(address user)
        external
        view
        returns (
            uint256 currentBalance,
            uint256 depositedTotal,
            uint256 withdrawnTotal
        )
    {
        return (balances[user], userDeposited[user], userWithdrawn[user]);
    }

    /**
     * @notice Returns the global cumulative ETH deposited across the vault lifecycle.
     * @return Total deposited amount in wei.
     */
    function getTotalDeposited() external view returns (uint256) {
        return totalVaultDeposited;
    }

    /**
     * @notice Returns the global cumulative ETH withdrawn across the vault lifecycle.
     * @return Total withdrawn amount in wei.
     */
    function getTotalWithdrawn() external view returns (uint256) {
        return totalVaultWithdrawn;
    }

    /**
     * @notice Returns the current total ETH balance held in the contract.
     * @dev Corresponds to Total Value Locked (TVL).
     * @return The contract's native balance in wei.
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Direct deposits via plain ETH transfer are routed to deposit().
     */
    receive() external payable {
        if (msg.value == 0) {
            revert ZeroAmount();
        }

        uint256 amount = msg.value;
        balances[msg.sender] += amount;
        userDeposited[msg.sender] += amount;
        totalVaultDeposited += amount;

        emit Deposit(msg.sender, amount, block.timestamp);
    }
}
