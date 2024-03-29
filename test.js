const axios = require("axios")

axios.get("https://s3.amazonaws.com/renthero-ai-typeform-references/basic_typeform/basic_typeform_elastic_map.json")
  .then((data) => {
    console.log(data.data)
    console.log(data.data.form_id)
  })
  .catch((err) => {
    console.log(err)
  })


const JSON = {
  "form_id": "xvmqm2",
  "questions": [
    {
      "question_ids": ["RQ3CUzTwNMKa"],
      "tag_ids": ["DECORATE"],
      "sample_phrasing": "Can the tenant decorate the suite?"
    },
    {
      "question_ids": ["MYV6lY9JBPZV"],
      "tag_ids": ["NOISE_RESTRICTIONS"],
      "sample_phrasing": "Are there any noise restrictions?"
    },
    {
      "question_ids": ["SCOOxH5kVrI8"],
      "tag_ids": ["GUEST_POLICIES"],
      "sample_phrasing": "Are there any special guest policies?"
    },
    {
      "question_ids": ["ctKR0zhTPV45"],
      "tag_ids": ["LANDSCAPING"],
      "sample_phrasing": "Which party is responsible for landscaping such as snow shoveling or collecting leaves?"
    },
    {
      "question_ids": ["p7XLvO32yqes"],
      "tag_ids": ["GARBAGE"],
      "sample_phrasing": "Who's responsible for garbage?"
    },
    {
      "question_ids": ["UwUUCe87aI1X"],
      "tag_ids": ["INSPECTIONS"],
      "sample_phrasing": "How often are inspections done?"
    },
    {
      "question_ids": ["uC4kvQh7DS0K"],
      "tag_ids": ["WAITLIST"],
      "sample_phrasing": "Is there a waiting list for the suite?"
    },
    {
      "question_ids": ["zirm627vM4wp"],
      "tag_ids": ["CELL_RECEPTION"],
      "sample_phrasing": "Where in the suite has weak cell reception?"
    },
    {
      "question_ids": ["a7xfBvAvt5xA"],
      "tag_ids": ["AMENITIES_INCLUDED"],
      "sample_phrasing": "What amenities are included with this property?"
    },
    {
      "question_ids": ["Cf294wwhBR1N"],
      "tag_ids": ["PROPERTY_PRICE"],
      "sample_phrasing": "How much does each room cost?"
    }
  ]
}
