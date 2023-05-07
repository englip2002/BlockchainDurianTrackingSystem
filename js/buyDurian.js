import * as blockchain from "/js/blockchainConnection.js";
import * as df from "/js/durianFormatting.js";
import * as jsonFetching from "/js/jsonFetching.js";

var weightRangeMinMax = [0, 10000];
var priceRangeMinMax = [0, 100];
var weightRange = [weightRangeMinMax[0], weightRangeMinMax[1]];
var priceRange = [priceRangeMinMax[0], priceRangeMinMax[1]];
const initRangeSliders = () => {
    renderSlider(1);
    renderSlider(2);
    document.querySelector("#weightSlideMin").addEventListener("change", (e) => {
        e.target.value = clampWeightInput(e.target.value);
        weightRange[0] = e.target.value;
        renderSlider(1);
        updateDurianCards();
    });
    document.querySelector("#weightSlideMax").addEventListener("change", (e) => {
        e.target.value = clampWeightInput(e.target.value);
        weightRange[1] = e.target.value;
        renderSlider(1);
        updateDurianCards();
    });

    document.querySelector("#priceSlideMin").addEventListener("change", (e) => {
        e.target.value = clampPriceInput(e.target.value);
        priceRange[0] = e.target.value;
        renderSlider(2);
        updateDurianCards();
    });
    document.querySelector("#priceSlideMax").addEventListener("change", (e) => {
        e.target.value = clampPriceInput(e.target.value);
        priceRange[1] = e.target.value;
        renderSlider(2);
        updateDurianCards();
    });

    updateWeightSliderInput();
    updatePriceSliderInput();
};

const clampWeightInput = (n) => {
    if (n < weightRangeMinMax[0]) {
        return weightRangeMinMax[0];
    } else if (n > weightRangeMinMax[1]) {
        return weightRangeMinMax[1];
    }
    return n;
};

const clampPriceInput = (n) => {
    if (n < priceRangeMinMax[0]) {
        return priceRangeMinMax[0];
    } else if (n > priceRangeMinMax[1]) {
        return priceRangeMinMax[1];
    }
    return n;
};

const renderSlider = (i) => {
    if (i == 1) {
        document.querySelector(".range-slider-1").innerHTML = "";
        let r1 = new RangeSlider(".range-slider-1", {
            values: [weightRange[0], weightRange[1]],
            min: 0,
            max: 10000,
            step: 100,
            colors: {
                points: "#F77BF0",
                rail: "#F77BF030",
                tracks: "#F77BF0",
            },
        }).onChange((val) => {
            let minVal, maxVal;
            if (val[0] < val[1]) {
                minVal = val[0];
                maxVal = val[1];
            } else {
                minVal = val[1];
                maxVal = val[0];
            }
            weightRange[0] = minVal;
            weightRange[1] = maxVal;
            updateWeightSliderInput();
        });
    } else {
        document.querySelector(".range-slider-2").innerHTML = "";
        let r2 = new RangeSlider(".range-slider-2", {
            values: [priceRange[0], priceRange[1]],
            min: 0,
            max: 100,
            step: 0.01,
            colors: {
                points: "#F77BF0",
                rail: "#F77BF030",
                tracks: "#F77BF0",
            },
        }).onChange((val) => {
            let minVal, maxVal;
            if (val[0] < val[1]) {
                minVal = val[0];
                maxVal = val[1];
            } else {
                minVal = val[1];
                maxVal = val[0];
            }

            priceRange[0] = minVal;
            priceRange[1] = maxVal;
            updatePriceSliderInput();
        });
    }
};

const updateWeightSliderInput = () => {
    document.querySelector("#weightSlideMin").value = weightRange[0];
    document.querySelector("#weightSlideMax").value = weightRange[1];

    updateDurianCards();
};
const updatePriceSliderInput = () => {
    document.querySelector("#priceSlideMin").value = priceRange[0];
    document.querySelector("#priceSlideMax").value = priceRange[1];

    updateDurianCards();
};

var durianList = [];

const initDurianCards = async () => {
    await df.getAllDurians(true, true, true, true).then((durians) => {
        durianList = durians.filter((each) => {
            return each.parseDurianStage == "At Retailer";
        });
    });

    updateDurianCards();
};

const updateDurianCards = (searchKey = false) => {
    let productsBox = document.querySelector(".productsBox");
    productsBox.innerHTML = "";
    let count = 0;
    for (let i = 0; i < durianList.length; i++) {
        let d = durianList[i];
        if (
            d.weightInGrams < weightRange[0] ||
            d.weightInGrams > weightRange[1] ||
            d.parseDurianPrice < priceRange[0] ||
            d.parseDurianPrice > priceRange[1]
        ) {
            continue;
        }
        else if (searchKey) {
            let found = false;
            let searchValues = [
                d.parseDurianFarm.name, 
                d.parseDurianFarm.location, 
                d.parseDurianTree.species, 
                d.parseDurianStage
            ];
            for (let j = 0; j < searchValues.length; j++) {
                if (searchValues[j].toLowerCase().includes(searchKey.toLowerCase())) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                continue;
            }
        }

        count++;
        let html = `
        <div
            class="card bg-light mb-3 durian-card flip-card"
            style="max-width: 18rem"
            data-durianid="${d.id}">
            <div class="flip-card-inner">
                <div class="flip-card-overlay"></div>
                <div class="flip-card-front">
                    <div class="card-header" style="text-align: center">
                        <h4>${d.parseDurianTree.species}</h4>
                    </div>
                    <div class="card-body">
                        <img
                            style="width: 100%; height: 100%; object-fit: cover"
                            src="https://i.ibb.co/6Xcq1nQ/istockphoto-1329896565-612x612.jpg"
                            alt="" />
                        <h5 class="card-title" style="text-align: center">${d.parseDurianPrice} ETH</h5>
                        <div class="row card-body-lower">
                            <div class="col">
                                <div class="row">
                                    <p class="card-text"><b>Weight:</b></p>
                                </div>
                                <div class="row">
                                    <p class="card-text">${d.weightInGrams}g</p>
                                </div>
                            </div>
                            <div class="col">
                                <div class="row">
                                    <p class="card-text"><b>Producer:</b></p>
                                </div>
                                <div class="row">
                                    <p class="card-text">${d.parseDurianFarm.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flip-card-back myCenter my-flex-col">
                    <h4>Purchase for</h4>
                    <h1>${d.parseDurianPrice} ETH</h1>
                </div>
            </div>
        </div>
        `;
        productsBox.innerHTML += html;
    }

    if (count == 0) {
        productsBox.innerHTML +=
            "<h2>Looks like there are no durians<br/>that match your filter... :(</h2>";
    }

    document.querySelectorAll(".durian-card").forEach((card) => {
        card.addEventListener("click", purchaseDurian);
    });
};

const parentsHaveClass = (el, className, terminatingClassName) => {
    while (!el.classList.contains(terminatingClassName)) {
        if (el.classList.contains(className)) {
            return el;
        }
        el = el.parentElement;
    }
    return false;
};

const purchaseDurian = async (event) => {
    let p = parentsHaveClass(event.target, "durian-card", "productsBox");
    let durianID = p.dataset.durianid;
    let d = await df.parseDurian(durianID);
    if (d.exist) {
        window.contract.methods
            .buyDurian(durianID)
            .send({
                from: blockchain.account,
                value: ethers.utils.parseEther(df.parseDurianPrice(d.sellPrice).toString()),
            })
            .then((out) => {
                initDurianCards();
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong! The durian ID " + durianID + " doesn't exist. ",
        });
    }
};

const initSearchBar = () => {
    document.querySelector("#searchBarForm").addEventListener("submit", (e) => {
        e.preventDefault();
        let searchKey = document.querySelector("#searchBar").value;
        updateDurianCards(searchKey);
    });
};

blockchain
    .accessToMetamask()
    .then((out) => {
        return blockchain.accessToContract();
    })
    .then((out) => {
        initDurianCards();
        initSearchBar();
    });

initRangeSliders();

window.ethereum.on("accountsChanged", function (accounts) {
    console.log("Metamask account change detected!");
    blockchain.accessToMetamask();
});
