require('../css/index.css')
require('font-awesome/css/font-awesome.css')
// const particlesJS = require('exports?particlesJS!particles.js')
require('./unslider')
require('./typed')
import lunr from 'lunr'
import price from './price'
import quotes from './quotes.json'

const createAssciimaPlayer = function(num) {
  asciinema_player.core.CreatePlayer(
    'asciicast' + num,
    '/assets/asciicast/case' + num + '.json',
    { width: 181, height: 18, speed: 7 }
  )
}

// Pick from underscore
const debounce = function(func, wait, immediate) {
  var timeout, args, context, timestamp, result;

  var later = function() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function() {
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

const initCloudAnimate = () => {
  const items = $('#index .map .item')
  if (!items.length) return
  let idx = 0
  setInterval(() => {
    for (let item of items) $(item).removeClass('active')
    $(items[idx]).addClass('active')
    if (++idx >= items.length) idx = 0
  }, 5000)
}

const setPrice = (type) => {
  const elem = $('#index .prices .detail')
  if (!elem.length) return
  const detail = price[type]
  elem.find('.type').text(type)
  elem.find('.cpu').text(detail.cpu)
  elem.find('.mem').text(detail.mem)
  elem.find('.disk').text(detail.disk)
  elem.find('.net').text(detail.net)
  elem.find('.month').text(`${detail.month} / Month`)
  elem.find('.second').text(`${detail.second} / Second`)
}

const initPriceSlider = () => {
  const items = $('#index .prices .slider .item')
  if (!items.length) return
  items.hover(function() {
    items.removeClass('active')
    $(this).addClass('active')
    const type = $(this).find('.type').text()
    setPrice(type)
  })
}

const initTab = (id) => {
  const items = $(`${id} .tabs > .items .item`)
  if (!items.length) return
  items.hover(function() {
    items.removeClass('active')
    $(this).addClass('active')
    $(`${id} .detail`).removeClass('active')
    $(`${id} .detail.detail-${$(this).index()}`).addClass('active')
  })
}

const delay = async (func, time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      func()
      resolve()
    }, time)
  })
}

const initTyping = async () => {
  $('.line-1').addClass('active')
  await delay(() => $('.line-2').addClass('active'), 2000)
  await delay(() => $('.line-3').addClass('active'), 2000)
  await delay(() => $('.line-4').addClass('active'), 2000)
  await delay(() => $('.result-1').addClass('active'), 2000)
  await delay(() => $('.line-5').addClass('active'), 200)
  await delay(() => $('.result-2').addClass('active'), 3000)
}

const initArticlesSearch = async () => {
  if (!$('#howto').length) return
  const articles = await $.getJSON('/howto/index.json')
  let db = lunr(function() {
    this.field('title', { boost: 10 })
    this.field('content')
  })
  articles.forEach((article, idx) => {
    db.add({
      id: idx,
      title: article.title,
      content: article.content
    })
  })
  const itemTpl = (title, preview, link) => {
    return `
    <li class="article">
        <a class="title" href="/howto/${link}">${title}</a>
        <section class="preview content">${preview}...</section>
    </li>
    `
  }
  const oriHtml = $('#howto .article-list').html()
  const count = $('#howto .info .count').text()
  $('#search').on('input', debounce(function() {
    const keyword = $(this).val().trim()
    const results = db.search(keyword)
    if (results.length) {
      let retHtml = ''
      results.forEach((result) => {
        const item = articles[result.ref]
        const itemHtml = itemTpl(item.title, item.preview, item.link)
        retHtml += itemHtml
      })
      $('#howto .page-nav').hide()
      $('#howto .article-list').html(retHtml)
      $('#howto .info .count').text(results.length)
    } else {
      if (keyword) {
        $('#howto .page-nav').hide()
        $('#howto .info .count').text('0')
        $('#howto .article-list').html(`<div class="empty">No Results for "<span>${keyword}</span>"</div>`)
      } else {
        $('#howto .page-nav').show()
        $('#howto .article-list').html(oriHtml)
        $('#howto .info .count').text(count)
      }
    }
  }, 500))
}

const initSignup = () => {
  document.signup.onsubmit = (event) => {
    event.preventDefault()
    try {
      const data = btoa(encodeURI(JSON.stringify({
        firstName: document.signup.firstname.value,
        lastName: document.signup.lastname.value,
        email: document.signup.email.value,
        password: document.signup.password.value
      })))
      location.href = `https://console.hyper.sh/register/${data}`
    } catch(err) {
      location.href = `https://console.hyper.sh/register`
    }
  }
}

const initBackground = () => {
  try {
    if ($('#background').length) {
      particlesJS.load('background', '/assets/particles.json')
    }
  } catch(err) {}
}

const bindEvents = () => {
  $('.item-dropdown').click((evt) => $(evt.currentTarget).toggleClass('active'))
  $('#header .nav-toggle').click(evt => $('#header nav').toggleClass('show'))
}

const initSlider = () => {
  const tpl = (data) => {
    return `
    <li>
      <div class="word">${data.content}</div>
      <div class="name">${data.name}</div>
      <div class="intro">${data.title}</div>
    </li>
    `
  }
  let str = ''
  for (const item of quotes) {
    str += tpl(item)
  }
  $('#echo-slider ul').html(str)
  $('#echo-slider').unslider({
    autoplay: true,
    speed: 300,
    delay: 10000
  })
}

const initTyped = async () => {
  const typed = (i) => {
    const dom = $($('#code .line')[i])
    const text = dom.attr('text')
    if (i == 1) {
      // $('#entry').addClass('zoom')
      $('#code').addClass('zoom')
    }
    if (i == 8) {
      setTimeout(() => {
        // $('#entry').removeClass('zoom')
        $('#code').removeClass('zoom')
      }, 1000)
    }
    i++
    setTimeout(() => {
      if (dom.hasClass('result')) {
        dom.text(text)
        typed(i)
        if (i >= 8) {
          setTimeout(() => {
            $('#code .line').html('')
            typed(0)
          }, 5000)
        }
      } else {
        dom.typed({
          strings: [dom.attr('text')],
          typeSpeed: 10,
          startDelay: (i == 1 ? 2000 : 0),
          callback: () => {
            if (i < 8) {
              $('.typed-cursor').remove()
              typed(i)
            }
          }
        })
      }
    }, 1000)
  }

  typed(0)
}

const updateButton = () => {
  const tz = new Date().getTimezoneOffset()
  if (tz !== -480) {
    const txt = 'Start 2-month free tier'
    $('.signup-button').text(txt).val(txt)
  }
}

const getUrlVars = () => {
  let vars = [], hash
  const hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&')
  for(let i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=')
    vars.push(hash[0])
    vars[hash[0]] = hash[1]
  }
  return vars
}

const initRegionUX = () => {
  const querys = getUrlVars()
  const $dom = $('.region-select.active')
  $dom.val(querys['region'])
  $dom.on('change', (event) => {
    const region = event.target.value
    const path = region ? '?region=' + region : ''
    location.href = location.pathname + path
  })
}

const loadPrice = () => {
  if (!$('#pricing.pi').length) return

  const Second = {
    Hour: 3600,
    Day: 3600 * 24,
    Month: 3600 * 24 * 30,
  }

  $.getJSON('https://raw.githubusercontent.com/hyperhq/h8s.hyper.sh-docs/hyperpod/price.json', function(pricing) {
    pricing = pricing.region['gcp-us-central1']
    // render pod
    const podHtmlArray = pricing.pod.map((p, idx) => {
      const prefix = idx % 2 === 0 ? '<tr>' : '<tr class="alt">'

    return `${prefix}
      <td>${p.name}</td>
      <td>${p.cpu}</td>
      <td>${p.memory}MB</td>
      <td>10GB*</td>
      <td>FREE</td>
      <td>${p.price}</td>
      <td>${(p.price * Second.Hour).toFixed(5)}</td>
      <td>${(p.price * Second.Month).toFixed(2)}</td>
    </tr>`
    })


    $('#pod tbody').html(podHtmlArray.join('\n'))

    // render fip
    const fp = pricing.fip.price
    $('.fip-price').html(fp)
    // render volume
    const vp = pricing.volume.price
    const vunit = pricing.volume.unit
    const vHtml = `<td>${pricing.volume.name}</td><td>$${vp.toFixed(10)}/${vunit}</td><td>$${(vp * Second.Hour).toFixed(10)}/${vunit}</td><td>$${(vp * Second.Month).toFixed(10)}/${vunit}</td>`
    $('#volume-row').html(vHtml)

    // render rootfs
    const rp = pricing.rootfs.price
    const runit = pricing.volume.unit
    const rHtml = `<td>${pricing.rootfs.name}</td><td>$${rp.toFixed(10)}/${runit}</td><td>$${(rp * Second.Hour).toFixed(10)}/${runit}</td><td>$${(rp * Second.Month).toFixed(10)}/${runit}</td>`
    $('#rootfs-row').html(rHtml)
  })
}

$(() => {

  bindEvents()
  // initBackground()
  // initPriceSlider()
  initTab('.product')
  initTab('#howto')
  initArticlesSearch()
  // setPrice('S4')
  initSignup()
  initTyped()
  initSlider()
  updateButton()
  initRegionUX()
  loadPrice()
  // initCloudAnimate()
  // initTyping()
  // createAssciimaPlayer(1)
  // createAssciimaPlayer(2)
  // createAssciimaPlayer(3)
  // createAssciimaPlayer(4)
})
