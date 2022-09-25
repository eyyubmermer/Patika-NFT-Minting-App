const fs = require('fs')

const Patika = artifacts.require("Patika");

let patikaadress = ""

module.exports = async function (deployer) {
    await deployer.deploy(Patika);
    const instance = await Patika.deployed();
    patikaadress = await instance.address;
    console.log("patika addresi eşittir= ", patikaadress)

    let config = `export const patikaadress = "${patikaadress}"`

    let data = JSON.stringify(config)
    await fs.writeFileSync('config.js', JSON.parse(data))
};
