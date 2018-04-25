const basic_elastic_dialog_map = require('./landlord_basic_form/basic_elastic_dialog_map').basic_elastic_dialog_map
const advanced_elastic_dialog_map = require('./landlord_advanced_form/advanced_elastic_dialog_map').advanced_elastic_dialog_map
const seeking_elastic_dialog_map = require('./landlord_seeking_form/seeking_elastic_dialog_map').seeking_elastic_dialog_map

const dialogFlow_relationships = [].concat(basic_elastic_dialog_map.relationships).concat(advanced_elastic_dialog_map.relationships).concat(seeking_elastic_dialog_map.relationships)


exports.fetchAppropriateTagsForIntent = function(intentID, intentName){
  const p = new Promise((res, rej) => {
    console.log('============================')
    console.log(intentID)
    console.log(intentName)
    const found = dialogFlow_relationships
      .filter((rel) => {
        // console.log(rel)
        return rel.dialogFlow_intentID === intentID && rel.dialogFlow_intentName === intentName
      })
    if (found && found.length > 0 && found[0] && found[0].typeForm_Tags && found[0].typeForm_Tags.length > 0) {
      res(found[0].typeForm_Tags)
    } else {
      // console.log(found)
      rej('No answer found for this intent!')
    }
  })
  return p
}
