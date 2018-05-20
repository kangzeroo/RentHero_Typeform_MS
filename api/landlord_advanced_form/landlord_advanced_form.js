const fs = require('fs')
const axios = require('axios')
const extractAnswerFromTypeformFieldType = require('../typeform_answer_formatter').extractAnswerFromTypeformFieldType
// const advanced_typeform_elastic_map = require('./js/advanced_typeform_elastic_map').advanced_typeform_elastic_map
const URL_advanced_typeform_elastic_map = require('../mapping_locations').getMaps().URL_advanced_typeform_elastic_map
const headers = {
  headers: {

  }
}

exports.process_advanced_form = function(typeform) {
  const p = new Promise((res, rej) => {
    axios.get(URL_advanced_typeform_elastic_map, headers)
      .then((advanced_typeform_elastic_map) => {
        if (verifyCorrectForm(typeform, advanced_typeform_elastic_map.data)) {
          /*
            1. Create a QnT (Questions and Tags) set grouped by ID. Use `advanced_typeform_elastic_map.js` as template of appropriate IDs
            2. Parse over Typeform questions and group by ID as defined in QnT
            3. Repeat for Typeform answers, grouped by ID as defined in QnT
            4. Take each group and add the QnT tags as a string CSV
            5. Format each group into its DynamoDB object format
            6. Save to DynamoDB
          */
          const QnT = extractQuestionsAndTags(advanced_typeform_elastic_map.data)
          // console.log(QnT)
          const grouped = groupWithTypeform(QnT, typeform)
          res({ grouped: grouped, logs: [] })
        } else {
          rej(`The received Typeform ID#${typeform.form_response.form_id} did not match the template map with ID#${advanced_typeform_elastic_map.data.form_id}`)
        }
      })
      .catch((err) => {
        console.log(err)
        rej(err)
      })
  })
  return p
}

const verifyCorrectForm = (typeform, advanced_typeform_elastic_map) => {
  return typeform.form_response.form_id === advanced_typeform_elastic_map.form_id
}

const extractQuestionsAndTags = (advanced_typeform_elastic_map) => {
  return advanced_typeform_elastic_map.questions.map((q) => {
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
    let question_id = ''
    const matchedQuestions = typeform.form_response.definition.fields.filter((field) => {
      // recall that set.question_ids is a string CSV of multiple question_ids
      // field.id is one question_id. We use a string CSV so that we can group a history of Typeform questions to inherit the tags of a QnT set
      return set.question_ids.indexOf(field.id) > -1
    })
    if (matchedQuestions && matchedQuestions[0]) {
      question_phrasing = matchedQuestions[0].title
      question_id = matchedQuestions[0].id
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
      question_id: question_id
    }
  }).filter((objSets) => {
    return objSets.question_phrasing && objSets.tags && objSets.answer_phrasing
  })
  return grouped
}
