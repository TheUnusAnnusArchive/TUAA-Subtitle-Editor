import { api } from '../../ts/_vars.js';
import { Timeline } from './timeline.js';
import { SubPanel, subs } from './subPanel.js';
const query = new URLSearchParams(location.search);
const player = document.querySelector('#player');
export var plyr;
const eps = query.get('v');
fetch(`${api}/v2/metadata/episode/${eps}`).then(res => res.json()).then(init);
function init(metadata) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (((_b = (_a = metadata.posters) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.type) == 'image/webp' || metadata.thumbnail.endsWith('.webp')) {
        if (supportsWebp()) {
            document.querySelector('video').setAttribute('poster', ((_d = (_c = metadata.posters) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.src) || metadata.thumbnail);
        }
        else {
            document.querySelector('video').setAttribute('poster', ((_f = (_e = metadata.posters) === null || _e === void 0 ? void 0 : _e[1]) === null || _f === void 0 ? void 0 : _f.src) || metadata.thumbnail.replace('.webp', '.jpg'));
        }
    }
    else {
        document.querySelector('video').setAttribute('poster', ((_h = (_g = metadata.posters) === null || _g === void 0 ? void 0 : _g[1]) === null || _h === void 0 ? void 0 : _h.src) || metadata.thumbnail.replace('.webp', '.jpg'));
    }
    const controls = [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'settings'
    ];
    const settings = [
        'quality',
        'speed'
    ];
    // @ts-ignore (typescript thinks that Plyr doesn't exist when it does)
    plyr = new Plyr(player, {
        controls,
        settings,
        autoplay: true,
        disableContextMenu: false,
        previewThumbnails: {
            src: `${api}/v2/previews/${eps}`
        }
    });
    plyr.source = {
        type: 'video',
        title: metadata.title,
        sources: metadata.sources || [{ src: metadata.video, type: 'video/mp4', size: 1080 }]
    };
    plyr.currentTrack = 1; //Turn on captions
    //Define metadata fields
    const pagetitle = document.getElementById('pagetitle');
    const title = document.getElementById('title');
    const season = document.getElementById('season');
    const episode = document.getElementById('episode');
    //Set metadata
    title.innerText = metadata.title;
    //If this is the specials season, then set metadata.seasonname to 'Specials'
    if (metadata.season === 0) {
        metadata.seasonname = 'Specials';
    }
    else {
        metadata.seasonname = `Season ${metadata.season}`;
    }
    pagetitle.innerText = `${metadata.seasonname} - Episode ${metadata.episode} - ${metadata.title}`;
    season.innerText = metadata.seasonname;
    episode.innerText = `Episode ${metadata.episode}`;
    // document.getElementById('subs').addEventListener('change', () => {
    //   setVTT((<HTMLTextAreaElement>document.getElementById('subs')).value, metadata)
    // })
    if ((metadata.season === 1 && metadata.episode === 367) || (metadata.season === 1 && metadata.episode === 368)) {
        document.getElementById('tlprogress').style.display = 'none';
        document.getElementById('timelineloading').remove();
        document.getElementById('timeline').remove();
        const error = document.createElement('p');
        error.innerText = 'Sorry, but the timeline is not supported on this video.';
        document.querySelector('.timelinecontainer').appendChild(error);
    }
    else {
        const timeline = new Timeline('#timeline', metadata, '#timelineloading');
        setInterval(() => {
            timeline.updateProgressPosition('#tlprogress', plyr.currentTime, plyr.duration);
        }, 100);
    }
    //Initialize Subtitle Panel
    const subpanel = new SubPanel('.subcontainer', metadata);
    document.getElementById('export').addEventListener('click', () => {
        const id = `s${metadata.season.toString().padStart(2, '0')}.e${metadata.episode.toString().padStart(3, '0')}`;
        const time = (new Date()).toISOString().slice(0, 19).replace(/:/g, '-').replace('T', ' ');
        const vtt = subs.toString();
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/vtt;charset=utf-8,${encodeURIComponent(vtt)}`);
        element.setAttribute('download', `${id} ${time}.vtt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    });
    //Fetch video ffprobe so we can use , and . to skip between frames
    fetch(`https://cdn.unusann.us/ffprobe.php?file=${metadata.sources[metadata.sources.length - 1].src.replace('//cdn.unusannusarchive.tk', '')}`).then(res => res.text()).then(res => {
        const fps = parseFloat(res.replace(/([0-9][0-9](.[0-9][0-9])? fps)|[^]/g, '$1'));
        document.addEventListener('keyup', (e) => {
            if (document.querySelector('.plyr') === document.activeElement) {
                if (e.code === 'Comma') {
                    //Back one frame
                    plyr.currentTime -= (1000 / fps) / 1000;
                }
                else if (e.code === 'Period') {
                    //Forward one frame
                    plyr.currentTime += (1000 / fps) / 1000;
                }
            }
        });
    });
}
setInterval(displayVTT, 100);
function displayVTT() {
    if (!document.querySelector('.plyr__captions')) {
        const plyr__captions = document.createElement('div');
        plyr__captions.classList.add('plyr__captions');
        plyr__captions.style.display = 'block';
        plyr__captions.innerHTML = '<span class="plyr__caption"></span>';
        document.querySelector('.plyr').appendChild(plyr__captions);
    }
    if (document.querySelector('.plyr__captions').style.display !== 'block') {
        document.querySelector('.plyr__captions').style.display = 'block';
    }
    if (!document.querySelector('.plyr__captions .plyr__caption')) {
        const plyr__caption = document.createElement('span');
        plyr__caption.classList.add('plyr__caption');
        document.querySelector('.plyr__captions').appendChild(plyr__caption);
    }
    var hasCaption = false;
    for (var i = 0; i < subs.length; i++) {
        if (subs[i].time.from < plyr.currentTime && subs[i].time.to > plyr.currentTime) {
            hasCaption = true;
            document.querySelector('.plyr__caption').innerText = subs[i].text;
        }
    }
    if (!hasCaption) {
        document.querySelector('.plyr__caption').innerHTML = '';
    }
}
document.getElementById('back').addEventListener('click', () => {
    localStorage.setItem(`unsaved-sub-${query.get('v')}`, JSON.stringify(subs));
    location.href = '/';
});
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
//# sourceMappingURL=main.js.map