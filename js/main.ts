import { GlobalMetadata, Metadata } from '../ts/types/_metadata'
import { HTMLClone } from '../ts/types/_html-clone'
import { videosLoaded } from './search.js'
import { api } from '../ts/_vars.js'

var globalMetadata:GlobalMetadata = {}

fetch(`${api}/v2/metadata/video/all`).then(res => res.json()).then((metadata:any) => {
  globalMetadata.videos = metadata
  for (var s = 0; s < metadata.length; s++) {
    for (var e = 0; e < metadata[s].length; e++) {
      init(metadata[s][e])
    }
  }
  document.querySelector('div#loadingText').remove()
  videosLoaded(globalMetadata)
})

function init(metadata:Metadata) {
  const template = <HTMLTemplateElement>document.getElementById('template')
  const vidcontainer = document.getElementById('vidcontainer')

  const clone = <HTMLClone><any>template.content.cloneNode(true)
  const season = metadata.season.toString().padStart(2, '0')
  const episode = metadata.episode.toString().padStart(3, '0');

  (<HTMLLinkElement>clone.getElementById('url')).href = `/sub/?v=s${season}.e${episode}`
  if (metadata.posters?.[0]?.type == 'image/webp' || metadata.thumbnail.endsWith('.webp')) {
    if (supportsWebp()) {
      (<HTMLImageElement>clone.getElementById('thumbnail')).src = metadata.posters?.[0]?.src || metadata.thumbnail
    } else {
      (<HTMLImageElement>clone.getElementById('thumbnail')).src = metadata.posters?.[1]?.src || metadata.thumbnail.replace('.webp', '.jpg')
    }
  } else {
    (<HTMLImageElement>clone.getElementById('thumbnail')).src = metadata.posters?.[0]?.src || metadata.thumbnail
  }
  (<HTMLImageElement>clone.getElementById('thumbnail')).alt = `Thumbnail for "${metadata.title}"`
  clone.getElementById('title').innerText = metadata.title
  if (metadata.season == 0) {
    clone.getElementById('season').innerText = 'Specials'
  } else {
    clone.getElementById('season').innerText = `Season ${metadata.season}`
  }
  clone.getElementById('episode').innerText = `Episode ${metadata.episode}`

  clone.getElementById('thumbnail').addEventListener('error', () => {
    document.getElementById('err').style.display = 'initial'
  })

  vidcontainer.appendChild(<HTMLElement><any>clone)
}

function supportsWebp():boolean {
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

export { globalMetadata }