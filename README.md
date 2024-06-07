# ABOBA

[YOUTUBE](https://youtu.be/p3RFMEixUOE?si=4pOFe2BRLqZN6ErL) - Гайд

### Добавление админа
```
INSERT INTO persons (username, password, role) VALUES ('admin', 'adminpassword', 'admin');
``` 

```
{
  "name": "demo-ex",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "pg": "^8.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.3"
  }
}
```
