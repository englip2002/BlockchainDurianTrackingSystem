import * as blockchain from "/js/blockchainConnection.js";
import * as df from "/js/durianFormatting.js";
import * as jsonFetching from "/js/jsonFetching.js";

var durianList = [];

const initDurianList = async () => {
    await df.getAllDurians(true, true, true, true, true, true).then((data) => {
        durianList = data.filter((each) => {
            return each.boughtByCustomer.toLowerCase() == blockchain.account.toLowerCase();
        });
    });

    console.log(durianList);

    let myTable = document.querySelector(".myTable tbody");
    myTable.innerHTML = "";
    for (let i = 0; i < durianList.length; i++) {
        let d = durianList[i];
        myTable.innerHTML += `
            <tr class="myTableRow" data-durianid="${d.id}">
                <th scope="row">${d.id}</th>
                <td>${d.parseStageTimestamps[d.parseStageTimestamps.length - 1]}</td>
                <td>${d.parseDurianTree.species}</td>
                <td>${d.parseDurianGrade}</td>
                <td>${d.weightInGrams}</td>
                <td>${d.parseDurianPrice}</td>
                <td class="row-action">
                    <a href="/html/traceDurian.html" target="_blank">
                        <i class="fa fa-search" aria-hidden="true"></i>
                    </a>
                    
                    &nbsp; 
                    <i class="fa fa-star" aria-hidden="true"></i>
                </td>
            </tr>`;
    }

    document.querySelectorAll(".myTable tr .row-action a").forEach((each) => {
        each.addEventListener("click", submitTraceDurian);
    });

    document.querySelectorAll(".myTable tr .row-action .fa-star").forEach((each) => {
        each.addEventListener("click", rateDurian);
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

const submitTraceDurian = (e) => {
    let p = parentsHaveClass(e.target, "myTableRow", "myTable");
    let durianID = p.dataset.durianid;
    localStorage.setItem("traceID", durianID);
};

var ratings = {
    taste: 3,
    fragrance: 3,
    creaminess: 3,
};
const initRatingStars = () => {
    document.querySelectorAll(".rating-group .stars li").forEach((each) => {
        each.addEventListener("click", (e) => {
            let p = parentsHaveClass(e.target, "stars", "rating-group");
            let rating = Array.prototype.indexOf.call(p.children, e.target) + 1;

            let p2 = parentsHaveClass(e.target, "rating-row", "rating-group");
            let type = p2.dataset.item;

            ratings[type] = rating;
            console.log(rating);
        });
    });
};

const updateRatings = () => {
    ratings["taste"] = getRatingsFromChild(document.querySelector(".rating-row-taste ul"));
    ratings["fragrance"] = getRatingsFromChild(document.querySelector(".rating-row-fragrance ul"));
    ratings["creaminess"] = getRatingsFromChild(
        document.querySelector(".rating-row-creaminess ul")
    );
};

const getRatingsFromChild = (p) => {
    let c = p.children;
    let count = 0;
    for (let i = 0; i < c.length; i++) {
        if (c[i].classList.contains("on")) {
            count++;
        }
    }
    return count;
};

const updateRatingSwal = e => {
    console.log(e)
    let ratingRows = e.querySelectorAll('.swal2-html-container .rating');
    ratingRows.forEach(element => {
        element.classList.add('static');
    });
}

const rateDurian = (e) => {
    let p = parentsHaveClass(e.target, "myTableRow", "myTable");
    let durianID = p.dataset.durianid;

    let d = null;
    for (let i = 0; i < durianList.length; i++) {
        if (durianList[i].id == durianID) {
            d = durianList[i];
            break;
        }
    }
    if (!d) return;

    let isRated = d.customerRating['taste'] != 0;
    let isRatedStr = "";
    let didOpenFunc = null;
    let htmlStr = "";
    if (isRated) {
        isRatedStr = "data-static='true'";
        didOpenFunc = updateRatingSwal;
        ratings['taste'] = d.customerRating['taste']
        ratings['fragrance'] = d.customerRating['fragrance']
        ratings['creaminess'] = d.customerRating['creaminess']

        htmlStr += `
            <h4>You've rated this durian before!</h4>
        `;
    }
    else {
        isRatedStr = "";
        didOpenFunc = () => {};
    }


    htmlStr += `
        <div class="rating-group">
        ${isRated ? '<div class="override"></div>': ''}
            <div class="row rating-row rating-row-taste" data-item="taste" ${isRatedStr}>
                <span>Taste</span>
                <input class="ratingInput" data-role="rating" data-value="${ratings['taste']}" />
            </div>
            <div class="row rating-row rating-row-fragrance" data-item="fragrance" ${isRatedStr}>
                <span>Fragrance</span>
                <input class="ratingInput" data-role="rating" data-value="${ratings['fragrance']}"  />
            </div>
            <div class="row rating-row rating-row-creaminess" data-item="creaminess" ${isRatedStr}>
                <span>Creaminess</span>
                <input class="ratingInput" data-role="rating" data-value="${ratings['creaminess']}"  />
            </div>
        </div>`;
    Swal.fire({
        title: "Rate Durian",
        html: htmlStr,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: !isRated,
        showConfirmButton: !isRated,
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Submit Feedback!',
        cancelButtonText: isRated ? "OK" : "Cancel",
        preConfirm: updateRatings,
        didOpen: didOpenFunc,
    })
        .then((out) => {
            if (out.isConfirmed) {
                return Swal.fire({
                    icon: "info",
                    title: "Are You Sure?",
                    text: "Your rating cannot be changed later!",
                    showCancelButton: true,
                });
            }
        })
        .then((out) => {
            if (out && out.isConfirmed) {
                return window.contract.methods

                    .rateDurian(
                        durianID,
                        ratings["taste"],
                        ratings["fragrance"],
                        ratings["creaminess"]
                    )
                    .send({ from: blockchain.account });
            }
        })
        .then((out) => {
            if (out) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Your rating has been added to the blockchain!",
                });
                initDurianList();
            }
        })
        .catch((err) => {
            console.log(err);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong while processing the blockchain transaction!",
            });
        });
};

blockchain
    .accessToMetamask()
    .then((out) => {
        return blockchain.accessToContract();
    })
    .then((out) => {
        initDurianList();
        initRatingStars();
    });

window.ethereum.on("accountsChanged", function (accounts) {
    console.log("Metamask account change detected!");
    blockchain.accessToMetamask();
});

// var durianList = [];

// const initDurianCards = async () => {
//     await df.getAllDurians(true, true, true, true).then((durians) => {
//         durianList = durians.filter((each) => {
//             return each.parseDurianStage == "At Retailer";
//         });
//     });

//     console.log(durianList);

//     let productsBox = document.querySelector(".productsBox");
//     productsBox.innerHTML = "";
//     for (let i = 0; i < durianList.length; i++) {
//         let d = durianList[i];
//         let html = `
//         <div
//             class="card bg-light mb-3 durian-card flip-card"
//             style="max-width: 18rem"
//             data-durianid="${d.id}">
//             <div class="flip-card-inner">
//                 <div class="flip-card-overlay"></div>
//                 <div class="flip-card-front">
//                     <div class="card-header" style="text-align: center">
//                         <h4>${d.parseDurianTree.species}</h4>
//                     </div>
//                     <div class="card-body">
//                         <img
//                             style="width: 100%; height: 100%; object-fit: cover"
//                             src="https://i.ibb.co/6Xcq1nQ/istockphoto-1329896565-612x612.jpg"
//                             alt="" />
//                         <h5 class="card-title" style="text-align: center">${d.parseDurianPrice} ETH</h5>
//                         <div class="row card-body-lower">
//                             <div class="col">
//                                 <div class="row">
//                                     <p class="card-text"><b>Weight:</b></p>
//                                 </div>
//                                 <div class="row">
//                                     <p class="card-text">${d.weightInGrams}g</p>
//                                 </div>
//                             </div>
//                             <div class="col">
//                                 <div class="row">
//                                     <p class="card-text"><b>Producer:</b></p>
//                                 </div>
//                                 <div class="row">
//                                     <p class="card-text">${d.parseDurianFarm.name}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div class="flip-card-back myCenter my-flex-col">
//                     <h4>Purchase for</h4>
//                     <h1>${d.parseDurianPrice} ETH</h1>
//                 </div>
//             </div>
//         </div>
//         `;
//         productsBox.innerHTML += html;
//     }

//     document.querySelectorAll(".durian-card").forEach((card) => {
//         card.addEventListener("click", purchaseDurian);
//     });
// };

// const parentsHaveClass = (el, className, terminatingClassName) => {
//     while (!el.classList.contains(terminatingClassName)) {
//         if (el.classList.contains(className)) {
//             return el;
//         }
//         el = el.parentElement;
//     }
//     return false;
// };

// const purchaseDurian = async (event) => {
//     let p = parentsHaveClass(event.target, "durian-card", "productsBox");
//     let durianID = p.dataset.durianid;
//     let d = await df.parseDurian(durianID);
//     if (d.exist) {
//         window.contract.methods
//             .buyDurian(durianID)
//             .send({
//                 from: blockchain.account,
//                 value: ethers.utils.parseEther(df.parseDurianPrice(d.sellPrice).toString()),
//             })
//             .then((out) => {
//                 initDurianCards();
//             })
//             .catch((err) => {
//                 console.log(err);
//             });
//     } else {
//         Swal.fire({
//             icon: "error",
//             title: "Oops...",
//             text: "Something went wrong! The durian ID " + durianID + " doesn't exist. ",
//         });
//     }
// };
