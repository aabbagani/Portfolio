import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('--------------------------------------------------');
    console.log(`Password: ${password}`);
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log('--------------------------------------------------');
    console.log('Copy the ADMIN_PASSWORD_HASH value to your GCP environment variables.');
});
