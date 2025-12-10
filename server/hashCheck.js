import bcrypt from 'bcryptjs';

const plainTextPassword = 'admin123';
const hashedPassword = '$2a$10$A2b6jZEoiRYzG5XLwEEEaeVht20n3Yn7tZorBjmNZls6EQ4QAATj6' // Replace with the hash from your database

bcrypt.compare(plainTextPassword, hashedPassword, async(err, isMatch) => {
  if (err) {
    console.error('Error comparing passwords:', err);

  } else {
    console.log('Password match:', isMatch);
  }
  const hashedPassword1 = await bcrypt.hash('admin123', 10);
  console.log(hashedPassword1);
  
});