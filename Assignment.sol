//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DTTBA {
    uint256 public durianCount = 0;
    mapping(uint => Durian) public durians;
    struct Durian {
        string id;
        string species;
        uint256 weightInGrams;
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
        uint workerID;
        string name;
        WorkedFor place;
    }

    struct DurianFarm {
        string name;
        string location;
        DurianTree[] durianTrees;
        uint256 durianTreeCount;
    }

    struct DurianTree{
        uint id;
        uint age;
        string species;
        uint256 lastHarvestTime;
    }

    address owner;

    constructor() {
        owner = msg.sender;
    }

    modifier isCorrectWorker(Worker memory worker, WorkedFor place){
        require(worker.place == place);
    }

    modifier isOwner(address sender) {
        require(sender == owner);
        _;
    }

    modifier isDurianFarmExist(uint256 _durianFarmID) {
        require(durianFarms[_durianFarmID] != false);
        _;
    }

    // modifier validStage(Stage reqStage) {
    //     require(currentStage == reqStage);
    //     _;
    // }

    mapping(uint => DurianFarm) public durianFarms;
    uint256 public durianFarmCount = 0;

    function addDurianFarm(string memory _name, string memory _location) public isOwner(msg.sender) {
        durianFarmCount++;
        DurianFarm storage newFarm = durianFarms[durianFarmCount];
        newFarm.name = _name;
        newFarm.location = _location;
        newFarm.durianTreeCount = 0;
    }

    function addDurian(
        string memory _id,
        string memory _species, 
        uint256 _weightInGrams, 
        uint256 _durianFarmID
    ) public {
        durianCount++;
        Durian storage d = durians[durianCount];
        d.id = _id;
        d.species = _species;
        d.weightInGrams = _weightInGrams;
        d.supplyChainStage = Stage.Harvested;
        d.stageTimestamps[0] = block.timestamp;
    }


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
