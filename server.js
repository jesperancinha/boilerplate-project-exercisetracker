const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI)

let Schema = mongoose.Schema;

let UserSchema = new Schema({
  name: String
});

let Username = mongoose.model('Username', UserSchema);

let ExerciseSchema = new Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Date
});

let Exercise = mongoose.model('Exercise', ExerciseSchema);

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/exercise/new-user", (req, res) => {
  let username = req.body.username;
  console.log(username);
  Username.findOne({name: username}).exec((error, userFound) =>{
        console.log(userFound);
        if(!userFound){
          let user = new Username({name: username});
          console.log(userFound);
          user.save((err, data)=>{
            console.log(data);
            if(err)
              res.json(err);
            else
              res.json(data);
          });
        } else {
          console.log(userFound);
          res.send("username already taken");
        }
  });
});



app.post("/api/exercise/add", (req, res) => {
  let userId = req.body.userId;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;

  let exercise = new Exercise({userId: userId, description: description, duration: duration, date:date});
  exercise.save((err, data)=>{
    console.log(data);
    if(err)
      res.json(err);
    else
      res.json(data);
  });
});

//{userId}[&from][&to][&limit]
app.get("/api/exercise/log", (req, res)=>{
  let userId = req.query.userId;
  let from = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;
  if(!userId){
    res.send("unknown userId");
  } else {
    let query = Exercise.find({userId: userId});
    if(from){
      query = query.find({date: { $gte: from}});
    }
    if(to){
      query = query.find({date: { $lte: to}});
    }
    if(limit){
      query = query.limit(parseInt(limit));
    }
    query.exec((error, data)=>{
      if(error){
        res.json(error);
      }
        else {
          res.json(data);
        }
    });
  }
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
