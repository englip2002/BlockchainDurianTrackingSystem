//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DTTBA {
    mapping(string => Durian) public durians;
    uint256 public durianCount = 0;

    struct Durian {
        uint256 weightInGrams;
        Stage supplyChainStage;
        uint256[] stageTimestamps;
        DurianGrade grade;
        string durianFarmID;
        string durianTreeID;
        uint256 sellPrice;
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

    enum WorkFor {
        None,
        DurianFarm,
        DistributionCentre,
        Retailer
    }

    // Ratings given to this durian by the customers

    struct Rating {
        uint256 ratingTime;
        uint256 taste;
        uint256 fragrance;
        uint256 creaminess;
    }

    struct Worker {
        uint256 workerID;
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
        uint256 age;
        string species;
        uint256 lastHarvestTime;
        string durianFarmID;
        bool exist;
    }

    address payable public owner;

    mapping(string => DurianFarm) public durianFarms;
    uint256 public durianFarmCount = 0;

    mapping(string => DurianTree) public durianTrees;
    uint256 public durianTreesCount = 0;

    constructor() {
        owner = payable(msg.sender);
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

    modifier workerNotExist(address _addr) {
        require(workerList[_addr].workedFor == WorkFor.None);
        _;
    }

    // Others
    modifier validDurianWeight(uint256 _weight) {
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
    ) public durianFarmNotExist(_id) isOwner(msg.sender) {
        require(bytes(_name).length > 0);
        require(bytes(_location).length > 0);

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
        uint256 _age,
        string memory _species,
        string memory _durianFarmID
    )
        public
        isOwner(msg.sender)
        durianTreeNotExist(_id)
        durianFarmExist(_durianFarmID)
    {
        require(bytes(_species).length > 0);
        durianTreesCount++;
        durianTrees[_id] = DurianTree({
            age: _age,
            species: _species,
            lastHarvestTime: 0,
            durianFarmID: _durianFarmID,
            exist: true
        });

        durianFarms[_durianFarmID].durianTreeCount += 1;
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

    function determineDurianGrade(uint256 weight)
        private
        pure
        returns (DurianGrade grade)
    {
        if (weight >= 0 && weight <= 1200) return DurianGrade.B;
        else if (weight > 1200 && weight <= 2400) return DurianGrade.A;
        else return DurianGrade.AA;
    }

    mapping(address => Worker) public workerList;
    address[] public workerAddresses;
    uint256 public workerCount = 0;

    function addWorker(
        string memory _name,
        address workerAddress,
        WorkFor _workFor
    ) public isOwner(msg.sender) workerNotExist(workerAddress) {
        Worker storage newWorker = workerList[workerAddress];
        newWorker.name = _name;
        newWorker.workerID = workerCount;
        newWorker.workedFor = _workFor;
        workerCount++;
        workerAddresses.push(workerAddress);
    }

    function recordDurianDistributionCenter(string memory durianID)
        public
        durianExist(durianID)
        isDistributionCenterWorker(msg.sender)
    {
        Durian storage durian = durians[durianID];
        require(durian.supplyChainStage == Stage.Harvested);

        durian.supplyChainStage = Stage.AtDistributionCenter;
        durian.stageTimestamps.push(block.timestamp);
    }

    function recordDurianRetailer(string memory durianID, uint256 _sellPrice)
        public
        durianExist(durianID)
        isRetailerWorker(msg.sender)
    {
        Durian storage durian = durians[durianID];
        require(durian.supplyChainStage == Stage.AtDistributionCenter);

        durian.supplyChainStage = Stage.AtRetailer;
        durian.sellPrice = _sellPrice;
        durian.stageTimestamps.push(block.timestamp);
    }

    // Consumer Functions
    function buyDurian(string memory durianID)
        public
        payable
        durianExist(durianID)
    {
        Durian storage durian = durians[durianID];
        require(msg.value >= durian.sellPrice);
        require(durian.supplyChainStage == Stage.AtRetailer);

        durian.supplyChainStage = Stage.SoldToCustomer;
        durian.stageTimestamps.push(block.timestamp);
        durian.boughtByCustomer = msg.sender;

        owner.transfer(msg.value);
    }

    function getDurianTimestamps(string memory durianID)
        public
        view
        durianExist(durianID)
        returns (uint256[] memory _stageTimestamps)
    {
        _stageTimestamps = durians[durianID].stageTimestamps;
    }

    function rateDurian(
        string memory durianID,
        uint256 tasteRating,
        uint256 fragranceRating,
        uint256 creaminessRating
    ) public isDurianSold(durianID) durianExist(durianID) {
        require(durians[durianID].customerRating.taste == 0);
        Rating memory r = Rating(
            block.timestamp,
            tasteRating,
            fragranceRating,
            creaminessRating
        );
        durians[durianID].customerRating = r;
    }
}
