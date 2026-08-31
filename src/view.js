import { watch } from 'valtio/vanilla/utils'

export function initView(state, elements, i18n) {
    const { container, form, resultDiv, input, errorDiv } = elements

    const label = form.querySelector('label')
    label.textContent = i18n.t('labelText')

    const h1 = container.querySelector('h1')
    h1.textContent = i18n.t('appName')
    
    const submitBtn = form.querySelector('.btn-add')
    submitBtn.textContent = i18n.t('submitButtonText')
    
    const feedsContainer = document.createElement('div')
    feedsContainer.classList.add('feeds-section')
    const feedsName = document.createElement('h2')
    feedsName.textContent = i18n.t('feedsName')
    const feedsList = document.createElement('ul')
    feedsList.classList.add('feeds')
    feedsContainer.append(feedsName, feedsList)

    const postsContainer = document.createElement('div')
    postsContainer.classList.add('posts-section')
    const postsName = document.createElement('h2')
    postsName.textContent = i18n.t('postsName')
    const postsList = document.createElement('ul')
    postsList.classList.add('posts')
    postsContainer.append(postsName, postsList)

    resultDiv.innerHTML = ''
    resultDiv.append(feedsContainer, postsContainer)

    watch((get) => {
        const errorKey = get(state).error
        const currentFeeds = get(state).feeds
        const currentPosts = get(state).posts

        if (errorKey) {
            errorDiv.textContent = i18n.t(errorKey)
            //input.classList.add('is-invalid');
        } else {
            errorDiv.textContent = ''
            //input.classList.remove('is-invalid');
        }

        feedsList.innerHTML = ''
        currentFeeds.forEach((feed) => {
            const li = document.createElement('li')

            const title = document.createElement('h3')
            title.textContent = feed.title

            const descr = document.createElement('p')
            descr.textContent = feed.description

            li.append(title, descr)
            feedsList.append(li)
        })

        postsList.innerHTML = ''
        currentPosts.forEach((post) => {
            const li = document.createElement('li')
            li.classList.add('list-group-item')

            const a = document.createElement('a')
            a.setAttribute('href', post.link)
            a.textContent = post.title
            li.append(a)
            postsList.append(li)
        })
    })
}
