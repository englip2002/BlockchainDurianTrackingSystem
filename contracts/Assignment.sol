//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DTTBA {
    mapping(string => Durian) public durians;
    uint256 public durianCount = 0;

    struct Durian {
        uint256 weightInGrams;
        Stage supplyChainStage;
        uint[] stageTimestamps;
        DurianGrade grade;
        string durianFarmID;
        string durianTreeID;
        address boughtByCustomer;
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
        SoldToCustomer
    }

    enum Rate {
        Worst,
        Bad,
        Normal,
        Good,
        Excellent
    }

    enum WorkFor {
        None,
        DurianFarm,
        DistributionCentre,
        Retailer
    }

    // Ratings given to this durian by the customers

    struct Rating {
        uint ratingTime;
        string remark;
        Rate taste;
        Rate fragrance;
        Rate creaminess;
    }

    struct Worker {
        uint workerID;
        string name;
        WorkFor workedFor;
    }

    struct DurianFarm {
        string name;
        string location;
        uint256 durianTreeCount;
        bool exist;
    }

    struct DurianTree {
        uint age;
        string species;
        uint256 lastHarvestTime;
        string durianFarmID;
        bool exist;
    }

    address owner;

    mapping(string => DurianFarm) public durianFarms;
    uint256 public durianFarmCount = 0;

    mapping(string => DurianTree) public durianTrees;
    uint256 public durianTreesCount = 0;

    constructor() {
        owner = msg.sender;
    }

    // Verify message sender
    modifier isOwner(address sender) {
        require(sender == owner);
        _;
    }

    modifier isFarmWorker(address senderAddr) {
        require(workerList[senderAddr].workedFor == WorkFor.DurianFarm);
        _;
    }

    modifier isDistributionCenterWorker(address senderAddr) {
        require(workerList[senderAddr].workedFor == WorkFor.DistributionCentre);
        _;
    }

    modifier isRetailerWorker(address senderAddr) {
        require(workerList[senderAddr].workedFor == WorkFor.Retailer);
        _;
    }

    // Verify ID existence
    modifier durianFarmExist(string memory _durianFarmID) {
        require(durianFarms[_durianFarmID].exist);
        _;
    }

    modifier durianFarmNotExist(string memory _durianFarmID) {
        require(!durianFarms[_durianFarmID].exist);
        _;
    }

    modifier durianTreeExist(string memory _durianTreeID) {
        require(durianTrees[_durianTreeID].exist);
        _;
    }

    modifier durianTreeNotExist(string memory _durianTreeID) {
        require(!durianTrees[_durianTreeID].exist);
        _;
    }

    modifier durianExist(string memory _durianID) {
        require(durians[_durianID].exist);
        _;
    }

    modifier durianNotExist(string memory _durianID) {
        require(!durians[_durianID].exist);
        _;
    }

    // Others
    modifier validDurianWeight(uint _weight) {
        require(_weight >= 0);
        _;
    }

    modifier isDurianSold(string memory durianID) {
        require(durians[durianID].supplyChainStage == Stage.SoldToCustomer);
        _;
    }

    // Functions for workers and Owner
    function addDurianFarm(
        string memory _id,
        string memory _name,
        string memory _location
    ) public isOwner(msg.sender) {
        durianFarmCount++;
        durianFarms[_id] = DurianFarm({
            name: _name,
            location: _location,
            durianTreeCount: 0,
            exist: true
        });
    }

    function addDurianTree(
        string memory _id,
        uint _age,
        string memory _species,
        string memory _durianFarmID
    )
        public
        isOwner(msg.sender)
        durianTreeNotExist(_id)
        durianFarmExist(_durianFarmID)
    {
        durianTreesCount++;
        durianTrees[_id] = DurianTree({
            age: _age,
            species: _species,
            lastHarvestTime: 0,
            durianFarmID: _durianFarmID,
            exist: true
        });
    }

    function addDurian(
        string memory _id,
        uint256 _weightInGrams,
        string memory _durianFarmID,
        string memory _durianTreeID
    )
        public
        isFarmWorker(msg.sender)
        durianNotExist(_id)
        durianFarmExist(_durianFarmID)
        durianTreeExist(_durianTreeID)
    {
        // Create new durian
        durianCount++;
        Durian storage d = durians[_id];
        d.weightInGrams = _weightInGrams;
        d.supplyChainStage = Stage.Harvested;
        d.stageTimestamps.push(block.timestamp);
        d.grade = determineDurianGrade(_weightInGrams);
        d.durianFarmID = _durianFarmID;
        d.durianTreeID = _durianTreeID;
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

    function addWorker(string memory _name, address workerAddress, WorkFor _workFor) public {
        Worker storage newWorker = workerList[workerAddress];
        newWorker.name = _name;
        newWorker.workerID = workerCount;
        newWorker.workedFor = _workFor;
        workerCount++;
    }

    function recordDurian(
        string memory durianID
    ) public durianExist(durianID) returns (string memory output) {
        Durian storage durian = durians[durianID];
        address worker = msg.sender;
        if (
            durian.supplyChainStage == Stage.Harvested &&
            workerList[worker].workedFor == WorkFor.DurianFarm
        ) {
            //TODO what need to record
            durian.supplyChainStage = Stage.AtDistributionCenter;
            output = "Status changed to AtDistributionCenter";
            durian.stageTimestamps.push(block.timestamp);
        } else if (
            durian.supplyChainStage == Stage.AtDistributionCenter &&
            workerList[worker].workedFor == WorkFor.DistributionCentre
        ) {
            //TODO what need to record
            durian.supplyChainStage = Stage.AtRetailer;
            output = "Status changed to AtRetailer";
            durian.stageTimestamps.push(block.timestamp);
        } else if (
            durian.supplyChainStage == Stage.AtRetailer &&
            workerList[worker].workedFor == WorkFor.Retailer
        ) {
            //TODO what need to record
            durian.supplyChainStage = Stage.SoldToCustomer;
            output = "Status changed to SoldToCustomer";
            durian.stageTimestamps.push(block.timestamp);
        } else {
            output = "Invalid Input";
        }

        return output;
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
            uint[] memory _stageTimestamps
        )
    {
        Durian storage d = durians[durianID];
        durianFarmName = durianFarms[d.durianFarmID].name;
        durianFarmLocation = durianFarms[d.durianFarmID].location;
        durianTreeSpecies = durianTrees[d.durianTreeID].species;
        durianTreeID = d.durianTreeID;
        _stageTimestamps = d.stageTimestamps;
    }

    function rateDurian(
        string memory durianID,
        string memory remark,
        Rate tasteRating,
        Rate fragranceRating,
        Rate creaminessRating
    ) public isDurianSold(durianID) durianExist(durianID) {
        Rating memory r = Rating(
            block.timestamp,
            remark,
            tasteRating,
            fragranceRating,
            creaminessRating
        );
        durians[durianID].customerRating = r;
    }

}
