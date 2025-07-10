// Quick test of sanitization functions
const { sanitizeFacebookUrl, sanitizeInstagramUrl, sanitizePhone, sanitizeEmail } = require('./src/lib/utils.ts');

console.log('Testing Facebook URLs:');
console.log('Input: "mypage" -> Output:', sanitizeFacebookUrl('mypage'));
console.log('Input: "https://www.facebook.com/mypage" -> Output:', sanitizeFacebookUrl('https://www.facebook.com/mypage'));
console.log('Input: "my.page_123" -> Output:', sanitizeFacebookUrl('my.page_123'));
console.log('Input: "invalid@page" -> Output:', sanitizeFacebookUrl('invalid@page'));

console.log('\nTesting Instagram URLs:');
console.log('Input: "myuser" -> Output:', sanitizeInstagramUrl('myuser'));
console.log('Input: "@myuser" -> Output:', sanitizeInstagramUrl('@myuser'));
console.log('Input: "https://www.instagram.com/myuser" -> Output:', sanitizeInstagramUrl('https://www.instagram.com/myuser'));
console.log('Input: "my.user_123" -> Output:', sanitizeInstagramUrl('my.user_123'));
console.log('Input: "invalid-user" -> Output:', sanitizeInstagramUrl('invalid-user'));

console.log('\nTesting Phone Numbers:');
console.log('Input: "03 21 16 29 25" -> Output:', sanitizePhone('03 21 16 29 25'));
console.log('Input: "+33 3 21 16 29 25" -> Output:', sanitizePhone('+33 3 21 16 29 25'));
console.log('Input: "abc123def" -> Output:', sanitizePhone('abc123def'));

console.log('\nTesting Email:');
console.log('Input: "  TEST@EXAMPLE.COM  " -> Output:', sanitizeEmail('  TEST@EXAMPLE.COM  '));
console.log('Input: "invalid-email" -> Output:', sanitizeEmail('invalid-email'));
