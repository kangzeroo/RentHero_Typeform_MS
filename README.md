# RentHero Typeforms Microservice
This microservice is for managing Typeforms for both tenants and landlords. It is specifically a server meant for receiving all Typeform webhooks. For future scalability this may later be converted to serverless code (either on Google Cloud Functions or AWS Lambda).

## You will need
1. cURL on terminal to configure Typeform trigger: https://onlinecurl.com/
2. Download Ngrok for testing local webhook: https://ngrok.com/
3. AWS DynamoDB for QaltA storage (Questions, ALTernatives, Answers)
4. FuseJS or Elasticsearch (See below methods)

## Setup Instructions
1. Run this localhost repo with `npm run dev`
2. Install and run Ngrok with `ngrok http 8001` to create a publically available webserver linked to your localhost repo
3. Copy the code from `setup_typeform_webhook.txt` and fill in the variables required in the template (ie. your ngrok https url)
4. Paste that code into online CURL and press enter. This `curl` command tells Typeform where to send completed form submissions (aka your webhook)
5. Test your Typeform by completing a submission. Your localhost repo should receive the submission (aka your webhook was successfully hit)

## When are changes needed?
- Whenever you change the Typeform questions, the QuestionID changes, which is required to know which questions to extract for each `[tags]`. You will need to update the question dictionary located in `api/dictionary/basic_question_map.js` and other dictionaries for their corresponding forms.
- If you change the question type on Typeform, the `QuestionID` will also change. Please update the dictionary so that new Typeform submissions will have their questions auto-classified using the `QuestionID`s saved in our dictionary.
- To see the `QuestionID`s, use the CURL command located at `view_typeform.txt` to see the most recent typeform version

## Mappings for Setup
The following are the type of mappings RentHero AI uses:
1. Typeform to DynamoDB (to Elasticsearch)
      - Map a Typeform question/answer with its Elasticsearch entry using `./api/landlord_basic_form/basic_question_map.js`
2. DialogFlow to Elasticsearch
      - Map a DialogFlow intent fulfillment with an Elasticsearch entry using `./api/landlord_basic_form/basic_elastic_dialog_map.js`










# DEPRECATED
# QaltA (Questions, ALTernatives, Answer)

## What is QaltA?
`Qalta` (Questions, ALTernatives, Answer) is a system of associating question and answer sets by grouping. It is a non-neural net based NLP solution to responding to humans. There are fundamentally three types of objects in `QaltA`: the Question, the Answer, and the Qalta Estimate.

#### Question:
- Can be any phrase from any real human (In the eyes of the `QaltA` system, all inputs from humans are questions regardless if intended to be)
- There can be infinite questions (the `alt` in `QaltA` stands for alternative questions, to reflect the infinite ways a human may ask the same question)
- All questions are categorized by their `[tags]`.
- All `[tags]`s are associated with an answer. Some questions link to only 1 answer, while others may link to multiple answers.
- The original Typeform questions asked to landlords (in order to provide answers) count as the first categorized entry into the questions database
- When a question is added to the database, it leaves the `[tags]` field blank for a human to later fill out (except the first Typeform question which is hardcoded a `[tags]`)

#### Answer:
- Unlike questions which can come from any user, answers can only be provided by the landlord
- Answers are hard defined responses, like content taken directly from a static FAQ
- Each answer has an original `[tags]` that is matched directly with the `[tags]` of the Typeform question that QA set came from
- Answers may change over time, but we never replace values in an answer. We simply insert a new answer with the same `ad_id` and `[tags]` with a different `unix_time`
- One answer can be the match of many questions if a human categorizes it as so
- Multiple answers can be combined together to respond to a question, if a human adds multiple categorizations to a question

### Estimate:
- When `QaltA` guesses the `[tags]` to an incoming question and links it to an `answer_id`, that event is logged to our database as an estimate
- When a human categorizes a question, they are physically changing the `[tags]` in that question's entry in our database, which was null upon insertion
- By seperating `QaltA` estimates from human verification, we can later use this data to feed a supervised learning model for classification
- Note that the `answer_id` part of an estimate is not reliable data for training as the `answer_id` is always associated to the latest answer from the database

## How QaltA Works
`QaltA` is a middle-ground between FAQ Chatbots and a neural net based NLP AI (natural language processing). It is intended to be useful as a dumb system, but can later integrate with categorial neural nets. QaltA works like this:

1. A question is received by `QaltA` and it uses either fuzzy search or Elasticsearch to associate new user questions to known past questions
2. Known past questions are categorized by a human into their `[tags]` which could be something like `NOISE_RESTRICTIONS`. Note that `[tags]`s are a hard coded list of known question types associated with this knowledge corpus (In RentHero's case, it would be rental questions)
3. When fuzzy search or Elasticsearch returns an string of past questions, it finds the mode `[tags]` (mode = most frequently appeared). If fuzzy search or Elasticsearch provides a score associated with each result, then it may be weighted against the `[tags]` with a value of `weight x 1.0`. Note that this may have a weighting bias associated with the score provided by your chosen library.
4. The answer returned will be the latest answer for that `ad_id` and `[tags]`. There may be multiple answers as they change over time
5. Thus `QaltA` is based upon sheer statistics. The more questions are categorized by a human, the more likely a new question is correctly categorized by `QaltA` for on-the-spot replies. It is useful as a passive NLP solution that still builds up towards training a neural net

## Limitations of QaltA
- Unfortunately `QaltA` is not a real neural net based AI and does not self adjust its own weightings. Self adjustment lies within the database entries, not nodes
- `QaltA` can only get 'smarter' by a human categorizing more questions.
- However, `QaltA` can be hooked up to a real neural net and draw upon the pre-categorized training data for supervised learning.
- But at the end of the day, a neural net will still only give the same static answers that `QaltA` provides, because it is fundamentally constrained to the exact phrasings provided by the landlord
- This may lead to questions being correctly answered, but interpreted by users as a weird response (eg. `Can I bring guests over?` ==> `Quiet hours are from 11pm to 8am as enforced by the condo association`)
- Even worse, this may also lead to really bad answers if the landlord provides bad answers (eg. `What am I allowed to do in terms of decorating the place?` ==> `No`)
- `QaltA` needs to scan through an entire database in order to do fuzzy search or Elasticsearch, because there is no index that can be used to tell us which past questions should be compared against. New questions come in uncategorized and phrasing is not contained to just one ad (however we do track `ad_id` with each question so that later we can put context to questions provided the ad data is still there)
- Simply put, `QaltA` is unable to mix and match answers, or combine them in a meaningful natural sounding way
- Thus, `QaltA` only gets better at guessing a question's category via statistics, but never gets better at answering in a smooth human way

## QaltA implemented on a NoSQL Database Schema (AWS DynamoDB)
Read the section 'How QaltA Works' to understand how the database is queried and used to make a categorization decision. Note that all items are indexed as the same database item with varying types, so we only have 1 table.

| Type         | Key        | Column        | Type    | Desc      
| ---          | ---        | ---           | ---     | ---
| Question     | Hash(1)    | `ad_id`       | string  | The ad from with this question was directed
|              | Range(1), Hash(1)   | `item_id`     | string  | Unique question id
|              |            | `type`        | string  | Type of `question`, `answer` or `estimate`
|              |            | `tags,`      | string   | The tags defined by a human, saved as tag_ids  in CSV
|              |            | `phrasing`    | string  | The human string input
|              | Range(2)           | `unix_time`   | int     |
|              |            | `timezone`    | string  |
|              |            |               |         |
| Answer       | Hash(1)    | `ad_id`       | string  | The ad from which this answer was directed      
|              | Range(1), Hash(1)   | `item_id`     | string  | Unique answer id       
|              |            | `type`        | string  | Type of `question`, `answer` or `estimate`
|              |            | `tags,`      | string   | The original tags from this Typeform QA set, saved as tag_ids  in CSV
|              |            | `phrasing`    | string  | The answer provided by the landlord       
|              | Range(2)           | `unix_time`   | int     |       
|              |            | `timezone`    | string  |       
|              |            |               |         |           
| Estimate     | Hash(1)    | `ad_id`       | string  | The ad from which this answer was directed    
|              | Range(1), Hash(1)   | `item_id`     | string  | Unique estimate id            
|              |            | `type`        | string  | Type of `question`, `answer` or `estimate`
|              |            | `tags,`      | string   | The tags as guessed by QaltA, saved as tag_ids in CSV
|              |            | `question_id` | string  | Question id associated with this estimate      
|              |            | `answer_id`   | string  | Answer id associated by this estimate
|              | Range(2)           | `unix_time`   | int     |       
|              |            | `timezone`    | string  |       
