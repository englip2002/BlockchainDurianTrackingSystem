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
        Stage supplyChainStage;
        uint[] stageTimestamps;
        DurianGrade grade;
        DurianFarm farm; 
        DurianTree tree;
        Rating customerRating;
    }

    enum DurianGrade {
        Extra, 
        ClassI, 
        ClassII
    }
    
    // Timestamps for the four stages

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

    struct Rating {
        Customer ratingCustomer;
        uint ratingTime;
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
    }

    // modifier validStage(Stage reqStage) {
    //     require(currentStage == reqStage);
    //     _;
    // }

    function addDurianFarm(string memory _farmID, string memory _name, string memory _location) public {

    }
}