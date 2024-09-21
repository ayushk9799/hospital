const startDate = new Date('Sat Sep 21 2024 00:00:00 GMT+0530');
const endDate = new Date('2024-09-19T18:30:00.000Z');
console.log(startDate);
console.log(endDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

