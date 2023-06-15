const crypto = require('crypto');

const apiKey = process.env.API_KEY
const apiSecret = process.env.API_SECRET
const stakingCurrencies = ['SOL', 'AVAX']

function signRequest(apiSecret, timestamp, verb, path, body = '') {
    return crypto
        .createHmac("sha512", apiSecret)
        .update(timestamp.toString())
        .update(verb.toUpperCase())
        .update(path)
        .update(body)
        .digest("hex");
}

function getHeaders(timestamp, verb, path, body = '') {
    return {
        "Content-type": "application/json; charset=UTF-8",
        "X-VALR-API-KEY": `${apiKey}`,
        "X-VALR-SIGNATURE": `${signRequest(apiSecret, timestamp, verb, path, body)}`,
        "X-VALR-TIMESTAMP": `${timestamp}`
    };
}

function stake(currency, amount) {
    console.log(`Staking ${amount} ${currency}`)
    let timestamp = (new Date()).getTime()
    const body = `{"currencySymbol":"${currency}","amount":"${amount}"}`;
    const options = {
        method: "POST",
        body: body,
        headers: getHeaders(timestamp, "POST", "/v1/staking/stake", body)
    };
    return fetch('https://api.valr.com/v1/staking/stake', options)
}

async function getCurrencies() {
    let timestamp = (new Date()).getTime()
    let options = {
        method: "GET",
        headers: getHeaders(timestamp, "GET", "/v1/public/currencies"),
    };
    return fetch('https://api.valr.com/v1/public/currencies', options)
        .then((response) => response.json())
        .then((json) => json.filter(currency => stakingCurrencies.includes(currency.shortName)))
        .then((json) => json)
}

const stakeAll = () => {
    getCurrencies().then((currencies) => {
        let timestamp = (new Date()).getTime()
        let options = {
            method: "GET",
            headers: getHeaders(timestamp, "GET", "/v1/account/balances?excludeZeroBalances=true"),
        };
        return fetch('https://api.valr.com/v1/account/balances?excludeZeroBalances=true', options)
            .then((response) => response.json())
            .then((json) => json.filter(balance => stakingCurrencies.includes(balance.currency)))
            .then((array) => array.forEach((balance) => {
                const currencyDecimalPlaces = currencies.find((currency) => currency.shortName === balance.currency).withdrawalDecimalPlaces
                const available = `${balance.available}`;
                const toStake = available.substring(0, available.indexOf('.') + Number(currencyDecimalPlaces) + 1)
                if (Number(toStake) > 0) {
                    return stake(balance.currency, toStake)
                } else {
                    return console.log(`Insufficient balance to stake: ${available} ${balance.currency}`)
                }
            }))
    }).then((response) => {
    }, (failure) => console.log(failure))
}
// stakeAll();

module.exports = stakeAll;