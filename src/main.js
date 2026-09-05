import './style.css'
import { proxy } from 'valtio/vanilla'
import { validateURL } from './validation.js'
import {initView} from './view.js'
import i18next from 'i18next'
import resourses from './locales/ru.js'
import axios from 'axios'

export function app(){
const state = proxy({
  inputValue: '',
  error: '',
  formStatus: 'filling', //invalid
  feeds: [],
  posts: [],
  loadingStatus: 'idle', //loading, success, failed
  lang: 'ru',
  feedsIDCounter: 0,
  postsIDCounter: 0,
  isChecking: false,
  activeModalPost: null,
  
})

const fetchData = (url) => {
  return axios.get('https://allorigins.hexlet.app/get', {
    params: {
      url: url,
      disableCache: true
    }
  })
   .then(response => {
    if (response.data.status.http_code  !== 200) {
      throw new Error('NETWORK_ERR')
    }
    return {
      contents: response.data.contents,
      originalUrl: url
    }
  })
}

const parseRSS = (xmlString, originalUrl) => {
  const parser = new DOMParser()
  const rawDOM = parser.parseFromString(xmlString, 'application/xml')
  
  const errorNode = rawDOM.querySelector('parsererror')
  if (errorNode) {
    throw new Error('NOT_RSS')
  }

  const channel = rawDOM.querySelector('channel')
  if (!channel) throw new Error('NOT_RSS')
  
    
  const feed = {
    title: channel.querySelector('title').textContent, 
    description: channel.querySelector('description').textContent,
    link: originalUrl
  }


  const itemsNodes = channel.querySelectorAll('item')
  const items = Array.from(itemsNodes).map((post) => {
    return {
      title: post.querySelector('title').textContent,
      link: post.querySelector('link').textContent,
      description: post.querySelector('description').textContent,
      hasSeen: false 
    }
  })

  return { feed, items }
}

const isUniqueFeed = (newFeed) => {
  return !state.feeds.some(feed => feed.link === newFeed.link)
}

const isUniquePost = (newPost) => {
  return !state.posts.some(post => post.link === newPost.link)
}

const interval = 5000
const checkForUpdates = () => {
  if(state.feeds.length === 0) {
    setTimeout(checkForUpdates, interval)
    return
  }
  
  const promises = state.feeds.map((feed) => {
    return fetchData(feed.link) 
    .then(({ contents, originalUrl }) => {
      const parsedData = parseRSS(contents, originalUrl)
      
      parsedData.items.forEach((item) => {
        const isNew = isUniquePost(item)
        if (isNew) {
          const postId = state.postsIDCounter++
          state.posts.push({ ...item, id: postId, feedId: feed.id })
        }
      })
    })
    .catch((error) => {
      console.warn(`Ошибка обновления ленты: ${feed.link}`, error.message)
    })
  })

  Promise.all(promises).finally(() => {
    setTimeout(checkForUpdates, interval)
  })
}

const i18n = i18next.createInstance()
i18n.init({
  lng: 'ru', 
  debug: false,
  resources: {
    ru: resourses,
  }
})
.then(() => {
  const container = document.body
  const form = document.getElementById('rss-form')
  const resultDiv = document.getElementById('results-list')
  const input = document.getElementById('rss-url')
  const feedbackEl = document.getElementById('feedback')
  const elements = {
    container,
    form,
    resultDiv,
    input,
    feedbackEl
  }

  initView(state, elements, i18n)

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const formData = new FormData(form)
    const url = formData.get('url').trim()

    state.inputValue = url
  
    validateURL(url, state).then((result) => {
      if (!result.isValid) {
        state.error = result.error
        state.formStatus = 'invalid'
        form.reset()
        throw new Error('VALIDATION_ERR')
      }
      state.inputValue = ''
      state.error = ''
      state.formStatus = 'filling'
      form.reset()

      state.loadingStatus = 'loading'
    
      return result.url 
    }).then((validUrl) => {
        return fetchData(validUrl)
    }).then(({contents, originalUrl}) => {
      const parsedData = parseRSS(contents, originalUrl)
      if (!isUniqueFeed(parsedData.feed)) {
        throw new Error('NOT_UNIQUE_FEED')
      }
    
      const feedId = state.feedsIDCounter++
      state.feeds.push({ ...parsedData.feed, id: feedId })
    
      parsedData.items.forEach((item) => {
        const postId = state.postsIDCounter++
        state.posts.push({ ...item, id: postId, feedId })
      })
    
      state.loadingStatus = 'success'
      if(!state.isChecking) {
        checkForUpdates()
        state.isChecking = true
      }
      initView(state,elements, i18n)
    }).catch((error) => {
      if (error.message === 'VALIDATION_ERR') return
    
      state.loadingStatus = 'failed'
      if (error.message === 'NETWORK_ERR' || error.code === 'ERR_NETWORK') {
        state.error = 'networkError'
      } else if (error.message === 'NOT_RSS') {
        state.error = 'notRSS'
      } else if (error.message === 'NOT_UNIQUE_FEED') {
        state.error = 'notUniqueFeed'
      } else {
        state.error = 'unknownError' 
      }
    })
  })


  input.addEventListener('input', (event) => {
    state.inputValue = event.target.value
    if (state.error) {
      state.error = ''
    }
  })

  resultDiv.addEventListener('click', (e) => {
    const previewBtn = e.target.closest('.preview-btn')
    if (!previewBtn) return

    const postId = Number(previewBtn.dataset.postId)
    const post = state.posts.find(p => p.id === postId)

    if (post) {
      post.hasSeen = true 
      state.activeModalPost = post
    }
  })

  const closeModal = () => {
    state.activeModalPost = null
  }

  const modal = document.getElementById('modal')
  const modalClose = document.getElementById('modal-close')

  modalClose.addEventListener('click', closeModal)

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal()
    }
  })

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.activeModalPost !== null) {
    closeModal()
  }
  })


})

}



