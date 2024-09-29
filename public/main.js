import {  
    Region, 
    states, cols, rows, s,  _width, _height,
    popupRegion, popupCity, searchCity, popupFoundCity, connectionForm,
    buyRegionBtn, openConnectionForm,
    money, connections, possibleRegions,
}  from './modules.js';

import {
    findCities, findEle, shortcuts, interval, findCity, closeEle,
    countries, startCities, makeNewConnection,
    cityNotFound,
    pay,
} from "./functions.js";

let regions = new Array(cols);
let clickedOutsideOfPopupRegion = true;
let k = false, inter;

window.giveMoney = (key, amount) => { if(key === 'Linus Hahlen') money.amount += amount; }
window.regions = regions;
window.connections = connections;
const game = p => {

    p.setup = () => {
        money.amount = 10000000;
        //html stuff
        listeners();
        document.getElementById('money').textContent = `Money: ${money.amount}💸`;
        //js stuff
        p.createCanvas(_width, _height);
        console.log(createRegions(p));
        // inter = interval(20000, p);
    }

    p.draw = () => {
        if(!k) {
            // inter = inter ? inter:interval(20000, p);
            regions.forEach(q => q.forEach(e => {
                e.display(p);
                e.stateLogic(p, clickedOutsideOfPopupRegion);
                if(e.state === states[0]) e.released(p, clickedOutsideOfPopupRegion, money);
            }));

            connections.forEach(e => {
                e.display(p);
            });

            clickedOutsideOfPopupRegion = true;
        } else {
            clearInterval(inter);
            inter = undefined;
        }
    }

    p.keyReleased = () => {
        shortcuts[0](popupRegion, p);
        shortcuts[1](popupRegion, 'Region', p);
        shortcuts[0](popupCity, p);
        shortcuts[0](popupFoundCity, p);
        shortcuts[0](connectionForm, p);
        shortcuts[1](connectionForm, 'Connection', p);
        clickedOutsideOfPopupRegion = true;
    }
}

const p = new p5(game);
window.p = p;

function createRegions(p) {
    let cns = countries.slice();
    for (let i = 0; i < cols; i++) {
        regions[i] = new Array(rows);
        for (let j = 0; j < rows; j++) {
            let r = Math.floor(Math.random() * cns.length);
            const cs = findCities(cns[r].country, cns[r].city, startCities);
            regions[i][j] = new Region(i, j, s, states[0], cns[r].country, cs, p);
            cns.splice(r, 1);
        }
    }

    const r1 = Math.floor(Math.random() * cols), r2 = Math.floor(Math.random() * rows);
    regions[r1][r2].state = states[1];
    return regions[r1][r2];
}

function listeners() {
    //Listener in Capturing-Phase
    Array.from(document.getElementsByClassName('popup')).forEach(q => q.addEventListener('click', e => { clickedOutsideOfPopupRegion = false;}, true));

    // Listener in Bubbling-Phase
    document.addEventListener('click', event => {
        if(clickedOutsideOfPopupRegion) {
            closeEle(popupCity);
            closeEle(popupRegion);
            closeEle(popupFoundCity);
            closeEle(connectionForm);
        }
    }); 

    document.getElementsByClassName('clsPopupBtn')[0].addEventListener('click', event => {
        closeEle(popupRegion);
    });

    document.getElementsByClassName('clsPopupBtn')[1].addEventListener('click', event => {
        closeEle(popupCity);
    });

    document.getElementsByClassName('clsPopupBtn')[2].addEventListener('click', event => {
        closeEle(popupFoundCity);
    });

    document.getElementsByClassName('clsPopupBtn')[3].addEventListener('click', event => {
        closeEle(connectionForm);
    });

    buyRegionBtn.addEventListener('click', event => {
        const region = findEle(popupRegion.children[0].children[0].textContent, 'name', regions);
        if(money.amount >= region.prize) {
            money.amount -= region.prize;

            for (let i = 0; i < regions.length; i++) {
                for (let j = 0; j < regions[i].length; j++) {
                    if(regions[i][j] === region) continue;
                    regions[i][j].prize = Math.round(regions[i][j].prize * 1.35); 
                }
            }
            region.state = states[1];
            popupRegion.classList.toggle('active');
        }
        
    });

    openConnectionForm.addEventListener('click', event => {
        setTimeout(() => {  
            if(!connectionForm.classList.contains('active')) connectionForm.classList.toggle('active');
        }, 1);
    });

    connectionForm.addEventListener('submit', event => {
        event.preventDefault();
        if(connectionForm.classList.contains('active')) {
            const inputs = document.getElementsByClassName('inputs');
            const i1 = findCity(inputs[0].value), i2 = findCity(inputs[1].value);

            if(cityNotFound(i1, i2, inputs)) {
                pay([i1, i2], p);
                makeNewConnection([i1, i2]);
                document.getElementById('buyConnection').click();
            }

            connectionForm.classList.toggle('active');
        }
    });

    searchCity.addEventListener('change', event => {
        if(!popupFoundCity.classList.contains('active')) {
            popupFoundCity.classList.toggle('active');
        }
        let city = findCity(searchCity.value);
        const str = city ? `
            Region: { x: ${city.parent.x / s.x + 1}, y: ${city.parent.y / s.y + 1} } 
            City: { index: ${city.parent.cities.indexOf(city)}}
            `:`Couldn't find City "${searchCity.value}"`;
        
        popupFoundCity.children[0].children[0].textContent = city.name;
        popupFoundCity.children[0].children[1].textContent = str;
        searchCity.value = '';
    });
}