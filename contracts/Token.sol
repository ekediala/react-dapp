//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
    string public name = "Jackpot Baby Token";
    string public symbol = "JBT";
    uint256 public totalSupply = 16000000;
    mapping(address => uint256) balances;

    constructor() {
        balances[msg.sender] = totalSupply;
        console.log("Sender:", msg.sender);
    }

    function transfer(address to, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Not enough tokens");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}
