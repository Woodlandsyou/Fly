import {  
    Region, 
    states, cols, rows, s,  _width, _height, 
    cities, countries,
    popupRegion, popupCity, cityTimer,
    findCities, findEle, shortcuts, interval, 
    money, possibleRegions,
}  from './modules.js';

(async () => {
    let regions = new Array(cols);
    let clickedOutsideOfPopupRegion = true;
    window.giveMoney = (key, amount) => { if(key === 'Linus Hahlen') money.amount += amount; }
    window.regions = regions;
    window.possibleRegions = possibleRegions;
    
    const game = p => {

        p.setup = () => {
            money.amount = 10000000;
            //html stuff
            listeners();
            document.getElementById('money').textContent = `Money: ${money.amount}💸`;
            //js stuff
            p.createCanvas(_width, _height).canvas.classList.add('flexEle');
            console.log(createRegions());
            interval(10000);
        }

        p.draw = () => {
            regions.forEach(q => q.forEach(e => {
                e.display(p);
                e.stateLogic(p, clickedOutsideOfPopupRegion);
                if(e.state === states[0]) e.released(p, clickedOutsideOfPopupRegion, money);
            }));
            clickedOutsideOfPopupRegion = true;
        }

        p.keyReleased = () => {
            shortcuts(popupRegion, 'Region');
            shortcuts(popupCity, 'City');
            clickedOutsideOfPopupRegion = true;
        }
    }

    function createRegions() {
        let cns = countries.slice();
        for (let i = 0; i < cols; i++) {
            regions[i] = new Array(rows);
            for (let j = 0; j < rows; j++) {
                let r = Math.floor(Math.random() * cns.length);
                const cs = findCities(cns[r].country, cns[r].city, cities);
                regions[i][j] = new Region(i * s.x, j * s.y, s, states[0], cns[r].country, cs);
                cns.splice(r, 1);
            }
        }

        const r1 = Math.floor(Math.random() * cols), r2 = Math.floor(Math.random() * rows);
        regions[r1][r2].state = states[1];
        return regions[r1][r2];
    }

    function listeners() {
        //Listener in Capturing-Phase
        popupRegion.addEventListener('click', event => {
            clickedOutsideOfPopupRegion = false;
        }, true);

        popupCity.addEventListener('click', event => {
            clickedOutsideOfPopupRegion = false;
        }, true);

        // Listener in Bubbling-Phase
        document.addEventListener('click', event => {
            if(clickedOutsideOfPopupRegion) {
                if(popupRegion.classList.contains('active')) popupRegion.classList.toggle('active');
                else if(popupCity.classList.contains('active')) popupCity.classList.toggle('active');
            }
        }); 

        document.getElementsByClassName('clsPopupBtn')[0].addEventListener('click', event => {
            if(popupRegion.classList.contains('active')) {
                popupRegion.classList.toggle('active');
            }
        });

        document.getElementsByClassName('clsPopupBtn')[1].addEventListener('click', event => {
            if(popupCity.classList.contains('active')) {
                popupCity.classList.toggle('active');
            }
        });

        document.getElementById('buyRegion').addEventListener('click', event => {
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
    }

    const p = new p5(game);
    window.p = p;   
})();
