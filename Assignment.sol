//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DTTBA {

    uint256 public durianCount = 0;
    uint256 public durianFarmCount = 0;
    uint256 public durianFarmSectorCount = 0;

    Durian[] durians;
    struct Durian {
        uint256 id;
        uint256 weightGrams;
        DurianGrade grade;
        Stage stage;
    }

    enum DurianGrade {
        Extra, 
        ClassI, 
        ClassII
    }
    
    // Timestamps for the four stages
    uint[] stageTimestamps;

    enum Stage {
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
    Rating[] ratings;
    DurianFarm public farm; 
    DurianTree public tree;

    struct Rating {
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

    struct Worker{
        string workerID;
    }

    struct DurianFarm{
        string farmID;
        string name;
        string location;
    }

    struct DurianTree{
        string treeID;
        DurianFarm farm;
        uint age;
        string species;
        uint256 lastHarvestTime;
    }

    address owner;

    constructor() {
        owner = msg.sender;
        stageTimestamps[0] = block.timestamp;
    }

    modifier validStage(Stage reqStage) {
        require(currentStage == reqStage);
        _;
    }

    function addDurianFarm(string memory _farmID, string memory _name, string memory _location) public {

    }
}