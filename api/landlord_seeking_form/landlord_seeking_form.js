const fs = require('fs')
const extractAnswerFromTypeformFieldType = require('../typeform_answer_formatter').extractAnswerFromTypeformFieldType
const seeking_typeform_elastic_map = require('./seeking_typeform_elastic_map').seeking_typeform_elastic_map

exports.process_seeking_form = function(typeform) {
  const p = new Promise((res, rej) => {
    if (verifyCorrectForm(typeform, seeking_typeform_elastic_map)) {
      /*
        1. Create a QnT (Questions and Tags) set grouped by ID. Use `seeking_typeform_elastic_map.js` as template of appropriate IDs
        2. Parse over Typeform questions and group by ID as defined in QnT
        3. Repeat for Typeform answers, grouped by ID as defined in QnT
        4. Take each group and add the QnT tags as a string CSV
        5. Format each group into its DynamoDB object format
        6. Save to DynamoDB
      */
      const QnT = extractQuestionsAndTags(seeking_typeform_elastic_map)
      // console.log(QnT)
      const grouped = groupWithTypeform(QnT, typeform)
      res(grouped)
    } else {
      rej(`The received Typeform ID#${typeform.form_response.form_id} did not match the template map with ID#${seeking_typeform_elastic_map.form_id}`)
    }
  })
  return p
}

const verifyCorrectForm = (typeform, seeking_typeform_elastic_map) => {
  return typeform.form_response.form_id === seeking_typeform_elastic_map.form_id
}

const extractQuestionsAndTags = (seeking_typeform_elastic_map) => {
  return seeking_typeform_elastic_map.questions.map((q) => {
    return {
      question_ids: q.question_ids.join(','),
      tag_ids: q.tag_ids.join(',')
    }
  })
}

const groupWithTypeform = (QnT, typeform) => {
  const grouped = QnT.map((set) => {
    let question_phrasing = ''
    let tags = set.tag_ids
    let answer_phrasing = ''
    const matchedQuestions = typeform.form_response.definition.fields.filter((field) => {
      // recall that set.question_ids is a string CSV of multiple question_ids
      // field.id is one question_id. We use a string CSV so that we can group a history of Typeform questions to inherit the tags of a QnT set
      return set.question_ids.indexOf(field.id) > -1
    })
    if (matchedQuestions && matchedQuestions[0]) {
      question_phrasing = matchedQuestions[0].title
    }
    const matchedAnswers = typeform.form_response.answers.filter((ans) => {
      return set.question_ids.indexOf(ans.field.id) > -1
    })
    if (matchedAnswers && matchedAnswers[0]) {
      answer_phrasing = extractAnswerFromTypeformFieldType(matchedAnswers[0])
    }
    return {
      question_phrasing: question_phrasing,
      tags: tags,
      answer_phrasing: answer_phrasing,
    }
  }).filter((objSets) => {
    return objSets.question_phrasing && objSets.tags && objSets.answer_phrasing
  })
  return grouped
}
