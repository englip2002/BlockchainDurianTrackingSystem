import * as blockchain from "/js/blockchainConnection.js";
import * as df from "/js/durianFormatting.js";
import * as jsonFetching from "/js/jsonFetching.js";

const switchFarmUI = () => {
    document.getElementById("durianFarmUI").style.display = "block";
    document.getElementById("durianTreeUI").style.display = "none";
    document.getElementById("workerUI").style.display = "none";
};

const switchTreeUI = () => {
    document.getElementById("durianFarmUI").style.display = "none";
    document.getElementById("durianTreeUI").style.display = "block";
    document.getElementById("workerUI").style.display = "none";
};

const switchWorkerUI = () => {
    document.getElementById("durianFarmUI").style.display = "none";
    document.getElementById("durianTreeUI").style.display = "none";
    document.getElementById("workerUI").style.display = "block";
};

const submitAddFarm = async () => {
    let farmNameInput = document.getElementById("farmName");
    let farmName = farmNameInput.value;
    let farmLocationInput = document.getElementById("farmLocation");
    let farmLocation = farmLocationInput.value;

    let verifyFarmDetails = farmName.length != 0 && farmLocation.length != 0;
    if (!verifyFarmDetails) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "All fields are required!",
        });
    }

    // Generate farm ID
    let farmID = "";
    window.contract.methods
        .durianFarmCount()
        .call()
        .then((data) => {
            farmID = df.parseIntToID(parseInt(data) + 1, "farm");
        })
        .then((result) => {
            return window.contract.methods
                .addDurianFarm(farmID, farmName, farmLocation)
                .send({ from: blockchain.account });
        })
        .then((result) => {
            return updateDurianFarmSelect();
        })
        .then((result) => {
            return getAllFarms();
        })
        .then((result) => {
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "The durian farm is added to the blockchain",
            });
            farmNameInput.value = "";
            farmLocationInput.value = "";
        })
        .catch((err) => {
            console.log(err);
        });
};

const getAllFarms = async () => {
    let tableBody = document.getElementById("durianFarmTableBody");
    tableBody.innerHTML = "";

    let durianFarms = await df.getAllDurianFarms().then((data) => {
        return data;
    });

    for (let i = 0; i < durianFarms.length; i++) {
        let farm = durianFarms[i];
        if (farm.exist) {
            tableBody.innerHTML +=
                `<tr>
                <th scope="row" class="dfCol1">` +
                farm.id +
                `</th>
                <td class="dfCol2">` +
                farm.name +
                `</td>
                <td class="dfCol3">` +
                farm.location +
                `</td>
                <td class="dfCol4">` +
                farm.durianTreeCount +
                `</td>
            </tr>`;
        }
    }
};

const loadDurianSpecies = async () => {
    let speciesSelect = document.getElementById("durianSpeciesSelect");
    jsonFetching.getDurianSpecies().then((data) => {
        for (let i = 0; i < data.length; i++) {
            speciesSelect.innerHTML += `<option value="` + data[i] + `">` + data[i] + `</option>`;
        }
    });
};

const updateDurianFarmSelect = async () => {
    let treeSelectFarm = document.getElementById("treeSelectFarm");
    treeSelectFarm.innerHTML = `<option selected disabled="disabled" value="0">Select a durian farm</option>`;
    df.getDurianFarmCount().then((durianFarmCount) => {
        for (let n = 1; n <= durianFarmCount; n++) {
            df.parseDurianFarm(df.parseIntToID(n, "farm")).then((farm) => {
                if (farm.exist) {
                    let thisId = df.parseIntToID(n, "farm");
                    treeSelectFarm.innerHTML +=
                        `<option value="` +
                        thisId +
                        `">` +
                        thisId +
                        " : " +
                        farm.name +
                        `</option>`;
                }
            });
        }
    });
};

const submitAddTree = async () => {
    let treeSpecies = document.getElementById("durianSpeciesSelect");
    let treeAge = document.getElementById("treeAge");
    let treeFarm = document.getElementById("treeSelectFarm");

    let verifySubmitAddTree =
        treeSpecies.value != 0 &&
        treeAge.value != "" &&
        parseInt(treeAge.value) >= 0 &&
        treeFarm.value.length != 0;
    if (!verifySubmitAddTree) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "All fields are required!",
        });
        return;
    }

    // Generate Tree ID
    let treeID = "";
    df.getDurianTreeCount()
        .then((treeCount) => {
            treeID = df.parseIntToID(parseInt(treeCount) + 1, "tree");

            return window.contract.methods
                .addDurianTree(treeID, treeAge.value, treeSpecies.value, treeFarm.value)
                .send({ from: blockchain.account });
        })
        .then((result) => {
            getAllTrees();
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "The durian tree is added to the blockchain!",
            });
            treeSpecies.value = "0";
            treeAge.value = "";
            treeFarm.value = "0";
        })
        .catch((err) => {
            console.log(err);
        });
};

const getAllTrees = async () => {
    let tableBody2 = document.getElementById("durianTreeTableBody");
    tableBody2.innerHTML = "";

    let durianTrees = await df.getAllDurianTrees(true, true).then((data) => {
        return data;
    });

    for (let i = 0; i < durianTrees.length; i++) {
        let tree = durianTrees[i];
        if (tree.exist) {
            tableBody2.innerHTML +=
                `<tr>
                <th scope="row" class="dfCol1">` +
                tree.id +
                `</th>
                <td class="dfCol2">` +
                tree.species +
                `</td>
                <td class="dfCol3">` +
                tree.age +
                `</td>
                <td class="dfCol4">` +
                tree.parseHarvestTime +
                `</td>
                <td class="dfCol5">` +
                tree.durianFarmID +
                " : " +
                tree.parseDurianFarm.name +
                "</td></tr>";
        }
    }
};
const updateWorkerWorkForSelections = () => {
    let workForEl = document.getElementById("workerWorkFor");
    workForEl.innerHTML = "";
    jsonFetching.getWorkForList().then((data) => {
        for (let i = 1; i < data.length; i++) {
            workForEl.innerHTML +=
                `<option value="` + data[i].id + `">` + data[i].name + `</option>`;
        }
    });
};

const submitAddWorker = () => {
    let wName = document.getElementById("workerName");
    let wAddress = document.getElementById("workerAddress");
    let wWorkFor = document.getElementById("workerWorkFor");

    let verifyAddWorker =
        wName.value.length != 0 && wAddress.value.length != 0 && wWorkFor.value > 0;
    if (!verifyAddWorker) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "All fields are required!",
        });
    }

    df.getWorkerCount()
        .then((workerCount) => {
            let workerID = df.parseIntToID(workerCount + 1, "worker");
            return window.contract.methods
                .addWorker(wName.value, wAddress.value, wWorkFor.value.toString())
                .send({ from: blockchain.account });
        })
        .then((result) => {
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "The worker is added to the blockchain!",
            });
            getAllWorkers();
            wName.value = "";
            wAddress.value = "";
            wWorkFor.value = "1";
        })
        .catch((err) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong. Please check if your values are correct and valid. ",
            });
            console.log(err);
        });
};

const getAllWorkers = async () => {
    let tableBody = document.getElementById("workerListBody");
    tableBody.innerHTML = "";

    let workers = await df.getAllWorkers().then((data) => {
        return data;
    });

    for (let i = 0; i < workers.length; i++) {
        let worker = workers[i];
        tableBody.innerHTML +=
            `<tr><th scope="row" class="dfCol1">` +
            worker.id +
            `</th><td class="dfCol2">` +
            worker.name +
            `</th><td class="dfCol3">
            <span class='copy-to-clipboard' data-toggle='tooltip' data-placement='top' title='Click to Copy'>` +
            worker.address +
            `</span></td><td class="dfCol4">` +
            worker.parseWorkFor +
            `</td>`;
    }

    initCopyToClipboard();
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

const verifyAdmin = async () => {
    await window.contract.methods
        .owner()
        .call()
        .then((owner) => {
            if (owner.toLowerCase() != blockchain.account.toLowerCase()) {
                return Swal.fire({
                    icon: "error",
                    title: "Invalid Account!",
                    text: "You are not the admin!",
                    allowOutsideClick: false
                }).then((out) => {
                    window.location.href = "/index.html";
                });
            }
        })
};

blockchain
    .accessToMetamask()
    .then((out) => {
        return blockchain.accessToContract();
    })
    .then((out) => {
        return verifyAdmin();
    })
    .then((out) => {
        getAllFarms();
        getAllTrees();
        getAllWorkers();
        updateDurianFarmSelect();
    });
loadDurianSpecies();
updateWorkerWorkForSelections();

window.ethereum.on("accountsChanged", function (accounts) {
    console.log("Metamask account change detected!");
    blockchain.accessToMetamask().then((out) => {
        verifyAdmin();
    });
});

// Onclick
document.querySelector("#switchFarmUIel").addEventListener("click", switchFarmUI);
document.querySelector("#switchTreeUIel").addEventListener("click", switchTreeUI);
document.querySelector("#switchWorkerUIel").addEventListener("click", switchWorkerUI);
document.querySelector("#submitAddFarmEl").addEventListener("click", submitAddFarm);
document.querySelector("#submitAddTreeEl").addEventListener("click", submitAddTree);
document.querySelector("#submitAddWorkerEl").addEventListener("click", submitAddWorker);
