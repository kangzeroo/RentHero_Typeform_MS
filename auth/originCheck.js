

exports.originCheck = function(req, res, next){
 const origin = req.get('origin')
 if (process.env.NODE_ENV === 'production') {
   if (origin.indexOf('renthero.com') > -1) {
     next()
   } else {
     res.status(500).send({
       message: 'Bad boi bad boi'
     })
     // next()
   }
 } else {
   next()
   // res.status(500).send({
   //   message: 'Incorrect request origin. Not https://localhost:8081'
   // })
 }
}
