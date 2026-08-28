import * as yup from 'yup'

yup.setLocale({
  mixed: {
    required: 'validation.requiredField',
  },
  string: {
    url: 'validation.invalidUrl',         
  },
})


const schema = yup.object({
  url: yup
    .string()
    .required()
    .url()
    .test('no duplicates', 'validation.duplicate', function (value) {
      const { feeds } = this.options.context
      return !feeds.includes(value)
    })
})

export  function validateURL(value, state) {
  return schema
    .validate({ url: value }, { abortEarly: false, context: state})
    .then(() => {
      return { isValid: true, error: '' }
    })
    .catch((err) => {
      const errorMessage = err.inner && err.inner.length > 0 
        ? err.inner[0].message 
        : err.message
      return { isValid: false, error: errorMessage }
    })
}