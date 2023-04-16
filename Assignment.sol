//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DTTBA {
    mapping(string => Durian) public durians;
    uint256 public durianCount = 0;

    struct Durian {
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
        AA,
        A,
        B
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
    }

    struct DurianTree {
        uint age;
        string species;
        uint256 lastHarvestTime;
        DurianFarm farm;
    }

    address owner;

    mapping(uint => DurianFarm) public durianFarms;
    uint256 public durianFarmCount = 0;

    mapping(uint => DurianTree) public durianTrees;
    uint256 public durianTreesCount = 0;

    constructor() {
        owner = msg.sender;
    }

    modifier isCorrectWorker(Worker memory worker, WorkedFor place) {
        require(worker.place == place);
    }

    modifier isOwner(address sender) {
        require(sender == owner);
        _;
    }

    modifier durianFarmExist(uint256 _durianFarmID) {
        require(_durianFarmID > 0 && _durianFarmID <= durianFarmCount);
        _;
    }

    modifier durianTreeExist(uint256 _durianTreeID) {
        require(_durianTreeID > 0 && _durianTreeID <= durianTreesCount);
        _;
    }

    modifier validDurianWeight(uint _weight) {
        require(_weight >= 0);
        _;
    }

    function addDurianFarm(
        string memory _name,
        string memory _location
    ) public isOwner(msg.sender) {
        durianFarmCount++;
        DurianFarm storage newFarm = durianFarms[durianFarmCount];
        newFarm.name = _name;
        newFarm.location = _location;
        newFarm.durianTreeCount = 0;
    }

    function addDurianTree(
        uint _age,
        string memory _species,
        uint256 _lastHarvestTime,
        uint256 _durianFarmID
    ) public isOwner(msg.sender) durianFarmExist(_durianFarmID) {
        durianTreesCount++;
        DurianTree memory t = durianTrees[durianTreesCount];
        t.age = _age;
        t.species = _species;
        t.lastHarvestTime = 0;
        t.farm = durianFarms[_durianFarmID];
    }

    function addDurian(
        string memory _id,
        string memory _species,
        uint256 _weightInGrams,
        uint256 _durianFarmID,
        uint256 _durianTreeID
    ) public durianFarmExist(_durianFarmID) durianTreeExist(_durianTreeID) {
        // Create new durian
        durianCount++;
        Durian memory d = durians[_id];
        d.species = _species;
        d.weightInGrams = _weightInGrams;
        d.supplyChainStage = Stage.Harvested;
        d.stageTimestamps[0] = block.timestamp;
        d.grade = determineDurianGrade(_weightInGrams);
        d.farm = durianFarms[_durianFarmID];
        d.tree = durianTrees[_durianTreeID];

        // Update durian tree info
        if (durianTrees[_durianTreeID].lastHarvestTime < block.timestamp) {
            durianTrees[_durianTreeID].lastHarvestTime = block.timestamp;
        }
    }

    function determineDurianGrade(
        uint weight
    ) private pure returns (DurianGrade grade) {
        if (weight >= 0 && weight <= 1200) return DurianGrade.B;
        else if (weight > 1200 && weight <= 2400) return DurianGrade.A;
        else return DurianGrade.AA;
    }

    mapping(uint => Worker) public workerList;
    uint workerCount = 0;

    function addWorker(string memory _name) public {
        Worker storage newWorker = workerList[workerCount];
        newWorker.name = _name;
        newWorker.workerID = workerCount;
        workerCount++;
    }
}
