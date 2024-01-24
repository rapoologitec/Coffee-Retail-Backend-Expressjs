/*

    /^               : Start
    (?=.{8,})        : Length
    (?=.*[a-zA-Z])   : Letters
    (?=.*\d)         : Digits
    (?=.*[!#$%&?])   : !#$%&?
    $/               : End

*/

function isGoodPassword(str)
{
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
}

module.exports = isGoodPassword;