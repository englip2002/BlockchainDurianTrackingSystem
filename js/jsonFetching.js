
export const getDurianSpecies = async () => {
    let result = null;
    await $.getJSON("/json/durianSpecies.json", (data) => {
        result = data;
    });
    return result;
};

export const getWorkForList = async () => {
    let result = null;
    await $.getJSON("/json/workFor.json", data => {
        result = data;
    })
    return result;
}