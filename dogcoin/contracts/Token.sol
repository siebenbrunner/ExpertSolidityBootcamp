// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract Token is ERC20 {
    address[] public holders;
    mapping(address => uint256) public holdersToIndices;

    constructor() ERC20("DogCoin", "DOGCOIN") {
        _addHolder(msg.sender);
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function _addHolder(address _holder) public {
      if(balanceOf(_holder) != 0) {
        return;
      }
      uint idx = holders.length;
      holders.push(_holder);
      holdersToIndices[_holder] = idx;
    }
}
