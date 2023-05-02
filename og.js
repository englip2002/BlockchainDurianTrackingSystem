//1- connect metamask
let account;

const accessToMetamask = async () => {
    if (window.ethereum !== "undefined") {
        const accounts = await ethereum.request({
            method: "eth_requestAccounts",
        });
        account = accounts[0];
        // document.getElementById("accountArea").innerHTML = account;
    }
};

//2- connect to smart contract
const accessToContract = async () => {
    const ABI = [];
    const Address = "0x1C2d60cD8edAF911865FcBd310ABDD51C568bCB3";
    window.web3 = await new Web3(window.ethereum); //how to access to smart contract
    window.contract = await new window.web3.eth.Contract(ABI, Address); //how you create an instance of that contract by using the abi and address
};

//3-read data from smart contract
const readfromContract = async () => {
    const data = await window.contract.methods.getInitialProduct().call();
    document.getElementById(
        "ownerProduct"
    ).innerHTML = `Owner Product information:<br> Product Name: ${data[0]},<br> Price(wei): ${data[1]} <br>Owner Address: ${data[2]}`;
    document.getElementById("dataArea0").innerHTML = data[0];
    document.getElementById("dataArea1").innerHTML = data[1];
    document.getElementById("dataArea2").innerHTML = data[2];
};

//4- buyer buy the product, transfer wei, update the ownership
const BuyerBuyProduct = async () => {
    //need to retrieve product data from the contract
    const data = await window.contract.methods.getInitialProduct().call();
    const price = data[1];
    const ownerAddress = data[2];
    await window.contract.methods
        .buyProduct(ownerAddress)
        .send({ from: account, value: price });
};

//5- set new product- product name and price, owner address
const setNewProduct = async () => {
    const ProductName = document.getElementById("Pname").value;
    const ProductPrice = document.getElementById("Pprice").value;
    await window.contract.methods
        .setProduct(ProductName, ProductPrice)
        .send({ from: account });
    document.getElementById("Pname").value = "";
    document.getElementById("Pprice").value = "";
};


