const express = require('express');
const app = express();
const cs = require('./node_modules/country-json/src/country-by-cities.json');
const cns = require('./node_modules/country-json/src/country-by-capital-city.json');

const countries = extractData(cns, 'country', cs);
const cities = extractData(cs, 'country', countries);
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.listen(3000, () => console.log('running'););

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

app.get('/getCountriesAndCapitals', (req, res) => {
    res.status(200).json(countries);
});

app.get('/getCities', (req, res) => {
    res.status(200).json(cities);
});

function findEle(name, attr, arr) {
    for (let i = 0; i < arr.length; i++) {
        if(arr[i][attr] == name) return arr[i];
    }
    return undefined;
}

function extractData(toBeSearchedArr, attr, searchArr) {
    let newArr = [];
    for (let i = 0; i < searchArr.length; i++) {
        if(findEle(searchArr[i][attr], attr, toBeSearchedArr)) newArr.push(findEle(searchArr[i][attr], attr, toBeSearchedArr));
    }
    return newArr;
}