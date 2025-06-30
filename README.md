# Public Twitter Feed Viewer
This project is done under GDSC @IIT Roorkee. The problem statement was to create a browser extension that lets you see someone else's Twitter (X) home feed. If they share access, you can use the extension to see exactly what their X feed looks like — what tweets they see, what they scroll through. The team members are - 
- Sidheshwar Sarangal
- Gamit Krupal
- Ayan
---
## Description
The project is a chrome extension which is used to access the token of a user and allows another user to just view his feed. This is done in order to just understand his interests and what all stuff he scrols through. The other user just has to open the extension and fill the email, username and password in the access page there inside the extension. Then our main user just need to search the other user's email or username and click on it in the search page of the extension. After this just go to the home page and on top right there will be a dropdown. Select the other user from that. The page feed will load and the other user's feed will be visible(images, videos, text, likes, number of comments,etc). If the session expires then the other user has to just log out of this web through the browser and then re enter the credentials into the extension for our main user to view his feed. 

The project consists of two parts -
- Twikit
- Extension

Note- I have provided the descriptions of each part and the working process together as following-

---

## Dependencies
You need to install the dependencies in the dofferent folders. For this do -
**In twikit, do this -**
```bash
     pip install -r requirements.txt
```
**In extension, do-**
```bash
    npm install
```

---

## Twikit
This is the backend part and it consists of components such as login, match-sessions and get-feed.
- The login component takes the user email, password and username. I the user exists, then he is logged in to twikit. This means he has given access to view his feed. The tokens and cookies are just pushed to the database with auth_info_1 and  auth_info_2 as username and email.
- The match sessions is used to search the database with username or password and get the cookies.
- The get feed component returns the timeline feed. It takes cookies and return the feed timeline which includes posts, images , videos, likes nad number of commments.

- **In the root, open the terminal and follow these steps:**

  1. **Move to the `twikit` folder:**

     ```bash
     cd twikit
     ```

  2. **Run the command:**

     ```bash
     uvicorn main:app --reload
     ```

**The backend wll run.**

---

## Extension
The is the frontend which consists of the allow access page, the search page and the dropdown which is visible in the x home page only.
- The first page which opens on clickig the extension button consists og two options - access and search
  1. Access - This allows you to access the access page where you have to provide the email, password and the username to allow others access to view your feed. It uses login component from the twikit.
  2. Search - This allows you to seach a user by entering the username or email. It uses the match-session from the twikit and saves the cookies in the extesion storage.
- The dropdown only appears in the 
