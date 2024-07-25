export const states = ["concealed", "discovered", "water"];
export const cols = 7, rows = 6;
export const _width = 1500, _height = 990;
export const s = { x: _width / cols, y: _height / rows };

export const countries = await getData('/getCountriesAndCapitals');
export const cities = await getData('/getCities');

export const cityTimer = document.getElementById('cityTimer');
export const popupRegion = document.getElementById('popupRegion');
export const popupCity = document.getElementById('popupCity');

export let possibleRegions = [];
export let money = {
    amount: null,
    get amount() {
        return this._amount;
    },

    set amount(value) {
        this._amount = value;
        document.getElementById('money').textContent = `Money: ${this.amount}💸`;
    }
};

const populations = [10000000, 5000000, 1000000, 500000, 100000];
const cityPlaces = ['middle', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'];


class Textbox {
    constructor(x, y, d, defaultSize, small) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.defaultSize = defaultSize;
        this.small = small;
    }
}

class Clickable {
    constructor(x, y, d) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.down = false;
    }

    released(p, clickedOutsideOfPopupRegion) {
        this.down = p.mouseIsPressed ? true:this.down;
        if(this.down !== p.mouseIsPressed) {
            if(p.dist(this.x, this.y, p.mouseX - 10, p.mouseY - 10) < this.d / 2){
                this.onClick(clickedOutsideOfPopupRegion);
            }
            this.down = false;
        }
    }

    onClick(clickedOutsideOfPopupRegion) {
        console.log(this);
    }
}

class ClickableText extends Clickable {
    constructor(x, y, d, name, defaultSize = 30, small = 20) {
        super(x, y, d);
        this.name = name;
        this.words = this.name.split(/\s/);
        this.textbox = new Textbox(x, y, d, defaultSize, small);
    }

    textSizing(p, textbox) {
        p.textSize(textbox.defaultSize);
        for (let i = 0; i < this.words.length; i++) {
            if(p.textWidth(this.words[i]) > textbox.d.x) p.textSize(textbox.small);
        }
    }
}

export class Region extends ClickableText {
    constructor(x, y, d, state, name, cities) {
        super(x, y, d, name);
        this.state = state;
        this.words = this.name.split(/\s/);
        this.possibleCitys = cities;
        this.cities = [];
        this.freq = 4000;
        this.capital = cities[0];
        this.prize = 500;
    }

    set state(newState) {
        if(newState === states[1]) {
            possibleRegions.push(this);
            pushNewCity(this, this.cities.length, populations);
        }
        this._state = newState;
    }

    get state() {
        return this._state;
    }

    display(p) {
        p.push();
        p.stroke(105, 105, 80);

        switch (this.state) {
            case states[0]:
                p.fill(215, 215, 190);
                break;
            case states[1]:
                p.fill(245, 245, 220);
                p.stroke(195, 195, 180)
                break;
            case states[2]:
                p.fill(135,206,235);
                p.noStroke();
                break;
        }

        p.rect(this.x, this.y, this.d.x, this.d.y);
        p.pop();
    }

    stateLogic(p, clickedOutsideOfPopupRegion) {
        switch (this.state) {
            case states[0]:
                this.drawText(p);
                break;
            case states[1]:
                this.cities.forEach(e=> {
                    e.display(p);
                    e.released(p, clickedOutsideOfPopupRegion);
                })
                break;
        }
    }

    drawText(p) {
        p.push();
        p.stroke(145, 145, 120);
        p.fill(145, 145, 120);
        this.textSizing(p, this.textbox);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(this.name, this.x, this.y, this.d.x, this.d.y);
        p.pop();
    }

    released(p, clickedOutsideOfPopupRegion, money) {
        this.down = p.mouseIsPressed ? true:this.down;
        if(this.down !== p.mouseIsPressed) {
            if(p.mouseX - 10 > this.x && p.mouseX - 10 < this.x + this.d.x && p.mouseY - 10 > this.y && p.mouseY - 10 < this.y + this.d.y) {
                this.onClick(clickedOutsideOfPopupRegion, money);
            }
            this.down = false;
        }
    }

    onClick(clickedOutsideOfPopupRegion, money) {
        if(clickedOutsideOfPopupRegion) {
            popupRegion.classList.toggle('active');
            popupRegion.children[0].children[0].textContent = this.name;
            popupRegion.children[0].children[1].textContent = this.prize + '💸';

            const btn = document.getElementById('buyRegion');
            if(money.amount < this.prize) btn.style.backgroundColor = 'red';
            else btn.style.backgroundColor = 'darkgreen';
        }
    }

}

export class City extends ClickableText {
    constructor(x, y, d, name, textbox, population, parent) {
        super(x, y, d, name);
        this.parent = parent;
        this.capital = parent.capital === this.name;
        this.connections = [];
        this.population = population;
        this.textbox = textbox;
    }

    display(p) {
        p.push();
        p.fill(0, 100, 0);
        p.stroke(0, 100, 0);
        p.circle(this.x, this.y, this.d - this.d / 5);
        if(this.capital) {
            p.noFill();
            p.circle(this.x, this.y, this.d);
        }
        p.pop();
        this.displayName(p);
    }

    displayName(p) {
        p.push();
        p.fill(0);
        p.textAlign(p.CENTER, p.CENTER);
        this.textSizing(p, this.textbox);
        p.text(this.name, this.textbox.x, this.textbox.y, this.textbox.d.x, this.textbox.d.y);
        // p.noFill();
        // p.rect(this.textbox.x, this.textbox.y, this.textbox.d.x, this.textbox.d.y);
        p.pop();
    }

    onClick(clickedOutsideOfPopupRegion) {
        if(clickedOutsideOfPopupRegion) {
            popupCity.classList.toggle('active');
            popupCity.children[0].children[0].textContent = this.name;
        }
        console.log(this);
    }
}

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
            console.log(`new City: ${e.possibleCitys[0]}`);
            pushNewCity(e, e.cities.length)
            e.possibleCitys.shift();
            if(!e.possibleCitys.length) possibleRegions.splice(r1, 1);
        }
    }, freq);
}

export function findCities(country, capital, cities) {
    for (let i = 0; i < cities.length; i++) {
        if(cities[i].country === country) {
            let cs = cities[i].cities.slice(0, 4);
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

export function shortcuts(ele, scale) {
    if(ele.classList.contains('active')) {
        switch (p.keyCode) {
            case 27:
                ele.classList.toggle('active');
                break;
            case 13:
                document.getElementById('buy' + scale).click();
                break;
        }
    }
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

    textbox = new Textbox(x - region.d.x / 6, y + d / 2, {x: region.d.x / 3, y: region.d.y / 4}, d, d * 0.5);
    region.cities.push(new City(x, y, d, region.possibleCitys[0], textbox, populations[index], region));
    region.possibleCitys.shift();
}