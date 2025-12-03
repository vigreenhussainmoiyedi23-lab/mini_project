const mongoose = require('mongoose');
const userModel = require('../model/user');

mongoose.connect('mongodb://localhost:27017/mini_project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migration() {
  try {
    const result = await userModel.updateMany(
      { profilePicture: { $exists: false } },
      { $set: { profilePicture: "https://www.uiu.ac.bd/wp-content/uploads/2023/11/dummy_person.jpg" } }
    );
    console.log(`✅ Migration complete: ${result.modifiedCount} documents updated.`);
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
}

migration();
