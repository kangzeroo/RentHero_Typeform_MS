const uuid = require('uuid')
const moment = require('moment')
const insertItem = require('./general_insertions').insertItem
const RENTHERO_QALTA_SETS = require('./schema/dynamodb_tablenames').RENTHERO_QALTA_SETS

exports.saveGroupedTypeFormDataToDynamoDB = function(grouped, ad_id, landlord_id){
  const p = new Promise((res, rej) => {
    console.log('------------- saveGroupedTypeFormDataToDynamoDB ---------------')
    const x = grouped.map((group) => {
      return saveQuestionAndAnswer(group, ad_id, landlord_id)
    })
    Promise.all(x)
      .then((results) => {
        console.log('------------- saved all questions and answers ---------------')
        console.log(results)
        res(results)
      })
      .catch((err) => {
        console.log(err)
        rej(err)
      })
  })
  return p
}

const saveQuestionAndAnswer = (group, ad_id, landlord_id) => {
  const x = [
    saveQuestionToDYN(group.question_phrasing, group.tags, ad_id, landlord_id),
    saveAnswerToDYN(group.answer_phrasing, group.tags, ad_id, landlord_id)
  ]
  return Promise.all(x)
}

const saveQuestionToDYN = (question_phrasing, tags, ad_id, landlord_id) => {
  console.log('------------- saving question... ---------------')
  const item = {
    'TableName': RENTHERO_QALTA_SETS,
    'Item': {
      'AD_ID': ad_id,
      'ITEM_ID': uuid.v4(),
      'TYPE': 'ORIGINAL_QUESTION',
      'TAGS': tags,
      'PHRASING': question_phrasing,
      'DATETIME': moment().toISOString(),
      'LANDLORD_ID': landlord_id
    }
  }
  console.log(item)
  return insertItem(item)
}

const saveAnswerToDYN = (answer_phrasing, tags, ad_id, landlord_id) => {
  console.log('------------- saving answer... ---------------')
  const item = {
    'TableName': RENTHERO_QALTA_SETS,
    'Item': {
      'AD_ID': ad_id,
      'ITEM_ID': uuid.v4(),
      'TYPE': 'ANSWER',
      'TAGS': tags,
      'PHRASING': answer_phrasing,
      'DATETIME': moment().toISOString(),
      'LANDLORD_ID': landlord_id
    }
  }
  console.log(item)
  return insertItem(item)
}
