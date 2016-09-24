require('../css/index.css')
require('font-awesome/css/font-awesome.css')
const particlesJS = require('exports?particlesJS!particles.js')
require('./unslider')
require('./typed')
import lunr from 'lunr'
import price from './price'

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
  const items = $(`#${id} .tabs > .items .item`)
  if (!items.length) return
  items.hover(function() {
    items.removeClass('active')
    $(this).addClass('active')
    $(`#${id} .detail`).removeClass('active')
    $(`#${id} .detail.detail-${$(this).index()}`).addClass('active')
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
  $('#header .nav-toggle').click(evt => $('#header nav').toggleClass('show'))
}

const initSlider = () => {
  $('.echo-slider').unslider()
}

const initTyped = async () => {
  // if (!$('#typed').length) return
  // $('#typed').typed({
  //   strings: ['container', 'microservices', 'serverless', 'CI/CD', 'Event-driven'],
  //   typeSpeed: 60,
  //   backDelay: 2000,
  //   loop: true
  // })

  const typed = (i) => {
    const dom = $($('#code .line')[i])
    const text = dom.attr('text')
    if (i == 1) {
      $('#entry').addClass('zoom')
      $('#code').addClass('zoom')
    }
    if (i == 8) {
      setTimeout(() => {
        $('#entry').removeClass('zoom')
        $('#code').removeClass('zoom')
      }, 1000)
    }
    i++
    setTimeout(() => {
      if (dom.hasClass('result')) {
        dom.text(text)
        typed(i)
      } else {
        dom.typed({
          strings: [dom.attr('text')],
          typeSpeed: 30,
          callback: () => {
            if (i < 10) {
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

$(() => {
  bindEvents()
  initBackground()
  initPriceSlider()
  initTab('features')
  initTab('howto')
  initArticlesSearch()
  setPrice('S4')
  initSignup()
  initTyped()
  // initSlider()
  // initCloudAnimate()
  // initTyping()
  // createAssciimaPlayer(1)
  // createAssciimaPlayer(2)
  // createAssciimaPlayer(3)
  // createAssciimaPlayer(4)
})
