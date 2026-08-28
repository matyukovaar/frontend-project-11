import './style.css'
import { proxy } from 'valtio/vanilla'
import { validateURL } from './validation.js'
import {initView} from './view.js'
import i18next from 'i18next'
import resourses from './locales/ru.js'


const state = proxy({
  inputValue: '',
  error: '',
  status: 'filling', //invalid
  feeds: [],
  lang: 'ru'
})

const i18n = i18next.createInstance()
i18n.init({
  lng: 'ru', 
  debug: false,
  resources: {
    ru: resourses,
  }
})
.then(() => {
  const container = document.querySelector('.container')
  const form = document.getElementById('rss-form')
  const resultDiv = document.getElementById('results-list')
  const input = document.getElementById('rss-url')
  const errorDiv = document.getElementById('error-message')
  const elemets = {
    container,
    form,
    resultDiv,
    input,
    errorDiv
  }
  initView(state, elemets, i18n)
  form.addEventListener('submit', (e) => {
    e.preventDefault()
  
    const formData = new FormData(form)
    const url = formData.get('url').trim()
  
    state.inputValue = url
    validateURL(state.inputValue, state).then((result) => {
      if (!result.isValid) {
        state.error = result.error
        state.status = 'invalid'
        initView(state, elemets,i18n)
        form.reset()
        return
      }

      state.feeds.push(state.inputValue)
      state.inputValue = ''
      state.error = ''
      state.status = 'filling'
      form.reset()
      initView(state, elemets, i18n)

  })

  })
  input.addEventListener('input', (event) => {
    state.inputValue = event.target.value
    if (state.error) {
      state.error = ''
    }
  })
})


