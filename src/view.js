import { watch } from 'valtio/vanilla/utils'

export function initView(state, elements, i18n) {
  const { container, form, resultDiv, input, feedbackEl } = elements

  const label = form.querySelector('label')
  label.textContent = i18n.t('labelText')

  const h1 = container.querySelector('h1')
  h1.textContent = i18n.t('appName')
  
  const submitBtn = form.querySelector('.btn-add')
  submitBtn.textContent = i18n.t('submitButtonText')
  
  resultDiv.classList.add('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-8', 'items-start')

  const postsContainer = document.createElement('div')
  postsContainer.classList.add('md:col-span-2', 'bg-white', 'rounded', 'border', 'border-slate-200', 'p-6', 'shadow-sm')
  
  const postsName = document.createElement('h2')
  postsName.classList.add('text-2xl', 'font-bold', 'mb-6', 'text-slate-800')
  postsName.textContent = i18n.t('postsName')
  
  const postsList = document.createElement('ul')
  postsList.classList.add('space-y-4')
  postsContainer.append(postsName, postsList)

  const feedsContainer = document.createElement('div')
  feedsContainer.classList.add('bg-white', 'rounded', 'border', 'border-slate-200', 'p-6', 'shadow-sm')
  
  const feedsName = document.createElement('h2')
  feedsName.classList.add('text-2xl', 'font-bold', 'mb-4', 'text-slate-800')
  feedsName.textContent = i18n.t('feedsName')
  
  const feedsList = document.createElement('ul')
  feedsList.classList.add('space-y-4')
  feedsContainer.append(feedsName, feedsList)

  resultDiv.innerHTML = ''
  resultDiv.append(postsContainer, feedsContainer)

  watch((get) => {
    const errorKey = get(state).error
    const currentFeeds = get(state).feeds
    const currentPosts = get(state).posts
    const loadingStatus = get(state).loadingStatus

    feedbackEl.className = 'error-message text-sm mt-1'

    if(state.loadingStatus === 'loading') {
      submitBtn.disabled = true
    } else {
      submitBtn.disabled = false
    }
    if (errorKey) {
      feedbackEl.textContent = i18n.t(errorKey)
      feedbackEl.classList.add('text-red-400')
    } else if (loadingStatus === 'success') {
      feedbackEl.textContent = i18n.t('success')
      feedbackEl.classList.add('text-green-400')
    } else {
      feedbackEl.textContent = ''
    }

    feedsList.innerHTML = ''
    currentFeeds.forEach((feed) => {
      const li = document.createElement('li')
      li.classList.add('border-b', 'border-slate-100', 'pb-4', 'last:border-0', 'feed-item')

      const title = document.createElement('h3')
      title.classList.add('font-bold', 'text-slate-800', 'text-sm', 'mb-1', 'leading-snug')
      title.textContent = feed.title

      const descr = document.createElement('p')
      descr.classList.add('text-xs', 'text-slate-400', 'font-normal')
      descr.textContent = feed.description

      li.append(title, descr)
      feedsList.append(li)
    })

    postsList.innerHTML = ''
    currentPosts.forEach((post) => {
      const li = document.createElement('li')
      li.classList.add('flex', 'justify-between', 'items-center', 'py-3', 'border-b', 'border-slate-100', 'last:border-0', 'posts-item')

      
      const wrapper = document.createElement('div')
      wrapper.classList.add('pr-4', 'flex-1')

      const a = document.createElement('a')
      a.setAttribute('href', post.link)
      a.setAttribute('rel', 'noopener noreferrer')
      a.classList.add('block', 'break-all', 'line-clamp-2', 'hover:underline')
      a.setAttribute('data-seen', String(post.hasSeen))

      
      if (!post.hasSeen) {
        a.classList.add('font-bold', 'text-blue-600')
      } else {
        a.classList.add('font-normal', 'text-slate-600')
      }
      a.textContent = post.title
      wrapper.append(a)

      const button = document.createElement('button')
      button.setAttribute('type', 'button')
      button.classList.add('preview-btn', 'px-3', 'py-1.5', 'text-xs', 'font-medium', 'text-blue-600', 'border', 'border-blue-600', 'rounded', 'hover:bg-blue-50', 'transition-colors', 'shrink-0')
      button.textContent = i18n.t('previewButton') 
      button.dataset.postId = post.id

      li.append(wrapper, button)
      postsList.append(li)
    })

    const activePost = get(state).activeModalPost
    const modal = document.getElementById('modal')

    if (modal) {
      if (activePost) {
        document.getElementById('modal-title').textContent = activePost.title
        document.getElementById('modal-description').textContent = activePost.description
        document.getElementById('modal-link').href = activePost.link
        
        if (!modal.open) {
          modal.showModal()
        }
        document.body.style.overflow = 'hidden'
      } else {
        if (modal.open) {
          modal.close()
        }
        document.body.style.overflow = ''
      }
    }
  })
}