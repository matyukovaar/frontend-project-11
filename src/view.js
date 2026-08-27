import { watch } from 'valtio/vanilla/utils'

export function initView (state, elemets) {
    const {/*form, resultDiv, input,*/ errorDiv} = elemets

    watch((get) => {
        const error = get(state).error
        if (error) {
            errorDiv.textContent = error
        } else {
            errorDiv.textContent = ''
        }
    })

}