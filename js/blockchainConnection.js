
//1- connect metamask
export let account;

export const accessToMetamask = async () => {
    if (window.ethereum !== "undefined") {
        const accounts = await ethereum.request({
            method: "eth_requestAccounts",
        });
        account = accounts[0];
        // document.getElementById("accountArea").innerHTML = account;
    }
};

//2- connect to smart contract
export const accessToContract = async () => {
    var ABI = [];

    await $.getJSON("/json/abi.json", (data) => {
        ABI = data;
    });

    var Address = "";

    await $.getJSON("/json/address.json", (addr) => {
        Address = addr;
    });

    window.web3 = await new Web3(window.ethereum); //how to access to smart contract
    window.contract = await new window.web3.eth.Contract(ABI, Address); //how you create an instance of that contract by using the abi and address
};