import { pushNewCity } from "./functions.js";

export const states = ["concealed", "discovered", "water"];
export const cityPlaces = ['middle', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
export const cols = 6, rows = 5;
export const _width = window.screen.width * 0.7, _height = window.screen.height * 0.6;
export const s = { x: _width / cols, y: _height / rows };

export const popupRegion = document.getElementById('popupRegion');
export const popupCity = document.getElementById('popupCity');
export const popupFoundCity = document.getElementById('popupFoundCity');
export const searchCity = document.getElementById('searchCity');
export const popupForm = document.getElementById('connectionForm');
export const connectionForm = document.getElementById('connectionForm');

export const buyRegionBtn = document.getElementById('buyRegion');
export const openConnectionForm = document.getElementById('openConnectionForm');

export let possibleRegions = [], cities = [], connections = [];
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

class Clickable {
    constructor(x, y, d, name) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.down = false;
        this.name = name;
        // this.words = this.sortWordsLength(this.name.split(/\s/), p);

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

    onClick() {
        console.log(this);
    }

    // Longest word first shortest last
    sortWordsLength(words, p) {
        for (let i = 1; i < words.length; i++) {
            if(p.textWidth(words[i]) > p.textWidth(words[i - 1])) {
                let x = words[i];
                words[i] = words[i - 1];
                words[i - 1] = x;
            }
        }
    }
}

export class Region extends Clickable {
    constructor(x, y, d, state, name, cities, p) {
        super(x, y, d, name);
        this.state = state;
        this.words = this.sortWordsLength(this.name.split(/\s/), p);
        this.possibleCitys = cities;
        this.cities = [];
        this.freq = 4000;
        this.capital = cities[0];
        this.prize = 500;
    }

    set state(newState) {
        if(newState === states[1]) {
            possibleRegions.push(this);
            pushNewCity(this, this.cities.length, p);
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

        p.rect(this.x * s.x, this.y * s.y, this.d.x, this.d.y);
        p.pop();
    }

    stateLogic(p, clickedOutsideOfPopupRegion) {
        switch (this.state) {
            case states[0]:
                this.drawText(p);
                break;
            case states[1]:
                this.cities.forEach(e => {
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
        p.textAlign(p.CENTER, p.CENTER);
        p.text(this.name, this.x * s.x, this.y * s.y, this.d.x, this.d.y);
        p.pop();
    }

    released(p, clickedOutsideOfPopupRegion, money) {
        this.down = p.mouseIsPressed ? true:this.down;
        if(this.down !== p.mouseIsPressed) {
            if(p.mouseX - 10 > this.x * s.x && p.mouseX - 10 < this.x * s.x + this.d.x && p.mouseY - 10 > this.y * s.y && p.mouseY - 10 < this.y * s.y + this.d.y) {
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

export class City extends Clickable {
    constructor(x, y, d, name, textbox, parent, p) {
        super(x, y, d, name);
        this.words = this.sortWordsLength(this.name.split(/\s/), p);
        this.parent = parent;
        this.capital = parent.capital === this.name;
        this.connections = [];
        this.population = [];
        this.capacity = 100;
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
        for (let i = 0; i < this.connections.length; i++) {
            if(this.connections[i].cities[1] === this) this.connections[i].display(p);
        }
    }

    displayName(p) {
        p.push();
        p.fill(0);
        p.textAlign(p.CENTER, p.CENTER);
        this.textSize(p);
        p.text(this.name, this.textbox.x, this.textbox.y, this.textbox.d.x, this.textbox.d.y);
        // p.noFill();
        // p.rect(this.textbox.x, this.textbox.y, this.textbox.d.x, this.textbox.d.y);
        p.pop();
    }

    onClick(clickedOutsideOfPopupRegion) {
        if(clickedOutsideOfPopupRegion) {
            popupCity.classList.toggle('active');
            popupCity.children[0].children[0].textContent = this.name;
            const ul = popupCity.children[0].children[1];
            ul.children[0].textContent = this.population.length ? this.population:'No population'; 
            ul.children[1].textContent = this.capacity;
            let str = '';
            console.log(this.connections);
            if(!this.connections.length) str = 'No Connections';
            else this.connections.forEach(e => {
                if(str) str += ', ';
                if(e.cities[0] === this) str += e.cities[1].name;
                else str += e.cities[0].name;
            });
            ul.children[2].children[0].textContent = str;
        }
        console.log(this);
    }

    textSize(p) {
        let size = p.textSize();
        while(p.textWidth(this.words[0]) > this.textbox.x && size >= 0) {
            size--;
            textSize(size);
        }
    }
}

export class Person {
    constructor(home, target) {
        this.home = home;
        this.target = target;
        this.location = this.home;
    }
}

export class Connection {
    constructor(cities) {
        this.cities = cities;
        this.planes = [new Plane()];
    }

    display(p) {
        p.push()
        p.strokeWeight(1);
        p.line(this.cities[0].x, this.cities[0].y, this.cities[1].x, this.cities[1].y);
        p.pop();
    }
}

export class Plane {
    constructor() {
        this.capacity = 100;
        this.lvl = 1;
    }

    display(p) {

    }
} 