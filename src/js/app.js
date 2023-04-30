App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load animals.
    $.getJSON('../Animals.json', function(data) {
      var animalsRow = $('#animalsRow');
      var animalsTemplate = $('#animalsTemplate');

      for (i = 0; i < data.length; i ++) {
        animalsTemplate.find('.panel-title').text(data[i].name);
        animalsTemplate.find('img').attr('src', data[i].picture);
        animalsTemplate.find('.animals-id').text(data[i].id);
        animalsTemplate.find('.animals-name').text(data[i].name);
        animalsTemplate.find('.animals-age').text(data[i].age);
        animalsTemplate.find('.animals-fee').text(data[i].fee);
        animalsTemplate.find('.animals-location').text(data[i].location);
        animalsTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        animalsRow.append(animalsTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {

      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('SponsorAnimals.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted animals
      return App.markAdopted();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    var adoptionInstance;
   

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
    
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-animals').eq(i).find('button').text('Success').attr('disabled', true);
         // $('.panel-pet').eq(i).find('.btn-address').text(adopters[i]);
          $('.panel-animals').eq(i).find('.sponsor-address').text(adopters[i]);
          
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });

  },

  handleAdopt: function(event) {
    event.preventDefault();

    var animalId = parseInt($(event.target).data('id'));
    var animalFee = parseInt($(event.target).data('fee'));
    var adoptionInstance;
   
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      
      var account = accounts[0];
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(animalId, animalFee, {from: account, value: 5000000000000000000n});

      }).then(function(result) {
        return App.markAdopted()
      }).catch(function(err) {
        console.log(err.message);
      });
    });

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
