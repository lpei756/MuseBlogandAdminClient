const bcrypt = require('bcrypt');
const saltRounds = 10;
const userDao = require("./users-dao.js");

async function newHashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

async function checkHashPassword(userName, password) {
    let dataBasePass = await userDao.getUserPassword(userName);

    console.log(`Username: ${userName}`);
    console.log(`Password from DB: ${dataBasePass}`);

    if (dataBasePass == undefined) {
        return false
    } else {
        let checkResult = await bcrypt.compareSync(password, dataBasePass);
        console.log(`Password check result1: ${checkResult}`);
        return checkResult;
    }
}

module.exports = {
    newHashPassword,
    checkHashPassword,
};
