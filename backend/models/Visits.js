import mongoose from "mongoose";
import {hospitalPlugin} from '../plugins/hospitalPlugin.js'
const CounterSchema = new mongoose.Schema({
    date: { type: String },
    seq: { type: Number, default: 0 }
  });
  const Counter = mongoose.model('Counter', CounterSchema);

function formatDate(date) {
    console.log(typeof(date))
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    console.log(`${day}-${month}-${year}`)
    return `${day}-${month}-${year}`;
  }
const visitSchema = new mongoose.Schema({

    bookingDate: { type: String, default: function() {return formatDate(new Date())} },
  bookingNumber: { type: Number },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Staff",  },
  department: { type: String,  },
  reasonForVisit: { type: String,  },
  diagnosis: { type: String, },
  treatment: { type: String,  },
});
visitSchema.pre('save', async function(next) {
    if (!this.bookingNumber) {
      const counter = await Counter.findOneAndUpdate(
        { date: formatDate(new Date()) },
        { $inc: { seq: 1 } },
        { new: true, upsert: true,setDefaultsOnInsert: true }
      );
      this.bookingNumber = counter.seq;
    }
    next();
  });
visitSchema.plugin(hospitalPlugin)
export const Visit = mongoose.model("visit", visitSchema);