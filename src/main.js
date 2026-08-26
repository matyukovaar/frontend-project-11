import './style.css'

const form = document.getElementById('rss-form')
const resultDiv = document.getElementById('result')

form.addEventListener('submit', (event) => {
  event.preventDefault()
  
  const formData = new FormData(form)
  const url = formData.get('url')
  
  resultDiv.innerHTML = `<p class="text-green-400 text-sm mt-2">RSS успешно добавлен: ${url}</p>`
  
  form.reset()
})