//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Durian {
    uint256 id;
    uint256 weightGrams;
    DurianGrade grade;

    enum DurianGrade {
        Extra, 
        ClassI, 
        ClassII
    }
    
    // Timestamps for the four stages
    uint[] stageTimestamps;
    
    enum Stages {
        Harvested, 
        AtDistributionCenter, 
        AtRetailer, 
        SoldToCustomer, 
        Expired
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
    Stages public currentStage;
    durianFarm public farm; 
    durianTree 

    struct rating {
        Customer ratingCustomer;
        Rate taste;
        Rate fragrance;
        Rate creaminess;
        Rate price; 
    }
    
    struct Customer {
        string id;
        string name;
        address addr;
    }


    struct worker{
        string workerID;
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

    address owner;

    constructor() {
        owner = msg.sender;
        stageTimestamps[0] = block.timestamp;
    }

    modifier validStage(Stages reqStage) {
        require(currentStage == reqStage);
        _;
    }

    function addDurianFarm(string memory _farmID, string memory _name, string memory _location) public {

    }
}