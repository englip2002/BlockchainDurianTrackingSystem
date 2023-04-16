//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DTTBA {
    uint256 public durianCount = 0;
    mapping(uint => Durian) durians;
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
        uint256 durianTreeCount;
        mapping(uint => DurianTree) durianTrees;
    }

    struct DurianTree{
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
        require(_durianFarmID > 0 && _durianFarmID <= durianFarmCount);
        _;
    }

    modifier isDurianTreeExist(uint256 _durianFarmID, uint256 _durianTreeID) {
        uint c = durianFarms[_durianFarmID].durianTreeCount;
        require(_durianTreeID > 0 && _durianTreeID <= c);
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
        uint256 _durianFarmID, 
        uint256 _durianTreeID
    ) public 
    isDurianFarmExist(_durianFarmID) 
    isDurianTreeExist(_durianFarmID, _durianTreeID)
    {
        durianCount++;
        Durian storage d = durians[durianCount];
        d.id = _id;
        d.species = _species;
        d.weightInGrams = _weightInGrams;
        d.supplyChainStage = Stage.Harvested;
        d.stageTimestamps[0] = block.timestamp;

    }

    function determineDurianGrade(uint weight) pure returns(DurianGrade grade) {
        
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
