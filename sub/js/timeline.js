export class Timeline {
    constructor(element, metadata, loadingElement) {
        var _a, _b, _c;
        var Element;
        if (typeof element === 'string' || element instanceof String) {
            Element = document.querySelector(element);
        }
        else {
            Element = element;
        }
        this.element = Element;
        var LoadingElement;
        if (loadingElement) {
            if (typeof loadingElement === 'string' || loadingElement instanceof String) {
                LoadingElement = document.querySelector(loadingElement);
            }
            else {
                LoadingElement = loadingElement;
            }
        }
        //Init audio context
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        let currentBuffer = null;
        visualizeAudio('https:' + (((_c = (_a = metadata.sources) === null || _a === void 0 ? void 0 : _a[((_b = metadata.sources) === null || _b === void 0 ? void 0 : _b.length) - 1]) === null || _c === void 0 ? void 0 : _c.src) || metadata.video));
        //Fetch audio
        function visualizeAudio(url) {
            fetch(url)
                .then(res => res.arrayBuffer())
                .then(buffer => audioContext.decodeAudioData(buffer))
                .then(buffer => draw(normalizeData(filterData(buffer))));
        }
        //Filter audio
        function filterData(audioBuffer) {
            const rawData = audioBuffer.getChannelData(0);
            const samples = 512;
            const blockSize = Math.floor(rawData.length / samples);
            const filteredData = [];
            for (var i = 0; i < samples; i++) {
                const blockStart = blockSize * i;
                var sum = 0;
                for (var j = 0; j < blockSize; j++) {
                    sum = sum + Math.abs(rawData[blockStart + j]);
                }
                filteredData.push(sum / blockSize);
            }
            return filteredData;
        }
        //Normalize audio
        function normalizeData(filteredData) {
            const multiplier = Math.pow(Math.max(...filteredData), -1);
            return filteredData.map(n => n * multiplier);
        }
        function draw(normalizedData) {
            //Initialize canvas
            const canvas = Element;
            const padding = 0;
            canvas.height = canvas.offsetHeight + padding * 2;
            const ctx = canvas.getContext('2d');
            ctx.translate(0, canvas.offsetHeight / 2 + padding);
            //Draw
            const width = canvas.width / normalizedData.length;
            for (var i = 0; i < normalizedData.length; i++) {
                const x = width * i;
                var height = normalizedData[i] * canvas.offsetHeight - padding;
                if (height < 0) {
                    height = 0;
                }
                else if (height > canvas.offsetHeight / 2) {
                    height = height > canvas.offsetHeight / 2;
                }
                drawLineSegment(ctx, x, height, width, (i + 1) % 2);
            }
            if (LoadingElement) {
                LoadingElement.remove();
            }
        }
        function drawLineSegment(ctx, x, y, width, isEven) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#ffffff';
            ctx.beginPath();
            y = isEven ? y : -y;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, y);
            ctx.arc(x + width / 2, y, width / 2, Math.PI, 0, isEven);
            ctx.lineTo(x + width, 0);
            ctx.stroke();
        }
    }
    updateProgressPosition(progressBar, sec, maxSec) {
        var ProgressBar;
        if (typeof progressBar === 'string' || progressBar instanceof String) {
            ProgressBar = document.querySelector(progressBar);
        }
        else {
            ProgressBar = progressBar;
        }
        const pixels = (sec / maxSec) * this.element.clientWidth;
        ProgressBar.style.transform = `translateY(-10px) translateX(${pixels - 1}px)`;
    }
}
//# sourceMappingURL=timeline.js.map