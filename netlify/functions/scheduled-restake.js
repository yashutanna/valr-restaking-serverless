const { schedule } = require("@netlify/functions");
const stakeAll = require("../../stake-all")
const handler = async function(event, context) {
    stakeAll()
    return {
        statusCode: 200,
    };
};

exports.handler = schedule("5 * * * *", handler);