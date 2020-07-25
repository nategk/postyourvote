module.exports = {
  async up(db, client) {
    var allPromises = [];
    var bulkOp = db.collection('postalcodes').initializeUnorderedBulkOp();
    var counter = 0;
    var batchSize = 100;
    await db.collection('postalcodes').find().batchSize(batchSize).forEach(doc => {
      // Don't wait for the update operation to complete before continuing
      bulkOp.find({_id: doc._id}).updateOne(
        {$set: {center: { type: "Point", coordinates: [ doc.longitude, doc.latitude ]}}}
      );
      counter++;
      if (counter % batchSize == 0) {
        console.log(`Updated ${counter} documents`);
        let thisPromise = bulkOp.execute();
        allPromises.push(thisPromise);
        bulkOp = db.collection('postalcodes').initializeUnorderedBulkOp();
      }
    });
    if (bulkOp.length > 0) {
      // Execute remaining ops
      let thisPromise = bulkOp.execute();
      allPromises.push(thisPromise);
    }

    console.log("Finished sending updates, waiting for completion...");
    // Wait for all the update operations to finish.
    await Promise.all(allPromises);

    console.log("Creating index...");
    await db.collection('postalcodes').createIndex({center: "2dsphere"});
  },

  async down(db, client) {
    console.log("Dropping index");
    await db.collection('postalcodes').dropIndex({center: "2dsphere"});
    console.log("Removing center point");
    await db.collection("postalcodes").updateMany({ center: {$exists: true} }, { $unset: { center: ""} });
  }
};
