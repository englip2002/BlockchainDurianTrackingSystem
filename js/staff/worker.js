import * as blockchain from "/js/blockchainConnection.js";
import * as df from "/js/durianFormatting.js";

const switchUI = (target) => {
    let farmUI = document.getElementById("farmWorkerUI");
    let distUI = document.getElementById("distributionWorkerUI");
    let retaUI = document.getElementById("retailerWorkerUI");
    switch (target) {
        case "farm":
            farmUI.style.display = "block";
            distUI.style.display = "none";
            retaUI.style.display = "none";
            break;
        case "distribution":
            farmUI.style.display = "none";
            distUI.style.display = "block";
            retaUI.style.display = "none";
            break;
        case "retail":
            farmUI.style.display = "none";
            distUI.style.display = "none";
            retaUI.style.display = "block";
            break;
        default:
            break;
    }
};

const updateDurianFarmSelections = () => {
    let durianFarmEl = document.getElementById("durianFarmSelect");
    durianFarmEl.innerHTML = "";
    let first = true;
    df.getDurianFarmCount().then((farmCount) => {
        for (let n = 1; n <= farmCount; n++) {
            df.parseDurianFarm(df.parseIntToID(n, "farm")).then((farm) => {
                if (farm.exist) {
                    let thisId = df.parseIntToID(n, "farm");

                    let finalStr = "<option ";
                    if (first) {
                        first = false;
                        finalStr += "selected ";
                    }
                    finalStr +=
                        `value="` +
                        thisId +
                        `">` +
                        thisId +
                        ` : ` +
                        farm.name +
                        `</option>
                    `;
                    durianFarmEl.innerHTML += finalStr;
                }
            });
        }
    });
};

const updateDurianTreeSelections = () => {
    let durianTreeEl = document.getElementById("durianTreeSelect");
    let selectedFarmID = document.getElementById("durianFarmSelect").value;
    durianTreeEl.innerHTML = "";

    if (selectedFarmID.length == 0) {
        return;
    }

    df.getDurianTreeCount().then((treeCount) => {
        for (let n = 1; n <= treeCount; n++) {
            df.parseDurianTree(df.parseIntToID(n, "tree")).then((tree) => {
                if (tree.exist && tree.durianFarmID == selectedFarmID) {
                    let treeID = df.parseIntToID(n, "tree");
                    durianTreeEl.innerHTML +=
                        `<option value="` +
                        treeID +
                        `">` +
                        treeID +
                        " - " +
                        tree.species +
                        `</option>`;
                }
            });
        }
    });
};

const submitAddDurian = () => {
    let inputWeight = document.getElementById("weightInGrams").value;
    let inputFarm = document.getElementById("durianFarmSelect").value;
    let inputTree = document.getElementById("durianTreeSelect").value;

    let verifyAddDurian = inputWeight > 0 && inputFarm.length != 0 && inputTree.length != 0;
    if (!verifyAddDurian) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "All fields are required!",
        });
    }

    df.getDurianCount()
        .then((durianCount) => {
            let durianID = df.parseIntToID(parseInt(durianCount) + 1, "durian");
            return window.contract.methods
                .addDurian(durianID, parseInt(inputWeight), inputFarm, inputTree)
                .send({ from: blockchain.account })
                .then((result) => {
                    df.getDurianDetails(durianID, true, true, true, true, false, true).then((d) => {
                        durianList.push(d);
                        updateAllDurians();
                        Swal.fire({
                            icon: "success",
                            title: "Success!",
                            text: "The durian is added to the blockchain!",
                        });
                    });
                });
        })

        .catch((err) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong! Please check if your values are correct and valid. ",
            });
            console.log(err);
        });
};

var durianList = [];

const syncDurians = async () => {
    durianList = await df.getAllDurians(true, true, true, true, false, true).then((data) => {
        return data;
    });
    console.log(durianList);
};

const updateAllDurians = async () => {
    let tableBody = document.getElementById("duriansTableBody");
    tableBody.innerHTML = "";

    let speciesData = {};
    let stageData = {};
    let gradeData = {};
    let farmData = {};
    durianList.forEach((each) => {
        let s = each.parseDurianTree.species;
        speciesData[s] = speciesData[s] ? speciesData[s] + 1 : 1;

        let t = each.parseDurianStage;
        stageData[t] = stageData[t] ? stageData[t] + 1 : 1;

        let g = each.parseDurianGrade;
        gradeData[g] = gradeData[g] ? gradeData[g] + 1 : 1;

        let f = each.parseDurianFarm.name;
        farmData[f] = farmData[f] ? farmData[f] + 1 : 1;
    });

    for (let i = 0; i < durianList.length; i++) {
        let durian = durianList[i];
        let priceStr = durian.supplyChainStage >= 2 ? durian.parseDurianPrice : "-";
        // prettier-ignore
        tableBody.innerHTML += `
        <tr>
            <th scope="row">` + durian.id + `</th>
            <td>` + durian.parseDurianStage + `</td>
            <td>` + durian.parseDurianGrade + `</td>
            <td>` + durian.parseDurianTree.species + `</td>
            <td>` + durian.weightInGrams + `</td>
            <td>` + durian.durianFarmID + " : " + durian.parseDurianFarm.name + `</td>
            <td>` + durian.durianTreeID + `</td>
            <td class="durianRowSellPrice">` + priceStr + `</td>
            <td class="durianRowBoughtCustomer">
            <span class='copy-to-clipboard' data-toggle='tooltip' data-bs-placement='left' title='Click to Copy'>` + 
            df.parseDurianBoughtByCustomer(durian.boughtByCustomer) + `</span></td>
        </tr>`;
    }

    initCopyToClipboard();

    updateChart(speciesChart, "speciesChart", speciesData, "Species");
    updateChart(stagesChart, "stagesChart", stageData, "Stages");
    updateChart(gradesChart, "gradesChart", gradeData, "Grades");
    updateChart(farmsChart, "farmsChart", farmData, "Farms");
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

const submitRecordDC = () => {
    let durianIDinputEl = document.getElementById("durianIDinput");
    let durianIDinput = durianIDinputEl.value.toUpperCase();

    let verifyRecordDC = durianIDinput.length == 4;
    if (!verifyRecordDC) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Please check if your values are correct and valid. ",
        });
    }

    let foundWorker = false;
    for (let i = 0; i < workers.length; i++) {
        if (workers[i].address.toLowerCase() == blockchain.account.toLowerCase()) {
            foundWorker = true;
            if (workers[i].parseWorkFor != "Distribution Center") {
                Swal.fire({
                    icon: "error",
                    title: "Invalid Account!",
                    text: "You are not a Distribution center worker!",
                });
                return;
            }
            break;
        }
    }
    if (!foundWorker) {
        Swal.fire({
            icon: "error",
            title: "Invalid Account!",
            text: "You are not a Distribution center worker!",
        });
        return;
    }

    df.parseDurian(durianIDinput).then((durian) => {
        if (durian.exist) {
            if (durian.supplyChainStage == 0) {
                window.contract.methods
                    .recordDurianDistributionCenter(durianIDinput)
                    .send({ from: blockchain.account })
                    .then((result) => {
                        durianList.forEach((d) => {
                            if (d.id.toLowerCase() == durianIDinput.toLowerCase()) {
                                d.supplyChainStage += 1;
                                d.parseDurianStage = "At Distribution Center";
                            }
                        });

                        updateAllDurians();
                        durianIDinputEl.value = "";
                        Swal.fire({
                            icon: "success",
                            title: "Success!",
                            text: "The durian is recorded as 'At Distribution Center' on the blockchain! ",
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Something went wrong in the blockchain transaction! ",
                        });
                    });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "This durian must be at Harvested stage! ",
                });
            }
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "This durian ID doesn't exist! ",
            });
        }
    });
};

const submitRecordRetailer = () => {
    let idInputElement = document.getElementById("durianIDinputRetail");
    let durianIDinput = idInputElement.value.toUpperCase();
    let sellPriceElement = document.getElementById("durianSellPriceRetailer");
    let durianSellPrice = sellPriceElement.value;

    if (durianIDinput.length != 4) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Please check if your Durian ID is correct and valid. ",
        });
        return;
    } else if (
        !durianSellPrice ||
        (durianSellPrice.indexOf(".") != -1 && durianSellPrice.split(".")[1].length > 18)
    ) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Please check if your Durian Price is correct and valid. (Maximum 18 decimal places)",
        });
        return;
    }

    let foundWorker = false;
    for (let i = 0; i < workers.length; i++) {
        if (workers[i].address.toLowerCase() == blockchain.account.toLowerCase()) {
            foundWorker = true;
            if (workers[i].parseWorkFor != "Retailer") {
                Swal.fire({
                    icon: "error",
                    title: "Invalid Account!",
                    text: "You are not a Retailer worker!",
                });
                return;
            }
            break;
        }
    }
    if (!foundWorker) {
        Swal.fire({
            icon: "error",
            title: "Invalid Account!",
            text: "You are not a Retailer worker!",
        });
        return;
    }

    let durianSellPriceFormatted = ethers.utils.parseEther(durianSellPrice).toString();
    df.parseDurian(durianIDinput).then((durian) => {
        if (durian.exist) {
            if (durian.supplyChainStage == 1) {
                window.contract.methods
                    .recordDurianRetailer(durianIDinput, durianSellPriceFormatted)
                    .send({ from: blockchain.account })
                    .then((result) => {
                        durianList.forEach((d) => {
                            if (d.id.toLowerCase() == durianIDinput.toLowerCase()) {
                                d.supplyChainStage += 1;
                                d.parseDurianStage = "At Retailer";
                                d.sellPrice = durianSellPriceFormatted;
                                d.parseDurianPrice = durianSellPrice;
                            }
                        });
                        updateAllDurians();
                        idInputElement.value = "";
                        sellPriceElement.value = "";
                        Swal.fire({
                            icon: "success",
                            title: "Success!",
                            text: "The durian is recorded as 'At Retailer' on the blockchain! ",
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Something went wrong in the blockchain transaction! ",
                        });
                    });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "This durian must be at Distribution Center stage! ",
                });
            }
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "This durian ID doesn't exist! ",
            });
        }
    });
};

var speciesChart = null;
var stagesChart = null;
var gradesChart = null;
var farmsChart = null;

const updateChart = (chart, id, data, title, bgColors = null) => {
    if (chart) {
        chart.destroy();
    }

    let c = document.getElementById(id);
    let p = c.parentElement;
    c.remove();
    p.innerHTML = `<canvas id="${id}"></canvas>`;
    let canvas = document.querySelector("#" + id);
    let ctx = canvas.getContext("2d");

    if (!bgColors) {
        bgColors = [
            "#36A2EB",
            "#FF6384",
            "#4BC0C0",
            "#FF9F40",
            "#9966FF",
            "#B71375",
            "#FFCD56",
            "#C9CBCF",
        ];
    }

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: Object.keys(data),
            datasets: [
                {
                    label: title,
                    backgroundColor: bgColors,
                    data: Object.values(data),
                },
            ],
        },
    });
};

var workers;
const verifyWorker = async () => {
    workers = await df.getAllWorkers().then((data) => {
        return data;
    });
    let found = false;
    for (let i = 0; i < workers.length; i++) {
        if (workers[i].address.toLowerCase() == blockchain.account.toLowerCase()) {
            found = true;
            break;
        }
    }

    if (!found) {
        Swal.fire({
            icon: "error",
            title: "Invalid Account!",
            text: "You are not a worker!",
            allowOutsideClick: false,
        }).then((out) => {
            window.location.href = "/index.html";
        });
    }
};

// =================================
blockchain
    .accessToMetamask()
    .then((out) => {
        return blockchain.accessToContract();
    })
    .then((out) => {
        return verifyWorker();
    })
    .then((out) => {
        updateDurianFarmSelections();
        updateDurianTreeSelections();

        syncDurians().then((out) => {
            updateAllDurians();
        });
    });

window.ethereum.on("accountsChanged", function (accounts) {
    console.log("Metamask account change detected!");
    blockchain.accessToMetamask().then((out) => {
        verifyWorker();
    });
});

setTimeout(() => {
    updateDurianTreeSelections();
}, 300);

// Onclick
document.querySelector("#switchUIfarm").addEventListener("click", function () {
    switchUI("farm");
});
document.querySelector("#switchUIdistribution").addEventListener("click", function () {
    switchUI("distribution");
});
document.querySelector("#switchUIretail").addEventListener("click", function () {
    switchUI("retail");
});
document.querySelector("#submitAddDurianBtn").addEventListener("click", submitAddDurian);
document.querySelector("#submitRecordDCbtn").addEventListener("click", submitRecordDC);
document.querySelector("#submitRecordRetailerBtn").addEventListener("click", submitRecordRetailer);

document.querySelector("#durianFarmSelect").addEventListener("change", updateDurianTreeSelections);
