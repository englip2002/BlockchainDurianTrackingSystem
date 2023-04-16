//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DTTBA {
    uint256 public durianCount = 0;
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

    enum WorkedFor {
        DurianFarm,
        DistributionCentre,
        Retailer
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

    struct Worker {
        string workerID;
        string name;
        WorkedFor works;
    }

    struct DurianFarm {
        string name;
        string location;
        mapping(uint => DurianTree) durianTrees;
        uint256 durianTreeCount;
    }

    struct DurianTree {
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

    mapping(uint => DurianFarm) public durianFarms;
    uint256 public durianFarmCount;

    function addDurianFarm(
        string memory _name,
        string memory _location
    ) public {}

    function addDurian(
        string memory species,
        uint256 weightInGrams,
        uint256 durianFarmID
    ) public {}

    function addDurianTree(
        string memory _treeID,
        DurianFarm memory _farm,
        uint _age,
        string memory _species,
        uint256 _lastHarvestTime
    ) public {}

    mapping(uint => Worker) public workerList;
    uint workerCount = 0;

    function addWorker(string memory _name) public {
        Worker storage newWorker = workerList[workerCount];
        newWorker.name = _name;
        newWorker.workerID = workerCount;
        workerCount++;
    }
}
