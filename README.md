# blog_comments_example

This application is a sample of what could be used on a blog or any article-based site that would like to implement comments functionality.

Base stack used:
- React (only for one component; rest is vanilla js)
- Express
- Node
- MySQL

Some others are added for various add-on functionality (moment, jest, supertest...).


## Running the application

1. Clone the repo and ```npm i```. Make sure you run this from the blog_comments_example directory.
2. You will need to set up a MySQL server or connection. You can adjust settings in config/db.config.js. 

Note that MySQL 8.0+ changed authentication methods and you will be unable to connect with just a password. If running locally, you can install using the old authentication method. Otherwise, you can try to run these tags:

If you log in as root, the 'simplest' way is to create a new user (I wasn't able to get an alter command to work on the root user):

```CREATE USER 'user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';```

```ALTER USER 'user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';```

You may need to grant this user privileges:

```GRANT ALL PRIVILEGES ON database_name.* TO 'user'@'localhost';```

3. Run ```npm run dev```.
4. You can open a second terminal and run ```npm run test``` to have the automated tests running alongside your development.


## MySQL Database

If you want to populate the database with data, you could use the below or edit it to your needs.

```
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `text` varchar(2000) NOT NULL,
  `userId` int NOT NULL,
  `instant` datetime NOT NULL,
  `replyToId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
);

CREATE TABLE `upvotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `commentId` int NOT NULL,
  `userId` int NOT NULL,
  `instant` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
)

INSERT INTO comments
  (`text`,`userId`,`instant`,`replyToId`)
VALUES
  ('comment1',1434,'2022-03-25 05:12:12',null),
  ('comment2',6346,'2022-04-12 18:55:53',1),
  ('comment3',7764,'2022-05-15 15:23:34',null),
  ('comment4',1853,'2022-05-19 17:54:51',null);

INSERT INTO upvotes
  (`commentId`,`userId`,`instant`)
VALUES
  (1,5335,'2022-05-19 17:54:51'),
  (2,4531,'2022-05-19 17:54:51'),
  (1,4411,'2022-05-19 17:54:51'),
  (2,4161,'2022-05-19 17:54:51'),
  (2,1234,'2022-05-19 17:54:51')
```


## Docker

Assuming you have Docker installed, you can simply run the following as needed:
```
docker build -t blog_comments_example .
docker run -it -p 8080:8080 blog_comments_example
```


## Notes

As with any project, there's a lot that could be done to improve it. Next steps for this one would be:

1. TDD for the MySQL database.

2. Migrate all front-end to React. Only one component was migrated to React to demonstrate using React within an existing project (v1 -> v2).
That said, it would be **much** easier to simply use React for the whole front-end. Right now state handling is a bit clumsy and the websocket 
subscriptions are duplicative. If you did this, you could also more easily add TDD for the front end.

3. Authentication.

4. Attach this to basic blog functionality (home page, articles).
