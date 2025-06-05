import mongoose from "mongoose";

const HospitalSchema = new mongoose.Schema({
  name: String,
  logo: String,
  address: String,
  contactNumber: String,
  email: String,
  website: String,
  doctorName: String,
  doctorInfo: String,
  subscriptionTimeline: {
    type: [{
      event: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        required: true
      },
      description: {
        type: String
      },
      type: {
        type: String
      }
    }],
    default: function() {
      const now = new Date();
      return [
        {
          event: "Installation & Trail Start",
          date: now,
          type: "install",
          description: "System Installation & Trial Period Started"
        },
        {
          event: "Trial End",
          date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          type: "trial",
          description: "Trial Period Ends"
        }
      ];
    }
  },
  renewalDate : {
    type: Date,
    default: () => Date.now() + 30 * 24 * 60 * 60 * 1000,
  },
 
  serviceDiscontinuedDate : {
    type: Date,
    default: () => Date.now() + 35 * 24 * 60 * 60 * 1000,
  },

  paymentData : [{
   date : Date,
   amount : Number,
   method : String,
   remark : String,
  }],

  planType: {
    type: String,
    default: "Trial"
  },

  hospitalId: {
    type: String,
    required: true,
  },
  logo2:String,
  pharmacyName: String,
  morelogos:[String],
  pharmacyAddress: String,
  pharmacyContactNumber: String,
  pharmacyLogo: String,
  pharmacyExpiryThreshold: {
    type: Number,
    min: 0,
    default: 3 
  },
  pharmacyItemCategories: {
    type: [String],
    default: []
  }
  // Removed hospitalServiceCategories
});

export const Hospital = mongoose.model("Hospital", HospitalSchema);
