export const parseIntToID = (i, type) => {
    let check = "";
    if (type == "farm") check = "F";
    else if (type == "tree") check = "T";
    else if (type == "durian") check = "D";
    else if (type == "worker") check = "W";
    else {
        console.log("Invalid type to parse. ");
        return false;
    }

    let x = i.toString();
    while (x.length < 3) {
        x = "0" + x;
    }
    return check + x;
};

export const parseDurianPrice = (price) => {
    return Math.floor(price / 100).toString() + "." + (price % 100).toString();
};

export const parseDurianBoughtByCustomer = (address) => {
    if (address == "0x0000000000000000000000000000000000000000") {
        return "-";
    }
    return address;
};

export const parseDurianFarm = async (farmID) => {
    let result = null;
    await window.contract.methods
        .durianFarms(farmID)
        .call()
        .then((farm) => {
            result = farm;
        });
    return result;
};

export const parseDurianTree = async (treeID) => {
    let result = null;
    await window.contract.methods
        .durianTrees(treeID)
        .call()
        .then((tree) => {
            result = tree;
        });
    return result;
};

export const parseDurian = async (durianID) => {
    let result = null;
    await window.contract.methods
        .durians(durianID)
        .call()
        .then((durian) => {
            result = durian;
        });
    return result;
};

export const parseDurianStage = async (stage) => {
    let result = "-";
    await $.getJSON("/json/durianStage.json", (data) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].id == stage) {
                result = data[i].name;
                break;
            }
        }
    });
    return result;
};

export const parseDurianGrade = async (grade) => {
    let result = "-";
    await $.getJSON("/json/grade.json", (data) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].id == grade) {
                result = data[i].name;
                break;
            }
        }
    });
    return result;
};

export const parseDurianHarvestTime = (harvestTime) => {
    if (harvestTime == 0) {
        return "-";
    }
    var d = new Date(0);
    d.setUTCSeconds(parseInt(harvestTime));
    return d.toDateString();
};

export const getDurianFarmCount = async () => {
    let result = null;
    await window.contract.methods
        .durianFarmCount()
        .call()
        .then((data) => {
            result = data;
        });
    return result;
};

export const getDurianTreeCount = async () => {
    let result = null;
    await window.contract.methods
        .durianTreesCount()
        .call()
        .then((data) => {
            result = data;
        });
    return result;
};

export const getDurianCount = async () => {
    let result = null;
    await window.contract.methods
        .durianCount()
        .call()
        .then((data) => {
            result = data;
        });
    return result;
};

export const getWorkerCount = async () => {
    let result = null;
    await window.contract.methods
        .workerCount()
        .call()
        .then((data) => {
            result = data;
        });
    return result;
};

export const getWorkerAddress = async (i) => {
    let result = null;
    await window.contract.methods
        .workerAddresses(i)
        .call()
        .then((address) => {
            result = address;
        });
    return result;
};

export const parseWorker = async (address) => {
    let result = null;
    await window.contract.methods
        .workerList(address)
        .call()
        .then((worker) => {
            result = worker;
        });
    return result;
};
