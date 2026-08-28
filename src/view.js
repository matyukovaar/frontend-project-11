import { watch } from 'valtio/vanilla/utils'

export function initView (state, elemets, i18n) {
    const {container, form, /*resultDiv, input,*/ errorDiv} = elemets

    const label = form.querySelector('label')
    label.textContent = i18n.t('labelText')

    const h1 = container.querySelector('h1')
    h1.textContent = i18n.t('appName')
    
    const submitBtn = form.querySelector('.btn-add')
    submitBtn.textContent = i18n.t('submitButtonText')

    watch((get) => {
        const errorKey = get(state).error

        if (errorKey) {
            errorDiv.textContent = i18n.t(errorKey)
        } else {
            errorDiv.textContent = ''
        }
    })

}