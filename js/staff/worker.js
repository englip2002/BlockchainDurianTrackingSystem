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
                        `<option value="` + treeID + `">` + treeID + `</option>`;
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
                .send({ from: account });
        })
        .then((result) => {
            getAllDurians();
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "The durian is added to the blockchain!",
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

const getAllDurians = () => {
    let tableBody = document.getElementById("duriansTableBody");
    tableBody.innerHTML = "";
    df.getDurianCount().then((durianCount) => {
        for (let i = 1; i <= durianCount; i++) {
            let durianID = df.parseIntToID(i, "durian");

            df.parseDurian(durianID).then((durian) => {
                if (durian.exist) {
                    df.parseDurianStage(durian.supplyChainStage).then((durianStage) => {
                        df.parseDurianStage(durian.grade).then((durianGrade) => {
                            df.parseDurianFarm(durian.durianFarmID).then((farm) => {
                                let priceStr =
                                    durianStage == "At Retailer"
                                        ? df.parseDurianPrice(durian.sellPrice)
                                        : "-";
                                // prettier-ignore
                                tableBody.innerHTML += `
                                <tr>
                                    <th scope="row">` + durianID + `</th>
                                    <td>` + durianStage + `</td>
                                    <td>` + durianGrade + `</td>
                                    <td>` + durian.weightInGrams + `</td>
                                    <td>` + durian.durianFarmID + " : " + farm.name + `</td>
                                    <td>` + durian.durianTreeID + `</td>
                                    <td>` + priceStr + `</td>
                                    <td>` + df.parseDurianBoughtByCustomer(durian.boughtByCustomer) + `</td>
                                </tr>`;
                            });
                        });
                    });
                }
            });
        }
    });
};

const submitRecordDC = () => {
    let durianIDinput = document.getElementById("durianIDinput").value.toUpperCase();

    let verifyRecordDC = durianID.length == 4;
    if (!verifyRecordDC) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Please check if your values are correct and valid. ",
        });
    }

    df.parseDurian(durianIDinput).then((durian) => {
        if (durian.exist) {
            window.contract.methods
                .recordDurianDistributionCenter(durianIDinput)
                .send({ from: account })
                .then((result) => {
                    getAllDurians();
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
                text: "This durian ID doesn't exist! ",
            });
        }
    });
};

const submitRecordRetailer = () => {
    let durianIDinput = document.getElementById("durianIDinputRetail").value.toUpperCase();
    let durianSellPrice = document.getElementById("durianSellPriceRetailer").value;

    let verifyRecordRetailer =
        durianIDinput.length == 4 &&
        (durianSellPrice.indexOf(".") == -1 ||
            (durianSellPrice.indexOf(".") != -1 &&
                durianSellPrice.length - durianSellPrice.indexOf(".") <= 3));
    if (!verifyRecordRetailer) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! Please check if your values are correct and valid. ",
        });
    }

    let durianSellPriceFormatted = parseInt(
        parseFloat(durianSellPrice).toFixed(2).toString().replace(".", "")
    );

    df.parseDurian(durianIDinput),
        then((durian) => {
            if (durian.exist) {
                window.contract.methods
                    .recordDurianRetailer(durianIDinput, durianSellPriceFormatted)
                    .send({ from: account })
                    .then((result) => {
                        getAllDurians();
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
                    text: "This durian ID doesn't exist! ",
                });
            }
        });
};

blockchain
    .accessToMetamask()
    .then((out) => {
        return blockchain.accessToContract();
    })
    .then((out) => {
        updateDurianFarmSelections();
        updateDurianTreeSelections();
        getAllDurians();
    });

window.ethereum.on("accountsChanged", function (accounts) {
    console.log("Metamask account change detected!");
    accessToMetamask();
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
