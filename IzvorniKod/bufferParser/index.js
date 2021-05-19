const db = require('../queries')



buffToStr = async (buff) => {
    let str = ""
    let obj = buff.toJSON();
    for (let byte of obj.data) {
        let temp = byte.toString(16)
        if (temp.length === 1) {
            temp = '0' + temp
        }
        str = str + temp
    }
    return str
}

strToBuff = async (str) => {
    let arr = []
    for (let i = 0; i < str.length / 2; i++) {
        arr.push(str[i * 2] + str[i * 2 + 1])
    }
    let arr2 = []
    for (e of arr) {
        arr2.push(parseInt(e, 16))
    }
    let buff2 = Buffer.from(arr2)
    return buff2
}




getRadBuff = async (id) => {
    let data = await db.query(`SELECT * FROM rad WHERE id_rada = '${id}';`);
    let sadr = data.rows[0].sadržaj;
    console.log(sadr.length / 2)
    let buff = await strToBuff(sadr);
    console.log(buff)
    return buff;
}

addRadBuff = async (name, naslov, buff) => {
    let bytestr = await buffToStr(buff)
    console.log(buff)
    console.log(bytestr.length / 2)
    await db.query(`INSERT INTO rad VALUES ('${name}', '${naslov}', '${bytestr}');`);
    console.log("rad dodan")
    return;

}

module.exports = {
    addRadBuff,
    getRadBuff
}