**Introduction**:

This is a blog administrative user interface. You could log in and log out. If you are an admin, you will get the registered user report from the database, and it will display in a JTable. You can also delete any user besides yourself.

**How to use:**

```
Admin User:
Username: John
Password: 12345

Non-admin User:
Username: Lei
Password: 12345
```

First you need npm install.
Then you need npm start.
You don't need to run the SQL. The database has been initialized. 
If you use an admin user account to log in, You will receive the full user report from the database, and it will show on the table. If you use a non-admin user account to log in, you can log in. But you will be logged out once the server finds out you are not an admin user.
Once the user report shows on the table, you can click on the user you want to delete. Then you could click the delete user button to delete the selected user from the database. The "Delete user" function is design to wipe all user information in the database. 



