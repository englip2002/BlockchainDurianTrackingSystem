//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Durian {
    uint256 id;
    uint256 weightGrams;
    string species;
    
    // Timestamps for the four stages
    uint[] stageTimestamps;
    
    enum Stages {
        Harvested, 
        AtDistributionCenter, 
        AtRetailer, 
        SoldToCustomer
    }

    enum Rate {
        Worst, 
        Bad, 
        Normal, 
        Good, 
        Excellent
    }

    // Ratings given to this durian by the customers
    rating[] ratings;

    struct rating {
        address ratingCustomer;
        Rate taste;
        Rate fragrance;
        Rate creaminess;
        Rate price; 
    }


    struct worker{
        string workerID;
        
    }

    struct Customer {
        
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