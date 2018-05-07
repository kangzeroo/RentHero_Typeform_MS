
exports.getMaps = function() {
  const bucket_path = 'https://s3.amazonaws.com/renthero-ai-mappings/'
  return {
    URL_basic_typeform_elastic_map: (bucket_path + 'typeforms/' + process.env.NODE_ENV + '/basic_typeform/basic_typeform_elastic_map.json'),
    URL_basic_elastic_dialog_map: (bucket_path + 'dialogflow/' + process.env.NODE_ENV + '/basic_typeform/basic_elastic_dialog_map.json'),
    URL_advanced_typeform_elastic_map: (bucket_path + 'typeforms/' + process.env.NODE_ENV + '/advanced_typeform/advanced_typeform_elastic_map.json'),
    URL_advanced_elastic_dialog_map: (bucket_path + 'dialogflow/' + process.env.NODE_ENV + '/advanced_typeform/advanced_elastic_dialog_map.json'),
    URL_seeking_typeform_elastic_map: (bucket_path + 'typeforms/' + process.env.NODE_ENV + '/seeking_typeform/seeking_typeform_elastic_map.json'),
    URL_seeking_elastic_dialog_map: (bucket_path + 'dialogflow/' + process.env.NODE_ENV + '/seeking_typeform/seeking_elastic_dialog_map.json')
  }
}
