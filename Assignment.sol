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
        bool exist;
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
        address customerAddress;
        uint ratingTime;
        Rate taste;
        Rate fragrance;
        Rate creaminess;
    }

    struct Worker {
        uint workerID;
        string name;
        WorkedFor workedFor;
    }

    struct DurianFarm {
        string id;
        string name;
        string location;
        uint256 durianTreeCount;
    }

    struct DurianTree {
        string id;
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

    modifier isOwner(address sender) {
        require(sender == owner);
        _;
    }

    modifier durianFarmExist(uint256 _durianFarmID) {
        require(_durianFarmID != 0);
        _;
    }

    modifier durianTreeExist(uint256 _durianTreeID) {
        require(_durianTreeID != 0);
        _;
    }

    modifier durianExist(string memory _durianID) {
        require(durians[_durianID].exist == true);
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
        string memory _id,
        uint _age,
        string memory _species,
        uint256 _durianFarmID
    ) public isOwner(msg.sender) durianFarmExist(_durianFarmID) {
        durianTreesCount++;
        DurianTree memory t = durianTrees[durianTreesCount];
        t.id = _id;
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
        d.exist = true;

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

    mapping(address => Worker) public workerList;
    uint workerCount = 0;

    function addWorker(string memory _name, address workerAddress) public {
        Worker storage newWorker = workerList[workerAddress];
        newWorker.name = _name;
        newWorker.workerID = workerCount;
        workerCount++;
    }

    function recordDurian(
        Durian memory durian,
        address worker
    ) public view returns (string memory output) {
        if (durian.supplyChainStage == Stage.Harvested) {
            if (workerList[worker].workedFor == WorkedFor.DurianFarm) {
                //TODO what need to record
                durian.supplyChainStage = Stage.AtDistributionCenter;
                output = "Status changed to AtDistributionCenter";
                durian.stageTimestamps[1] = block.timestamp;
            }
        } else if (durian.supplyChainStage == Stage.AtDistributionCenter) {
            if (workerList[worker].workedFor == WorkedFor.DistributionCentre) {
                //TODO what need to record
                durian.supplyChainStage = Stage.AtRetailer;
                output = "Status changed to AtRetailer";
                durian.stageTimestamps[2] = block.timestamp;
            }
        } else if (durian.supplyChainStage == Stage.AtRetailer) {
            if (workerList[worker].workedFor == WorkedFor.Retailer) {
                //TODO what need to record
                durian.supplyChainStage = Stage.SoldToCustomer;
                output = "Status changed to SoldToCustomer";
                durian.stageTimestamps[3] = block.timestamp;
            }
        } else {
            output = "Invalid Input";
        }

        return output;

        // Harvested,
        // AtDistributionCenter,
        // AtRetailer,
        // SoldToCustomer,
        // Expired

        // DurianFarm,
        // DistributionCentre,
        // Retailer
    }

    // Consumer Functions
    function traceDurianProvenance(
        string memory durianID
    )
        public
        view
        durianExist(durianID)
        returns (
            string memory durianFarmName,
            string memory durianFarmLocation,
            string memory durianTreeSpecies,
            string memory durianTreeID,
            uint harvestTime,
            uint distributionCenterTime,
            uint retailerTime,
            uint soldTime
        )
    {
        Durian memory d = durians[durianID];
        durianFarmName = d.farm.name;
        durianFarmLocation = d.farm.location;
        durianTreeID = d.tree.id;
        harvestTime = d.stageTimestamps[0];
        distributionCenterTime = d.stageTimestamps[1];
        retailerTime = d.stageTimestamps[2];
        soldTime = d.stageTimestamps[3];
    }

    function rateDurian(
        string memory durianID,
        Rate tasteRating,
        Rate fragranceRating,
        Rate creaminessRating
    ) public durianExist(durianID) {
        Rating memory r = Rating(
            msg.sender,
            block.timestamp,
            tasteRating,
            fragranceRating,
            creaminessRating
        );
        durians[durianID].customerRating = r;
    }
}
