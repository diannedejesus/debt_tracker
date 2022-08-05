# **Debt Log & Track**
*Built by Dianne De Jesus; No current reviewers*


## Description

Track who owes money to the program. It stores basic information about the person and their debt and allows for payment logging and debt calculations. For example, the paid-off amount and the number of payments left.


# Current and proposed solutions
<!-- user story: How does a user interact with that solution? How is data handled? -->

## How is it currently being handled?
The current solution is an Excel spreadsheet containing the information about every person with debt. When a debt needs to be registered, the case worker opens the file and duplicates the template sheet. The template sheet allows the case worker to enter the following information:
- name
- debt amount (the initial amount owed)
- case id
- minimum payment
- start date (when the payments started)

With the previous information, the spreadsheet calculates the other cells:
- current debt (the amount owed after deducting all payments)
- debt payoff date (based on the minimum payment and current debt)
- payments left (calculated with minimum payment and current debt)
- payments made (the number of payments made)
- late payments (calculates if a payment is late with the minimum payment, current debt, and current date)

On that same spreadsheet is a section for registering payments made. When evidence of payment is submitted, the case worker opens the file and clicks the sheet with the debt owner's name. They then enter the following information in the bottom part of their sheet:
- date
- amount paid
- comments

If a person solicits a summary of their account or the case worker needs to send an annual summarization to the person, then they open the file and navigate to the summary sheet. This sheet pulls data from the selected person's debt sheet, using a dropdown filled with information from another sheet. The sheet that provides the information lists all sheets in the file. 

It displays the information in a format that should be easy for anyone to understand.


## What problem is this software addressing? Who will be using it?
This software is to facilitate the management of debt cases. Currently the documentation for these cases is found in individual case files or on an Excel spreadsheet managed by a single person. Meaning that the process of assuring debt payments are up-to-date and viewing the status of these cases falls on a single person. Also, the only way to see which ones are in default is to go through each sheet. Because of this a cases can easily lack follow-up when the workload of that case worker is higher than the norm or have a leave of absence. 

This software is for authorized case workers who will: enter payments, new debts and follow up on active cases.


## Functional Description
<!-- Functional Descrition
 With this section, you’re trying to answer a simple question: What does the software do? Of course, to answer this question thoroughly, you’ll need to dig a little deeper. In your functional description, you should cover error handling, one-time startup procedures, user limitations, and other similar details.  -->

### Login
A login is necessary to keep the information confidential and assure that only authorized personnel has access. Due to this, it will not have a traditional registration page. Instead, there will be a page where an administrator can create new accounts.

The login should include a message for unregistered people, telling them that the admin must make them an account. Only the administrator will have access to the registration page. There they will be able to create accounts for authorized case workers. The created account will have a temporary password created for them. Then upon initial login, the user will be asked to change it. The page can also revoke access.

#### **Additional Details**
* In the current scope, there is no need to implement access levels for the case worker accounts. 
*Setting a time limit for passwords needs to be evaluated.

#### **Pages Outline**
- Login page
    - verify account existance, grant access or deny
    - change password with initial login
- change password page
    - verify user
    - send secure reset link
- registration page
    - admin restricted
    - create new accounts
        - creates temporary password
        - sends initial login link
    - can revoke account access

#### **Pages Breakdown**

Login: 
- It will use a local login since emails to be used are not compatible with any third-party authenticator
- The process for login is: 
	- to verify if the user exists, 
	- if so, then verify the password
	- If not, a message saying "only an admin can create an account" is displayed.


Password Reset:
- When a user request a password reset, verify the email then a link is sent to their email.
- The link leads to a page that has a form that lets them change their password.

Registration Page:
- It will verify if it is the admin account,
	- If it is not, block the page. 
	- If so, show the registration form and list of users.
- when a user is registered, a temporary password is created and sent to the user with a login link. This link has a form for them to log in. Logging in confirms the account and asks them to create a password. 
- On this list, the admin can revoke access.


### Register debt
On this page, a user will enter a new debt with all the accompanying information. As a safety measure, we will have a database for the debt information and another for the name and Id. The debtor's name will be the only identifiable information saved about the person who owes the debt.

The new debt page will accept the following information:
- name [string]
- debt amount [number]
- file id [string]
- minimum payment [number]
- start date [date]

#### **Pages Outline**
- Enter debt page
    - Form

#### **Pages Breakdown**

Register Debt:
- A page with a form for the user to add a new account/debtor. 
- The name and case id of the debtor belongs in a separate database and will be encrypted.
- The debt information will be stored in the database with an identifier to relate it to the name.
- identifier is the case number (encrypted) which will be unique to ensure that we don't register a person with two debt accounts.

### View debt status
On the page, a user can see people who have debts and the information for each one. It will have a menu to scroll thru each person's case. This page will use the information already in the database to calculate additional information for each case and display it. This information will be:
- current debt [number]
- debt payoff date [date]
- payments left [int]
- payments made [int]
- late payments [int]

It will also display all the information entered from the registration page and any payments made. Payment information will be the information entered on the registration payment page.

#### **Pages Outline**
- information display/dashboard
- menu

#### **Pages Breakdown**
- a basic page that displays the information
    - list of debtors
    - displays late payments
    - displays paid-off

### Register payment
This page is for entering payment information. This information will be:
- date [date]
- the amount paid [number]
- comments [string]

#### **Pages Outline**
- enter payment page
    - form

#### **Pages Breakdown**
- Contains a form that lets the user select a debtor and add the information for payment.


### Create summary
The page will function as a printout for clients, indicating the current status of an account. It will include all the pertinent information about the debt and payments in an easy-to-understand format.

The information contained on this page will be:

Basic Information
- current date
- name
- start date
- initial balance
- amount payed
- estimated end
- payments made
- payments left
- amount left

Payment History
- number
- date
- balance
- paid
- comments
- final

#### **Pages Outline**
- View summary
    - display account summary

#### **Pages Breakdown**
- lays out the information in an easy-to-understand format with just the information necessary for the debtor to know how much they owe, how long it will take to pay off and to verify payments.

### Additional Ideas
* Access log: Keep track of case workers' logins, edits, and views.
* Letters: This is a wish list item. A page that produces a letter for different situations when working with debt accounts.
* 


### Databases
* Names
    - First Name [string]
    - Initial [char]
    - Last Name [string]
    - Maternal Name [string]

* Debt Information
    - name [string]
    - debt amount [number]
    - file id [string]
    - minimun payment [number]
    - start date [date] 

* Payment History
    - date [date]
    - amount paid [number]
    - comments [string]

* Accounts
    - email [string]
    - password [string]
    - admin [boolean]
    - registered [boolean]
    - revoked [boolean]

## User/Client Interface
<!-- ### Login Page
![login page](https://github.com/diannedejesus/update_contacts/blob/main/login-signup.PNG?raw=true "Login Page")
*** -->


<!-- User Interfase
There’s a good chance your coding project is going to be an application, which means it will have a user interface. (If your project is a library or something similar, there won’t be an interface.) As clients, UX designers, and programmers discuss and plan the user interface, it’s easy for the lines to get crossed. If the client doesn’t adequately communicate their vision, your teams might build out the user interface only to have the design shot down.  

Here’s the good news: These mishaps are, for the most part, entirely avoidable. You just need to discuss a few questions with the client before you start developing. Do certain elements of the interface change (animations)? Which elements are buttons? How many unique screens can the user navigate to? And, of course, what does all of this actually look like?

And there’s more good news: Wireframe diagrams can help you answer all of these questions! As your client shares their vision for the user interface (perhaps sending rough sketches), your teams should build out wireframe diagrams.

Once these wireframes are approved by the client, include them in the user interface section of your software design document.
-->

## Goals and milestones
- [ ] database connection *
- [ ] configure passport local login *
- [ ] local session variable handler *
- [ ] email sender *
- [ ] encryption *

- [ ] Login Page
    - [ ] basic layout
        - [ ] admin only registration message
    - [ ] data verification
        - [ ] assure that format is correct
        - [ ] user is present in database
        - [ ] password matches
    - [ ] verify if account/email exists and is registered
        - [ ] message if account does not exist or is not registered
        - [ ] match password if exists
        - [ ] create session if password matches with account
- [ ] Reset Password
    - [ ] verify email validity
          - [ ] basic page
    - [ ] send email with link
    - [ ] basic reset password form page
    - [ ] change password
- [ ] Registration Page
    - [ ] basic page layout
    - [ ] add temporary user
        - [ ] temporary password
        - [ ] basic initial login/user registration page
            - [ ] reset initial password
    - [ ] user list page
    - [ ] revoke user access


- [ ] Register Debt Page
    - [ ] basic form page
    - [ ] verify data
        - [ ] identifier is not already present in database
            - [ ] if so then debt case is already present and should be added to that case
        - [ ] data is in correct format and sanitized
    - [ ] save data to database
        - [ ] Name and case id is encrypted and saved to seperate database
        - [ ] debt information save to seperate database with account identifier


- [ ] Debtor Page
    - [ ] basic page that shows debtors
        - [ ] show debt payoff info and late payments
    - [ ] page for debtors info, debt and payments
    - [ ] edit payment
    - [ ] edit info
    - [ ] verify
    - [ ] submit

- [ ] Register payment page
    - [ ] basic layout
    - [ ] verify data
        - [ ] correct formats
        - [ ] duplicate payments
    - [ ] save to database
    
- [ ] Account summary
    - [ ] basic page layout
    - [ ] pull info from database

<!-- ### Secondary Goals


### Wishlist Feature


### Future -->



### Completed
-



## Issues
<!-- Things that should be looked into but an alternative solution was/can be implemented  -->
- 


<!-- NOTES
Admin Account Creation
There is a seperate module function that verifies if an admin account exists, it it doesnt then it creates a variable in the session to indicate that we are creating an admin account. It then calls the module function that creates a new user. 
Originally the value was passed as an argument/paramenter but this may lead to an issue of someone passing the value and gaining an admin account erroneously. 

Account Creation & Login

Only one administration account should exist, if that account is created you should not be able to access the admin creation page. If bypassed the user creation function will not be able to create an admin account if one is found in the database.

Only an admin account can create user account. The user creation process will verify if the current user session is an administor before creating an account.

 -->

<!-- Break it down
 Instead of approaching your project as a single drawn-out process, you might find it helpful to break it down into more manageable pieces. (This is true for the project’s timeline and the code itself.) At the most macro level, you have an overarching goal: What problem is your software addressing? Who will be using it?

Below that, you have a set of milestones. Milestones are essentially checkpoints—they help stakeholders know when certain aspects of the project will be completed. These milestones are for both internal use and external use. Within your team, they help keep your engineering team on track. You can also use them to show the client measurable steps your teams are taking to finish the project.  -->

<!-- ## Prioritization
As you begin to break the project into smaller features and user stories, you’ll want to rank them according to priority. To do this, plot each feature on a prioritization matrix, a four-quadrant graph that helps you sort features according to urgency and impact. The horizontal axis runs from low to high urgency; the vertical axis runs from low to high impact.

Based on the quadrant each feature falls into, decide whether to include it in your minimum viable product (MVP). Features in the upper-right quadrant (high urgency, high impact) should be included in your MVP. With features in the bottom-right (high urgency, low impact) and upper-left (low urgency, high impact) quadrants, use your discretion to decide if they are a part of your MVP. Features in the bottom-left quadrant (low urgency, low impact) should not be included in your minimum viable product.
-->

<!-- ## Current and proposed solutions 
You’re building software to address a problem, but yours might not be the first attempt at a solution. There’s a good chance a current (or existing) solution is in place—you’ll want to describe this solution in your SDD. 

You don’t need to get into the tiny details, but should at least write up a user story: How does a user interact with that solution? How is data handled?

Next, you’ll want to include a section outlining your proposed solution. If there’s an existing solution in place, why is your proposed solution needed? Now’s your chance to justify the project. You’ll want to explain this in as much technical detail as possible—after reading this section, another engineer should be able to build your proposed solution, or something like it, without any prior knowledge of the project.
-->

<!-- ## Timeline
The milestones section of your SDD should provide a general timeframe for non-engineering stakeholders. This section is far more detailed and is mostly for the benefit of your engineering teams. In your timeline, include specific tasks and deadlines as well as the teams or individuals to which they’re assigned.  -->

<!-- Pro tips for creating your software design documents
Just because you create a software design document and include each of the aforementioned sections doesn’t mean it’ll be effective. It’s a start, sure, but to get the most from your SDDs, keep these tips in mind. -->

<!-- Keep your language simple
When it comes to software design documents, clarity is key. There’s no need for flowery language and long, winding sentences—keep your sentences short and precise. Where appropriate, include bullet points or numbered lists. -->

<!-- Include visuals
Think back to your user interface section. Using wireframes, you’re able to accurately communicate a design that would be nearly impossible to describe in writing. You might find class diagrams, timelines, and other charts similarly useful throughout your SDD.  -->

<!-- Get feedback early
Your first draft of an SDD doesn’t necessarily need to be your last—it should be one of many. As you create a software design document for your project, send it to the client and other stakeholders. They might catch sections that need to be fleshed out or parts that are unclear that you missed. Once you’ve gotten their feedback, revise, revise, revise! -->

<!-- Update your SDD
Once you’ve written your software design document and gotten approval from stakeholders, don’t lock it away in some dusty drawer (or whatever the digital equivalent is). As your project progresses, team members should be referencing the SDD constantly. If there’s a delay, update your timeline. By treating an SDD as a living document, it will become an invaluable single source of truth. -->
