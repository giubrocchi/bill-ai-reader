CREATE TABLE IF NOT EXISTS readings.reading (
  id VARCHAR(36) PRIMARY KEY,
  customerId VARCHAR(255) NOT NULL,
  measureDatetime DATETIME NOT NULL,
  measureType VARCHAR(50) NOT NULL,
  imageUrl TEXT NOT NULL,
  measureValue FLOAT NOT NULL,
  isConfirmed BOOLEAN NOT NULL
);