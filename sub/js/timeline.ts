import { Metadata } from "../../ts/types/_metadata"

export class Timeline {
  element:HTMLCanvasElement

  constructor(element:string|HTMLCanvasElement, metadata:Metadata, loadingElement?:string|HTMLElement) {
    var Element:HTMLCanvasElement
    if (typeof element === 'string' || element instanceof String) {
      Element = document.querySelector(<string>element)
    } else {
      Element = element
    }

    this.element = Element

    var LoadingElement:HTMLElement
    if (loadingElement) {
      if (typeof loadingElement === 'string' || loadingElement instanceof String) {
        LoadingElement = document.querySelector(<string>loadingElement)
      } else {
        LoadingElement = loadingElement
      }
    }

    //Init audio context
    window.AudioContext = window.AudioContext || (<any>window).webkitAudioContext
    const audioContext = new AudioContext()
    let currentBuffer = null

    visualizeAudio('https:' + (metadata.sources?.[metadata.sources?.length-1]?.src || metadata.video))

    //Fetch audio
    function visualizeAudio(url:string) {
      fetch(url)
        .then(res => res.arrayBuffer())
        .then(buffer => audioContext.decodeAudioData(buffer))
        .then(buffer => draw(normalizeData(filterData(buffer))))
    }

    //Filter audio
    function filterData(audioBuffer:AudioBuffer):number[] {
      const rawData = audioBuffer.getChannelData(0)
      const samples = 512
      const blockSize = Math.floor(rawData.length / samples)
      const filteredData = []
      for (var i = 0; i < samples; i++) {
        const blockStart = blockSize * i
        var sum = 0
        for (var j = 0; j <blockSize; j++) {
          sum = sum + Math.abs(rawData[blockStart + j])
        }
        filteredData.push(sum / blockSize)
      }
      return filteredData
    }

    //Normalize audio
    function normalizeData(filteredData:number[]):number[] {
      const multiplier = Math.pow(Math.max(...filteredData), -1)
      return filteredData.map(n => n*multiplier)
    }

    function draw(normalizedData:number[]):void {
      //Initialize canvas
      const canvas = <HTMLCanvasElement>Element
      const padding = 0
      canvas.height = canvas.offsetHeight + padding * 2
      const ctx = canvas.getContext('2d')
      ctx.translate(0, canvas.offsetHeight / 2 + padding)

      //Draw
      const width = canvas.width / normalizedData.length
      for (var i = 0; i < normalizedData.length; i++) {
        const x = width * i
        var height:number|boolean = normalizedData[i] * canvas.offsetHeight - padding
        if (height < 0) {
          height = 0
        } else if (height > canvas.offsetHeight / 2) {
          height = height > canvas.offsetHeight / 2
        }
        drawLineSegment(ctx, x, height, width, (i + 1) % 2)
      }
      if (LoadingElement) {
        LoadingElement.remove()
      }
    }

    function drawLineSegment(ctx:CanvasRenderingContext2D, x:number, y:number|boolean, width:number, isEven:number) {
      ctx.lineWidth = 1
      ctx.strokeStyle = '#ffffff'
      ctx.beginPath()
      y = isEven ? y : -y
      ctx.moveTo(x, 0)
      ctx.lineTo(x, <number>y)
      ctx.arc(x + width / 2, <number>y, width / 2, Math.PI, 0, <boolean><any>isEven)
      ctx.lineTo(x + width, 0)
      ctx.stroke()
    }
  }

  updateProgressPosition(progressBar:string|HTMLElement, sec:number, maxSec:number):void {
    var ProgressBar:HTMLElement
    if (typeof progressBar === 'string' || progressBar instanceof String) {
      ProgressBar = document.querySelector(<string>progressBar)
    } else {
      ProgressBar = progressBar
    }
    const pixels = (sec/maxSec)*this.element.clientWidth
    ProgressBar.style.transform = `translateY(-10px) translateX(${pixels-1}px)`
  }
}