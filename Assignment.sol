//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Durian {
    uint256 id;
    uint256 weightGrams;
    string species;
    
    // Timestamps for the four stages
    uint[] stageTimestamps;
    
    enum Stages {
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

    // Ratings given to this durian by the customers
    rating[] ratings;

    struct rating {
        address ratingCustomer;
        Rate taste;
        Rate fragrance;
        Rate creaminess;
        Rate price; 
    }


    struct worker{
        
    }

    struct Customer {
        
    }

    struct durianTree{

    }

    struct durianFarm{

    }

    struct durianFarmSector{
        
    }

    constructor() {

    }
}