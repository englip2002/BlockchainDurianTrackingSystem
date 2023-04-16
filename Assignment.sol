//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Durian {
    struct worker{
        string workerID;
        
    }

    struct durianTree{
        string treeID;
        durianFarm farm;
        durianFarmSector farmSector;
        uint256 age;
        string species;
        uint256 lastHarvestTime;
    }

    struct durianFarm{
        string farmID;
        string name;
        string location;
        durianFarmSector[] sectors;
    }

    struct durianFarmSector{
        string farmSectorID;
        uint256 duringTreeCount;
    }

    constructor() {
        
    }
}