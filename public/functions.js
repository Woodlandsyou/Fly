import { City, Textbox, cityPlaces, possibleRegions} from "./modules.js";

export const countries = await getData('/getCountriesAndCapitals');
export const startCities = await getData('/getCities');

export const shortcuts = [
    (ele, p) => {
        if(p.keyCode === 27 && ele.classList.contains('active')) ele.classList.toggle('active');
    },
    (ele, scale, p) => {
        if(p.keyCode === 13 && ele.classList.contains('active')) {
            document.getElementById('buy' + scale).click();
        }
    }
];

export function longestCountryName(countries) {
    return countries.reduce((prev, current) => { return current.length > prev.length ? current:prev });
}

async function getData(URL) {
    const res = await fetch(URL);
    return await res.json();
}

export function interval(freq) {
    return setInterval(() => {
        if(possibleRegions.length) {
            const r1 = Math.floor(Math.random() * possibleRegions.length);
            const e = possibleRegions[r1];
            // console.log(`new City: ${e.possibleCitys[0]}`);
            pushNewCity(e, e.cities.length, City, Textbox, cityPlaces)
            if(!e.possibleCitys.length) possibleRegions.splice(r1, 1);
        }
    }, freq);
}

export function findCities(country, capital, cities) {
    for (let i = 0; i < cities.length; i++) {
        if(cities[i].country === country) {
            let citiesCopy = cities[i].cities.slice();
            let cs = [];
            for (let j = 0; j < 5; j++) {
                const r = Math.floor(Math.random() * citiesCopy.length);
                cs.push(citiesCopy.splice(r, 1)[0]);
            }
            for (let j = 0; j < cs.length; j++) {
                if(cs[j] === capital) {
                    cs.unshift(cs.splice(j, 1)[0]);
                    return cs;
                }
            }
            cs[0] = capital;
            return cs;
        }
    }
}

export function findEle(value, attr, arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if(arr[i][j][attr] == value) return arr[i][j];
        }
    }
    return undefined;
}

export function findCity(name) {
    for (let i = 0; i < cities.length; i++) {
        if(cities[i].name.includes(name)) return cities[i];
    }
    return null;
}

export function pushNewCity(region, index) {
    const d = Math.round((region.d.x + region.d.y) / 20);
    let x = region.x, y = region.y, textbox;

    switch (cityPlaces[index]) {
        case cityPlaces[0]:
            x += region.d.x / 2, y += region.d.y / 2;
            break;
        case cityPlaces[1]:
            x += region.d.x / 4, y += region.d.y / 4;
            break;
        case cityPlaces[2]:
            x += region.d.x * (3 / 4), y += region.d.y / 4;
            break;
        case cityPlaces[3]:
            x += region.d.x / 4, y += region.d.y * (3 / 4);
            break;
        case cityPlaces[4]:
            x += region.d.x * (3 / 4), y += region.d.y * (3 / 4);
            break;
    }

    textbox = new Textbox(x - region.d.x / 6, y + d / 2, {x: region.d.x / 3, y: region.d.y / 5});
    const c = new City(x, y, d, region.possibleCitys[0], textbox, region);
    region.cities.push(c);
    region.possibleCitys.shift();
    cities.push(c);
}

export function closeEle(ele) {
    if(ele.classList.contains('active')) ele.classList.toggle('active');
}

export function createLi(textContent) {
    const ele = document.createElement('li');
    ele.textContent = textContent;
    return ele;
}

export function clacPrize(start, target, p) {
    console.log(start, target, p.dist);
    return 100;
}