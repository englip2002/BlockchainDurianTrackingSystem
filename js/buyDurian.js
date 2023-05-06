import * as blockchain from "/js/blockchainConnection.js";
import * as df from "/js/durianFormatting.js";
import * as jsonFetching from "/js/jsonFetching.js";

const initRangeSliders = () => {
    new RangeSlider(".range-slider-1", {
        values: [0, 10000],
        min: 0,
        max: 10000,
        step: 100,
        colors: {
            points: "#F77BF0",
            rail: "#F77BF030",
            tracks: "#F77BF0",
        },
    }).onChange((val) => console.log(val));

    new RangeSlider(".range-slider-2", {
        values: [0, 1000],
        min: 0,
        max: 1000,
        step: 10,
        colors: {
            points: "#F77BF0",
            rail: "#F77BF030",
            tracks: "#F77BF0",
        },
    }).onChange((val) => console.log(val));
};

var durianList = [];

const initDurianCards = async () => {
    await df.getAllDurians(true, true, true, true).then((durians) => {
        durianList = durians.filter((each) => {
            return each.parseDurianStage == "At Retailer";
        });
    });

    console.log(durianList);

    let productsBox = document.querySelector(".productsBox");
    productsBox.innerHTML = "";
    for (let i = 0; i < durianList.length; i++) {
        let d = durianList[i];
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
                    <h1>5 ETH</h1>
                </div>
            </div>
        </div>
        `;
        productsBox.innerHTML += html;
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

const purchaseDurian = (event) => {
    let p = parentsHaveClass(event.target, "durian-card", "productsBox");

};

blockchain
    .accessToMetamask()
    .then((out) => {
        return blockchain.accessToContract();
    })
    .then((out) => {
        initDurianCards();
    });

initRangeSliders();

window.ethereum.on("accountsChanged", function (accounts) {
    console.log("Metamask account change detected!");
    blockchain.accessToMetamask();
});
