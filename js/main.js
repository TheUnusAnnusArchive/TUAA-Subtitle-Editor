import { videosLoaded } from './search.js';
import { api } from '../ts/_vars.js';
var globalMetadata = {};
fetch(`${api}/v2/metadata/video/all`).then(res => res.json()).then((metadata) => {
    globalMetadata.videos = metadata;
    for (var s = 0; s < metadata.length; s++) {
        for (var e = 0; e < metadata[s].length; e++) {
            init(metadata[s][e]);
        }
    }
    document.querySelector('div#loadingText').remove();
    videosLoaded(globalMetadata);
});
function init(metadata) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const template = document.getElementById('template');
    const vidcontainer = document.getElementById('vidcontainer');
    const clone = template.content.cloneNode(true);
    const season = metadata.season.toString().padStart(2, '0');
    const episode = metadata.episode.toString().padStart(3, '0');
    clone.getElementById('url').href = `/sub/?v=s${season}.e${episode}`;
    if (((_b = (_a = metadata.posters) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.type) == 'image/webp' || metadata.thumbnail.endsWith('.webp')) {
        if (supportsWebp()) {
            clone.getElementById('thumbnail').src = ((_d = (_c = metadata.posters) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.src) || metadata.thumbnail;
        }
        else {
            clone.getElementById('thumbnail').src = ((_f = (_e = metadata.posters) === null || _e === void 0 ? void 0 : _e[1]) === null || _f === void 0 ? void 0 : _f.src) || metadata.thumbnail.replace('.webp', '.jpg');
        }
    }
    else {
        clone.getElementById('thumbnail').src = ((_h = (_g = metadata.posters) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.src) || metadata.thumbnail;
    }
    clone.getElementById('thumbnail').alt = `Thumbnail for "${metadata.title}"`;
    clone.getElementById('title').innerText = metadata.title;
    if (metadata.season == 0) {
        clone.getElementById('season').innerText = 'Specials';
    }
    else {
        clone.getElementById('season').innerText = `Season ${metadata.season}`;
    }
    clone.getElementById('episode').innerText = `Episode ${metadata.episode}`;
    clone.getElementById('thumbnail').addEventListener('error', () => {
        document.getElementById('err').style.display = 'initial';
    });
    vidcontainer.appendChild(clone);
}
function supportsWebp() {
    var elem = document.createElement('canvas');
    if (!!(elem.getContext && elem.getContext('2d'))) {
        // was able or not to get WebP representation
        return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
    }
    else {
        // very old browser like IE 8, canvas not supported
        return false;
    }
}
export { globalMetadata };
//# sourceMappingURL=main.js.map