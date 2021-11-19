import { plyr } from './main.js';
import { VTT } from "../../ts/classes/VTT.js";
export var subs = new VTT();
export class SubPanel {
    constructor(element, metadata) {
        this.metadata = metadata;
        if (typeof element === 'string' || element instanceof String) {
            this.element = document.querySelector(element);
        }
        else {
            this.element = element;
        }
        this.subTemplate = this.element.querySelector('#subtemplate');
        this.subsList = this.element.querySelector('#subs');
        this.element.querySelector('#addsub').addEventListener('click', () => {
            this.createSub('', plyr.currentTime, plyr.currentTime + 3);
        });
        this.element.querySelector('#importsub').addEventListener('click', () => {
            //We have to use an arrow function here because doing "('click', this.importSubs)" causes "this" to be overwritten with #importsub's dom element
            this.importSubs();
        });
        this.element.querySelector('#exportsub').addEventListener('click', () => {
            //Same thing here as above ^^^
            this.exportSubs();
        });
    }
    createSub(text, from, to) {
        const clone = this.subTemplate.content.cloneNode(true);
        if (this.subsList.querySelector('#nosubs')) {
            this.subsList.querySelector('#nosubs').remove();
        }
        clone.querySelector('.sub').setAttribute('data-from', (Math.floor(from * 1000) / 1000).toString());
        clone.querySelector('.sub').setAttribute('data-to', (Math.floor(to * 1000) / 1000).toString());
        clone.querySelector('.sub').setAttribute('data-text', text);
        clone.querySelector('#subtext').setAttribute('data-oldvalue', text);
        clone.querySelector('#subfrom').setAttribute('data-secvalue', (Math.floor(from * 1000) / 1000).toString());
        clone.querySelector('#subto').setAttribute('data-secvalue', (Math.floor(to * 1000) / 1000).toString());
        clone.querySelector('#subfrom').innerText = this.parseTime(from);
        clone.querySelector('#subto').innerText = this.parseTime(to);
        clone.querySelector('#subtext').innerText = text;
        subs.push({
            time: {
                from: Math.floor(from * 1000) / 1000,
                to: Math.floor(to * 1000) / 1000
            },
            text
        });
        var tempThis = this;
        clone.querySelector('#subtext').addEventListener('input', function () {
            tempThis.updateSub(this);
        });
        clone.querySelector('#subfrom').addEventListener('input', function () {
            tempThis.updateSub(this);
        });
        clone.querySelector('#subto').addEventListener('input', function () {
            tempThis.updateSub(this);
        });
        clone.querySelector('#delsub').addEventListener('click', function () {
            tempThis.removeSub(this);
        });
        this.subsList.appendChild(clone);
    }
    updateSub(element) {
        const parent = element.parentElement;
        const fakeSub = {
            time: {
                from: parseFloat(parent.querySelector('#subfrom').getAttribute('data-secvalue')),
                to: parseFloat(parent.querySelector('#subto').getAttribute('data-secvalue'))
            },
            text: parent.querySelector('#subtext').getAttribute('data-oldvalue')
        };
        //loop through subs to find the right one and update it
        for (var i = 0; i < subs.length; i++) {
            if (subs[i].time.from === fakeSub.time.from && subs[i].time.to === fakeSub.time.to && subs[i].text === fakeSub.text) {
                subs[i] = {
                    time: {
                        from: this.timeStringToSeconds(parent.querySelector('#subfrom').value),
                        to: this.timeStringToSeconds(parent.querySelector('#subto').value)
                    },
                    text: parent.querySelector('#subtext').value
                };
                parent.querySelector('#subfrom').setAttribute('data-secvalue', this.timeStringToSeconds(parent.querySelector('#subfrom').value).toString());
                parent.querySelector('#subto').setAttribute('data-secvalue', this.timeStringToSeconds(parent.querySelector('#subto').value).toString());
                parent.querySelector('#subtext').setAttribute('data-oldvalue', parent.querySelector('#subtext').value);
            }
        }
    }
    timeStringToSeconds(str) {
        const mins = parseInt(str.split(':')[0]);
        const secs = parseFloat(str.split(':')[1]);
        return secs + (mins * 60);
    }
    removeSub(element) {
        const parent = element.parentElement;
        const fakeSub = {
            time: {
                from: parseFloat(parent.getAttribute('data-from')),
                to: parseFloat(parent.getAttribute('data-to'))
            },
            text: parent.querySelector('#subtext').value
        };
        //loop through subs to find the right sub and remove it from subs array
        for (var i = 0; i < subs.length; i++) {
            if (subs[i].time.from === fakeSub.time.from && subs[i].time.to === fakeSub.time.to && subs[i].text === fakeSub.text) {
                subs.splice(i, 1);
            }
        }
        if (subs.length === 0) {
            this.subsList.innerHTML = '<p id="nosubs" style="color:lightgray;">No subtitles added yet. Press the plus on the bottom of this panel to get started!</p>';
        }
        parent.remove();
    }
    importSubs() {
        const element = document.createElement('input');
        element.type = 'file';
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        element.addEventListener('change', () => {
            element.files[0].text().then((file) => {
                const subs = JSON.parse(file);
                this.importSubsJSON(subs);
                document.body.removeChild(element);
            });
        });
    }
    exportSubs() {
        const id = `s${this.metadata.season.toString().padStart(2, '0')}.e${this.metadata.episode.toString().padStart(3, '0')}`;
        const time = (new Date()).toISOString().slice(0, 19).replace(/:/g, '-').replace("T", " ");
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(subs, null, 2))}`);
        element.setAttribute('download', `${id} ${time}.uasub`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    parseTime(num) {
        return new Date(num * 1000).toISOString().substr(14, 9);
    }
    importSubsJSON(subs) {
        for (var i = 0; i < subs.length; i++) {
            this.createSub(subs[i].text, subs[i].time.from, subs[i].time.to);
        }
    }
}
//# sourceMappingURL=subPanel.js.map