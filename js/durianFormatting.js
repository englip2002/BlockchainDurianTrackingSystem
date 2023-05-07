import { getWorkForList } from "/js/jsonFetching.js";

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
    // return Math.floor(price / 100).toString() + "." + (price % 100).toString();
    return ethers.utils.formatEther(price);
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
    return d.toString();
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

export const getDurianDetails = async (
    durianID,
    convertDurianStage = false,
    convertDurianFarm = false,
    convertDurianPrice = false,
    convertDurianTree = false,
    includeDurianTimestamps = false,
    convertDurianGrade = false
) => {
    let durian = await parseDurian(durianID).then((durian) => {
        return durian;
    });
    if (durian.exist) {
        let thisRow = durian;
        thisRow["id"] = durianID;
        if (convertDurianStage) {
            await parseDurianStage(durian.supplyChainStage).then((durianStage) => {
                durian["parseDurianStage"] = durianStage;
            });
        }
        if (convertDurianFarm) {
            await parseDurianFarm(durian.durianFarmID).then((farm) => {
                durian["parseDurianFarm"] = farm;
            });
        }
        if (convertDurianPrice) {
            durian["parseDurianPrice"] = parseDurianPrice(durian.sellPrice);
        }
        if (convertDurianTree) {
            await parseDurianTree(durian.durianTreeID).then((tree) => {
                durian["parseDurianTree"] = tree;
            });
        }
        if (includeDurianTimestamps) {
            await window.contract.methods
                .getDurianTimestamps(durianID)
                .call()
                .then((timestamps) => {
                    durian["stageTimestamps"] = timestamps;
                });
            let temp = [];
            durian["stageTimestamps"].forEach((each) => {
                temp.push(parseDurianHarvestTime(each));
            });
            durian["parseStageTimestamps"] = temp;
        }
        if (convertDurianGrade) {
            durian["parseDurianGrade"] = await parseDurianGrade(durian.grade).then((out) => {
                return out;
            });
        }
    }
    return durian;
};

export const getAllDurians = async (
    convertDurianStage = false,
    convertDurianFarm = false,
    convertDurianPrice = false,
    convertDurianTree = false,
    includeDurianTimestamps = false,
    convertDurianGrade = false
) => {
    let result = [];
    let durianCount = await getDurianCount().then((durianCount) => {
        return durianCount;
    });
    for (let i = 1; i <= durianCount; i++) {
        let durianID = parseIntToID(i, "durian");
        result.push(
            await getDurianDetails(
                durianID,
                convertDurianStage,
                convertDurianFarm,
                convertDurianPrice,
                convertDurianTree,
                includeDurianTimestamps,
                convertDurianGrade
            )
        );
    }
    return result;
};

export const getAllDurianFarms = async () => {
    let result = [];
    let farmCount = await getDurianFarmCount().then((farmCount) => {
        return farmCount;
    });

    for (let i = 1; i <= farmCount; i++) {
        let farmID = parseIntToID(i, "farm");
        await parseDurianFarm(farmID).then((farm) => {
            if (farm.exist) {
                farm['id'] = farmID;
                result.push(farm);
            }
        });
    }
    return result;
};

export const getAllDurianTrees = async (convertDurianFarm = false, convertHarvestTime = false) => {
    let result = [];
    let treeCount = await getDurianTreeCount().then((treeCount) => {
        return treeCount;
    });

    for (let i = 1; i <= treeCount; i++) {
        let treeID = parseIntToID(i, "tree");
        let tree = await parseDurianTree(treeID).then((tree) => {
            return tree;
        });
        if (tree.exist) {
            tree['id'] = treeID;
            if (convertDurianFarm) {
                await parseDurianFarm(tree.durianFarmID).then((farm) => {
                    tree["parseDurianFarm"] = farm;
                });
            }
            if (convertHarvestTime) {
                tree["parseHarvestTime"] = parseDurianHarvestTime(tree.lastHarvestTime);
            }
            result.push(tree);
        }
    }

    return result;
};

export const getAllWorkers = async () => {
    let result = [];
    let workerCount = await getWorkerCount().then((count) => {
        return count;
    });

    let workForList = await getWorkForList().then((out) => {
        return out;
    });

    for (let i = 0; i < workerCount; i++) {
        let addr = await getWorkerAddress(i).then((address) => {
            return address;
        });
        let worker = await parseWorker(addr).then((worker) => {
            return worker;
        });
        worker["address"] = addr;
        worker["id"] = parseIntToID(parseInt(worker.workerID) + 1, "worker");

        for (let j = 0; j < workForList.length; j++) {
            if (workForList[j].id == worker.workedFor) {
                worker["parseWorkFor"] = workForList[j].name;
                break;
            }
        }
        result.push(worker);
    }

    return result;
};

