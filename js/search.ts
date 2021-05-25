//Code from main site home page converted to ts
import { GlobalMetadata, Metadata } from '../ts/types/_metadata'

const searchbox = <HTMLInputElement>document.getElementById('searchbox')
const template = <HTMLTemplateElement>document.getElementById('template')
const vidcontainer = document.getElementById('vidcontainer')

var lastQuery = ''

function videosLoaded(oldMetadata: GlobalMetadata) {
  var metadata:Metadata[] = []
  for (var i = 0; i < oldMetadata.videos.length; i++) {
    for (var s = 0; s < oldMetadata.videos[i].length; s++) {
      metadata.push(oldMetadata.videos[i][s])
    }
  }
  searchbox.oninput = () => {
    const timeBefore = performance.now()
    //Get results
    const query = searchbox.value.toLowerCase().split(' ')
    lastQuery = query.join(' ')
    var results = []
    if (searchbox.value === '') {
      results = metadata
    } else {
      for (var i = 0; i < metadata.length; i++) {
        for (var q = 0; q < query.length; q++) {
          if (metadata[i].title?.toLowerCase().split(' ').includes(query[q])) {
            if (!results.includes(metadata[i])) {
              results.push(metadata[i])
            }
          } else if (metadata[i].episode.toString() == query[q]) {
            if (!results.includes(metadata[i])) {
              results.push(metadata[i])
            }
          }
        }
      }
    }
    
    //Render results
    const vidcontainer = document.getElementById('vidcontainer')

    vidcontainer.innerHTML = ''
    document.getElementById('searchStat').innerHTML = ''

    if (results.length === 0) {
      const timeAfter = performance.now()
      document.getElementById('searchStat').innerText = `No results found! (${Math.round((timeAfter-timeBefore))/1000} seconds)`
    }
    setTimeout(() => {
      if (lastQuery === query.join(' ')) {
        setResults(results, metadata, timeBefore)
      }
    }, 500)

  }
}

function setResults(results:Metadata[], metadata:Metadata[], timeBefore:number) {
  for (var i = 0; i < results.length; i++) {
    const clone = <any>template.content.cloneNode(true)

    if (results[i].video || results[i].sources) {
      const season = `${results[i].season}`.padStart(2, '0')
      const episode = `${results[i].episode}`.padStart(3, '0')
  
      clone.getElementById('url').href = `/watch/?v=s${season}.e${episode}`
      if (results[i].thumbnail?.endsWith('.webp') || results[i].posters?.[0]) {
        if (supportsWebp()) {
          clone.getElementById('thumbnail').src = results[i].thumbnail || results[i].posters?.[0].src
        } else {
          clone.getElementById('thumbnail').src = results[i].thumbnail.replace('.webp', '.jpg') || results[i].posters?.[1].src
        }
      } else {
        clone.getElementById('thumbnail').src = results[i].thumbnail || results[i].posters?.[0].src
      }
      clone.getElementById('title').innerText = results[i].title
      if (results[i].season === 0) {
        clone.getElementById('season').innerText = 'Specials'
      } else {
        clone.getElementById('season').innerText = `Season ${results[i].season}`
      }
      clone.getElementById('episode').innerText = `Episode ${results[i].episode}`
    }

    clone.getElementById('thumbnail').addEventListener('error', () => {
      document.getElementById('err').style.display = 'initial'
    })

    vidcontainer.appendChild(clone)
  }
  const timeAfter = performance.now()

  if (results !== metadata) {
    document.getElementById('searchStat').innerHTML = `${results.length} results (${Math.round((timeAfter-timeBefore))/1000} seconds)<br />`
  }
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

export { videosLoaded }