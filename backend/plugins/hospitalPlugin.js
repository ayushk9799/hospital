import mongoose from 'mongoose';

export const hospitalPlugin = (schema) => {
  // Add the hospital field to the schema if it doesn't exist
  if (!schema.path('hospital')) {
    console.log("adding hospital")
    schema.add({ hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' } });
  }

  // Helper function to set hospital condition
  const setHospitalCondition = function() {
    console.log("setting hospital")
    if (!this.getQuery().hospital && mongoose.connection.hospital) {
      this.where({ hospital: mongoose.connection.hospital });
    }
  };

  // Apply setHospitalCondition to all query middlewares
  ['find', 'findOne', 'update', 'findOneAndUpdate'].forEach(method => {
    schema.pre(method, setHospitalCondition);
  });

  // Middleware for 'save'
  schema.pre('save', function(next) {
    console.log("saving")
    if (!this.hospital && mongoose.connection.hospital) {
      this.hospital = mongoose.connection.hospital;
    }
    next();
  });

  // Middleware for 'insertMany'
  schema.pre('insertMany', function(next, docs) {
    if (Array.isArray(docs)) {
      docs.forEach(doc => {
        if (!doc.hospital && mongoose.connection.hospital) {
          doc.hospital = mongoose.connection.hospital;
        }
      });
    }
    next();
  });
};