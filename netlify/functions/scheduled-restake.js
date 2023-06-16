const { schedule } = require("@netlify/functions");
const stakeAll = require("../../stake-all")
const handler = async function(event, context) {
    console.log("Start scheduled restake")
    await stakeAll()
    console.log("Completed scheduled restake")
    return {
        statusCode: 200,
    };
};

exports.handler = schedule("5 * * * *", handler);