import mongoose from "mongoose";
import {hospitalPlugin} from '../plugins/hospitalPlugin.js'
const CounterSchema = new mongoose.Schema({
  date: { type: String },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('IPDCounter', CounterSchema);

function formatDate(date,number) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year = date.getFullYear();
  if(number===1){
    return `${day}-${month}-${year}`;
  }
  else{
    return `${day}/${month}/${year%100}`;
  }
}

const ipdAdmissionSchema = new mongoose.Schema({
  bookingDate: { type: String, default: function() { return formatDate(new Date(),1) } },
  bookingNumber: { type: Number },
  ipdNumber: { type: Number },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  dateDischarged: { type: Date },
  reasonForAdmission: { type: String },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
});

ipdAdmissionSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const counter = await Counter.findOneAndUpdate(
      { date: formatDate(new Date()) },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    this.bookingNumber = counter.seq;
  }
  if (!this.ipdNumber) {
     //to be decided
  }
  next();
});
ipdAdmissionSchema.plugin(hospitalPlugin)
export const IPDAdmission = mongoose.model("ipdAdmission", ipdAdmissionSchema);