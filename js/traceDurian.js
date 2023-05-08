import * as blockchain from "/js/blockchainConnection.js";
import * as df from "/js/durianFormatting.js";

const submitTraceDurian = async () => {
    let durianID = document.getElementById("durianIDinput").value;

    if (durianID.length != 4) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Please check if your values are correct and valid. ",
        });
        return;
    }

    durianID = durianID.toUpperCase();

    let durian = await df.getDurianDetails(durianID, true, true, true, true, true, true);

    if (!durian.exist) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "This durian ID doesn't exist! ",
        });
        return;
    }

    document.querySelector("#traceDurianBox").style.display = "block";
    visualizeLoadingBar(durian.supplyChainStage, durian.parseStageTimestamps);
    let detailsTable = document.getElementById("durianDetailsTableBody");
    detailsTable.innerHTML = "";

    detailsTable.innerHTML += `
        <th scope="row">Durian ID</th>
        <td>${durianID}</td>
        `;
    detailsTable.innerHTML += `
        <th scope="row">Current Supply Chain Stage</th>
        <td>${durian.parseDurianStage} 
        ${
            durian.supplyChainStage == 3
                ? " (<span class='copy-to-clipboard' data-toggle='tooltip' data-placement='top' title='Click to Copy'>" +
                  durian.boughtByCustomer +
                  "</span>)"
                : ""
        }</td>
        `;
    if (durian.supplyChainStage == 3 && durian.customerRating["taste"] != 0) {
        detailsTable.innerHTML += `
            <th scope="row">Customer Rating</th>
            <td>${formatCustomerRating(durian.customerRating)}</td>
            `;
    }
    detailsTable.innerHTML += `
        <th scope="row">Species</th>
        <td>${durian.parseDurianTree.species}</td>
        `;
    detailsTable.innerHTML += `
        <th scope="row">Weight (grams)</th>
        <td>${durian.weightInGrams}</td>
        `;
    detailsTable.innerHTML += `
        <th scope="row">Durian Grade</th>
        <td>${durian.parseDurianGrade}</td>
        `;
    detailsTable.innerHTML += `
        <th scope="row">Belong to Durian Farm</th>
        <td>${durian.durianFarmID} : ${durian.parseDurianFarm.name}</td>
        `;
    detailsTable.innerHTML += `
        <th scope="row">Produced by Durian Tree</th>
        <td>${durian.durianTreeID}</td>
        `;
    if (durian.supplyChainStage >= 3) {
        detailsTable.innerHTML += `
            <th scope="row">Selling Price</th>
            <td>${durian.parseDurianPrice} ETH</td>
        `;
    }

    initCopyToClipboard();
};

const formatCustomerRating = (ratings) => {
    console.log(ratings);
    let htmlStr = `
    <div class="rating-group">
            <div class="override"></div>
            <div class="row rating-row rating-row-taste row" data-item="taste" data-static="true">
                <div class="col-3">
                    <span>Taste</span>
                </div>
                <div class="col-9">
                    <input
                        class="ratingInput"
                        data-role="rating"
                        data-value="${ratings["taste"]}" />
                </div>
            </div>
            <div
                class="row rating-row rating-row-fragrance"
                data-item="fragrance"
                data-static="true">
                <div class="col-3">
                    <span>Fragrance</span>
                </div>
                <div class="col-9">
                    <input
                        class="ratingInput"
                        data-role="rating"
                        data-value="${ratings["fragrance"]}" />
                </div>
            </div>
            <div
                class="row rating-row rating-row-creaminess"
                data-item="creaminess"
                data-static="true">
                <div class="col-3">
                    <span>Creaminess</span>
                </div>
                <div class="col-9">
                    <input
                        class="ratingInput"
                        data-role="rating"
                        data-value="${ratings["creaminess"]}" />
                </div>
            </div>
            <div class="row" style="margin-top: 10px;">
                <p style="margin: 0;"><small>Rated on ${df.parseDurianHarvestTime(
                    ratings["ratingTime"]
                )}</small></p>
            </div>
        </div>`;

    return htmlStr;
};

const initCopyToClipboard = () => {
    document.querySelectorAll(".copy-to-clipboard").forEach((each) => {
        each.addEventListener("click", (e) => {
            navigator.clipboard.writeText(e.target.innerHTML.toString());
            Swal.fire({
                icon: "success",
                title: "Address Copied to Clipboard!",
            });
        });
    });
    $('[data-toggle="tooltip"]').tooltip();
};

const visualizeLoadingBar = async (stage, timestamps) => {
    let progressBar = document.querySelector("#traceDurianBox .progress-bar");
    let labelTableTop = document.getElementById("stageLabelsTop");
    let labelTable = document.getElementById("stageLabels");
    let timestampsTable = document.getElementById("stageTimestamps");
    labelTable.innerHTML = "";
    labelTableTop.innerHTML = "";
    timestampsTable.innerHTML = "";

    await $.getJSON("/json/durianStage.json", (data) => {
        data.unshift({
            id: "",
            name: "New",
        });

        let width = (1 / data.length) * 100;
        for (let i = 0; i < data.length; i++) {
            labelTableTop.innerHTML += `<th style="width: ${width}%; text-align: center;" >|</th>`;
            labelTable.innerHTML += `<th style="width: ${width}%; text-align: center;" >${data[i].name}</th>`;
            if (!timestamps[i]) {
                timestampsTable.innerHTML += `<td class="progressTimestamps" style="width: ${width}%; text-align: center;">-</td>`;
            } else {
                timestampsTable.innerHTML += `<td class="progressTimestamps" style="width: ${width}%; text-align: center;" >
                    ${timestamps[i].substring(0, timestamps[i].indexOf(","))}
                    <br/>
                    ${timestamps[i].substring(timestamps[i].indexOf(",") + 2, timestamps[i].length)}
                    </td>`;
            }
        }

        console.log(stage);
        let percentage = ((parseInt(stage) + 1) / (data.length - 1)) * 100;
        progressBar.setAttribute("aria-valuenow", percentage);
        progressBar.style.width = percentage + "%";
    });
};

const fetchSessionTrace = () => {
    let traceID = localStorage.getItem("traceID");
    if (traceID) {
        document.querySelector("#durianIDinput").value = traceID;
        document.querySelector("#submitTraceDurian").click();
        localStorage.removeItem("traceID");
    }
};

// Connection to blockchain
blockchain
    .accessToMetamask()
    .then((out) => {
        return blockchain.accessToContract();
    })
    .then((out) => {
        fetchSessionTrace();
    });

window.ethereum.on("accountsChanged", function (accounts) {
    console.log("Metamask account change detected!");
    blockchain.accessToMetamask();
});

// Onclick
document.querySelector("#submitTraceDurian").addEventListener("click", submitTraceDurian);
