const moment = require('moment')

exports.extractAnswerFromTypeformFieldType = function(ans) {
  let answer = ''
  switch(ans.field.type) {
      case 'date':
        answer = moment(ans.date).format('dddd MMMM Do GGGG')
        break
      case 'dropdown':
        answer = ans.choice.label
        break
      case 'email':
        answer = ans.email
        break
      case 'file_upload':
        answer = ans.file_url
        break
      case 'group':
        answer = 'Error TYPEF-Grp'
        break
      case 'legal':
        answer = ans.choice.boolean ? 'Agreed' : 'Did Not Agree'
        break
      case 'long_text':
        answer = ans.text
        break
      case 'multiple_choice':
        if (ans.choices) {
          answer = `${ans.choices.labels.join(', ')}${ ans.choices.other ? `, ${ans.choices.other}` : '' }`
        } else if (ans.choice && ans.choice.label) {
          answer = ans.choice.label
        } else if (ans.choice && ans.choice.other) {
          answer = ans.choice.other
        }
        break
      case 'number':
        answer = ans.number
        break
      case 'opinion_scale':
        answer = `Rated as a ${ans.number}`
        break
      case 'payment':
        answer = 'Error TYPEF-Pyt'
        break
      case 'picture_choice':
        if (ans.choices) {
          answer = `${ans.choices.labels.join(', ')}${ ans.choices.other ? `, ${ans.choices.other}` : '' }`
        } else if (ans.choice && ans.choice.label) {
          answer = ans.choice.label
        } else if (ans.choice && ans.choice.other) {
          answer = ans.choice.other
        }
        break
      case 'rating':
        answer = `Rated as a ${ans.number}`
        break
      case 'short_text':
        answer = ans.text
        break
      case 'statement':
        answer = `Error TYPEF-Stm`
        break
      case 'website':
        answer = ans.url
        break
      case 'yes_no':
        answer = ans.boolean ? 'Yes' : 'No'
        break
  }
  return answer
}
