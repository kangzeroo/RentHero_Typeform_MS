const axios = require('axios')
const uuid = require('uuid')
const moment = require('moment')
const insertItem = require('./general_insertions').insertItem
const query_dynamodb = require('./general_queryable').query_dynamodb
const RENTHERO_QALTA_SETS = require('./schema/dynamodb_tablenames').RENTHERO_QALTA_SETS
const URL_basic_typeform_elastic_map = require('../api/mapping_locations').getMaps().URL_basic_typeform_elastic_map
const URL_advanced_typeform_elastic_map = require('../api/mapping_locations').getMaps().URL_advanced_typeform_elastic_map
const URL_seeking_typeform_elastic_map = require('../api/mapping_locations').getMaps().URL_seeking_typeform_elastic_map

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
    saveQuestionToDYN(group.question_phrasing, group.tags, ad_id, landlord_id, group.question_id),
    saveAnswerToDYN(group.question_phrasing, group.answer_phrasing, group.tags, ad_id, landlord_id, group.question_id)
  ]
  return Promise.all(x)
}

const saveQuestionToDYN = (question_phrasing, tags, ad_id, landlord_id, question_id) => {
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
      'LANDLORD_ID': landlord_id,
      'QUESTION_ID': question_id
    }
  }
  console.log(item)
  return insertItem(item)
}

const saveAnswerToDYN = (question_phrasing, answer_phrasing, tags, ad_id, landlord_id, question_id) => {
  console.log('------------- saving answer... ---------------')
  const item = {
    'TableName': RENTHERO_QALTA_SETS,
    'Item': {
      'AD_ID': ad_id,
      'ITEM_ID': uuid.v4(),
      'TYPE': 'ANSWER',
      'TAGS': tags,
      'QUESTION': question_phrasing,
      'PHRASING': answer_phrasing,
      'DATETIME': moment().toISOString(),
      'LANDLORD_ID': landlord_id,
      'QUESTION_ID': question_id
    }
  }
  console.log(item)
  return insertItem(item)
}

exports.checkDynamoForAds = function(ad_id) {
  const p = new Promise((res, rej) => {
    const params = {
      "TableName": RENTHERO_QALTA_SETS,
      "KeyConditionExpression": "#AD_ID = :ad_id",
      "ExpressionAttributeNames": {
        "#AD_ID": "AD_ID",
      },
      "ExpressionAttributeValues": {
        ":ad_id": ad_id,
      }
    }
    query_dynamodb(params)
      .then((QASets) => {
        // console.log(QASets)
        // console.log('---- nice')
        return sortQASets(QASets)
      })
      .then((summary) => {
        res(summary)
      })
      .catch((err) => {
        console.log('-------- ERROR')
        console.log(err)
        rej(err)
      })
  })
  return p
}

function sortQASets(QASets){
  const p = new Promise((res, rej) => {
    const uniques = []
    QASets.forEach((item) => {
      let newTag = false
      uniques.forEach((u) => {
        if (u === item.TAGS) {
          newTag = true
        }
      })
      if (!newTag) {
        uniques.push(item.TAGS)
      }
    })
    const headers = {
      headers: {

      }
    }
    // console.log('----------------')
    // console.log(URL_basic_typeform_elastic_map)
    // console.log('----------------')
    // console.log(URL_advanced_typeform_elastic_map)
    // console.log('----------------')
    // console.log(URL_seeking_typeform_elastic_map)
    const x = [
      axios.get(URL_basic_typeform_elastic_map, headers),
      axios.get(URL_advanced_typeform_elastic_map, headers),
      axios.get(URL_seeking_typeform_elastic_map, headers),
    ]
    Promise.all(x)
        .then((data) => {
          const forms = data.map((d) => {
            console.log(d.data)
            return d.data
          }).map((f) => {
            return {
              form_id: f.form_id,
              tags: f.questions.map((q) => {
                return q.tag_ids.join(',')
              }).join(',')
            }
          })
          let mappings = {
            basic: [],
            advanced: [],
            seeking: [],
            other: [],
          }
          const all_questions = uniques.map((u) => {
            return QASets.filter((item) => {
              return item.TAGS === u
            })
          }).map((historicalSet) => {
            let summ = {
              question: null,
              answer: null
            }
            summ.question = historicalSet.filter((item) => {
              return item.TYPE === 'ORIGINAL_QUESTION'
            }).sort((a, b) => {
              // console.log(a)
              // console.log(b)
              if (a && b) {
                return moment(b.DATETIME).unix() - moment(a.DATETIME).unix()
              } else {
                return 1
              }
            })[0]
            summ.answer = historicalSet.filter((item) => {
              return item.TYPE === 'ANSWER'
            }).sort((a, b) => {
              if (a && b) {
                return moment(b.DATETIME).unix() - moment(a.DATETIME).unix()
              } else {
                return 1
              }
            })[0]
            return summ
          }).forEach((summ) => {
            let form_id = ''
            // console.log(summ)
            forms.forEach((form) => {
              if (form.tags.indexOf(summ.question.TAGS) > -1) {
                form_id = form.form_id
              }
            })
            if (form_id === 'xvmqm2') {
              mappings.basic.push(summ)
            } else if (form_id === 'f2E1MJ') {
              mappings.advanced.push(summ)
            } else if (form_id === 'ksLFy7') {
              mappings.seeking.push(summ)
            } else {
              mappings.other.push(summ)
            }
          })
          res(mappings)
        })
        .catch((err) => {
          rej(err)
        })
  })
  return p
}

exports.updateAnswer = function(ansObj) {
  console.log(ansObj)
  ansObj.DATETIME = moment().toISOString()
  ansObj.ITEM_ID = uuid.v4()
  const Item = {
    "TableName": RENTHERO_QALTA_SETS,
    "Item": ansObj,
  }
  return insertItem(Item)
}
