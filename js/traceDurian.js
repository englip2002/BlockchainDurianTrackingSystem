import * as blockchain from "/js/blockchainConnection.js";
import * as durianFormatting from "/js/durianFormatting.js";

const submitTraceDurian = () => {
    let idInput = document.getElementById("durianIDinput").value;

    if (idInput.length != 4) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Please check if your values are correct and valid. ",
        });
        return;
    }

    window.contract.methods
        .durians(idInput)
        .call()
        .then((durian) => {
            if (durian.exist) {
                document.getElementById("traceDurianBox").style.display = "block";
                visualizeLoadingBar(durian.supplyChainStage);
                getDurianDetails(idInput, durian);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "This durian ID doesn't exist! ",
                });
            }
        });
};

const getDurianDetails = (durianID, durian) => {
    let detailsTable = document.getElementById("durianDetailsTableBody");
    detailsTable.innerHTML = "";

    durianFormatting.parseDurianStage(durian.supplyChainStage).then((durianStage) => {
        durianFormatting.parseDurianFarm(durian.durianFarmID).then((durianFarm) => {
            durianFormatting.parseDurianGrade(durian.grade).then((durianGrade) => {
                detailsTable.innerHTML += `
                <th scope="row">Durian ID</th>
                <td>${durianID}</td>
                `;
                detailsTable.innerHTML += `
                <th scope="row">Current Supply Chain Stage</th>
                <td>${durianStage}</td>
                `;
                detailsTable.innerHTML += `
                <th scope="row">Weight (grams)</th>
                <td>${durian.weightInGrams}</td>
                `;
                detailsTable.innerHTML += `
                <th scope="row">Durian Grade</th>
                <td>${durianGrade}</td>
                `;
                detailsTable.innerHTML += `
                <th scope="row">Belong to Durian Farm</th>
                <td>${durian.durianFarmID} : ${durianFarm.name}</td>
                `;
                detailsTable.innerHTML += `
                <th scope="row">Produced by Durian Tree</th>
                <td>${durian.durianTreeID}</td>
                `;
                detailsTable.innerHTML += `
                <th scope="row">Selling Price</th>
                <td>RM ${durianFormatting.parseDurianPrice(durian.sellPrice)}</td>
                `;
                detailsTable.innerHTML += `
                <th scope="row">Bought by Customer</th>
                <td>${durianFormatting.parseDurianBoughtByCustomer(durian.boughtByCustomer)}</td>
                `;
                detailsTable.innerHTML += `
                <th scope="row">Customer Rating</th>
                <td>${durian.customerRating}</td>
                `;
            });
        });
    });
};

const visualizeLoadingBar = (stage) => {
    let progressBar = document.querySelector("#traceDurianBox .progress-bar");
    let labelTable = document.getElementById("stageLabels");
    let labelTableTop = document.getElementById("stageLabelsTop");
    labelTable.innerHTML = "";
    labelTableTop.innerHTML = "";
    $.getJSON("json/durianStage.json", (data) => {
        let width = (1 / data.length) * 100;
        for (let i = 0; i < data.length; i++) {
            labelTableTop.innerHTML += `<th style="width: ${width}%; text-align: center;" >|</th>`;
            labelTable.innerHTML += `<th style="width: ${width}%; text-align: center;" >${data[i].name}</th>`;
        }

        let percentage = ((parseInt(stage) + 0.5) / data.length) * 100;
        progressBar.setAttribute("aria-valuenow", percentage);
        progressBar.style.width = percentage + "%";
    });
};

// Connection to blockchain
blockchain
    .accessToMetamask()
    .then((out) => {
        return blockchain.accessToContract();
    })
    .then((out) => {});

window.ethereum.on("accountsChanged", function (accounts) {
    console.log("Metamask account change detected!");
    blockchain.accessToMetamask();
});

// Onclick
document.querySelector("#submitTraceDurian").addEventListener("click", submitTraceDurian);