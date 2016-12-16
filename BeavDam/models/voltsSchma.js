var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  volt: {type: Number, default: 0},
  voltList: [{type: mongoose.Schema.Types.ObjectId, ref:'voltHistory'}]
});

mongoose.model('Post', PostSchema);
