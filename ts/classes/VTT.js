export class VTT extends Array {
    toString() {
        var output = 'WEBVTT';
        for (var i = 0; i < this.length; i++) {
            const from = `${new Date(this[i].time.from * 1000).toISOString().substr(11, 11)}0`;
            const to = `${new Date(this[i].time.to * 1000).toISOString().substr(11, 11)}0`;
            output += `\n\n${from} --> ${to}\n${this[i].text}`;
        }
        return output;
    }
}
//# sourceMappingURL=VTT.js.map