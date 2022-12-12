# **Debt Log & Track**
*Built by Dianne De Jesus; No current reviewers*


## Description
Track who owes money to the agency. It stores basic information about the person and their debt. It has payment logging and it calculates data related to the debt. For example, the paid-off amount and the number of payments left.

<!-- user story: How does a user interact with that solution? How is data handled? -->

## How is it currently being handled?
The current solution is an Excel spreadsheet containing the information on every person with a debt. When a new debt needs to be registered, the case worker opens the file and duplicates the template sheet. The template sheet allows the case worker to enter the following information:
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

If a person solicits a summary of their account or the case worker needs to send an annual summarization to the person, then they open the file and navigate to the summary sheet. This sheet pulls data from the selected person's debt sheet, using a dropdown. The dropdown references the persons sheet and fills in the information into the current sheet. The sheet that provides the information to the dropdown lists all sheets in the file. 

The summary displays the information in a format that should be easy for anyone to understand.


## What problem is this software addressing? Who will be using it?
This software is to facilitate the management of debt cases. Currently the documentation for these cases is found in individual case files or on an Excel spreadsheet managed by a single person. Meaning that the process of assuring debt payments are up-to-date and viewing the status of these cases falls on a single person. Also, the only way to see which ones are in default is to go through each sheet and examine the sheet to see if current payments cover the rent owed. Because of this a cases can easily lack follow-up when the workload of that case worker is higher than the normal or has a leave of absence. 

This software is for authorized case workers who will: enter payments, new debts and follow up on active cases.


## Functional Description
<!-- Functional Descrition
 With this section, you’re trying to answer a simple question: What does the software do? Of course, to answer this question thoroughly, you’ll need to dig a little deeper. In your functional description, you should cover error handling, one-time startup procedures, user limitations, and other similar details.  -->

### Authentication / User Admin
A login is necessary to keep the information confidential and assure that only authorized personnel has access. Due to this, it will not have a traditional registration page. Instead, there will be a page where an administrator can create new accounts.

The login should include a message for unregistered people, telling them that the admin must make them an account. Only administrative accounts will have access to the registration page. There they will be able to create accounts for authorized case workers. The user will need to validate their account and create a password. The page can also revoke access.

#### **Additional Details**
* In the current scope, there is no need to implement access levels for the case worker accounts. 
* Setting a time limit for passwords needs to be evaluated.

#### **Outline**
* Login
* User administration
    * User registration
    * Reset user password
    * Revoke user account
* Reset Password
* Authenticate account
* Initial admin creation

#### **Breakdown**
Login
- It will use a local login since emails to be used are not compatible with any third-party authenticator
- If a user without an account tries to login, they will recieve a message indicating that only an admin can create an account.
- A newly created account needs to be authenticated first.


User Administration View
- restricted access, only administrative accounts (owner and app managers)
- displays a list of users with associated information and accions
    - user account name
    - account type
    - password status (an authentication code exist meaning user needs to enter an initial password or new password)
    - button for reseting user password
    - revoke status (whether the accounts access has been revoked)
    - when accessing the data we make sure we are not including password information.
- displays a section for creating user accounts
    - form for entering email associated to the account
    - owner accounts will have a dropdown to select the type of account they want to create (defaulted to caseworker)


User Registration
- Only an administrative account can access this page to create, revoke and/or reset passwords.
- Their will be two type of administrave accounts: owner and app manager.
- The only other account will be caseworkers.
- Caseworkers can only manage debtors information.
- Owners can create any type of accounts, while app manager can only create caseworkers.
- When an admin creates an account they must send the user the provided key so they can authenticate their account and create a password.
- Newly created accounts are assigned a placeholder for their password of 32 random bytes. The generated bytes are hashed and not saved or displayed.
- The key is not saved but if lost, the administrator can use the reset password button to create a new one.
- [Add-Feature] Implement an email sender to handle account activation and password reset.


Revoke User Access
- Only an administrative accounts can revoke access.
- Owner accounts can revoke access to any account.
- App mangers can revoke access to case workers and other app managers.
- No account can revoke their own access.
- When access is revoked the users session is not suspended. Revoking access only prevents the user from logging into their account.


Password Reset
- Only an administrative account can reset a users password.
- Administrative accounts can reset any users passwords.
- The administrator must send the user the created reset code for them to change the password.
- Reseting a password does not deactivate an account or its current password.
- Lost reset codes can not be recovered but the the account can be reset again for a new code.
- [Add-Feature] Implement email sender so a user can reset their own password.


Authorize User / Change Password
- Verifys that code is exists and has not expired.
- Verifys the password and email submitted.
- If code, password and email passes checks then the password for the associated account is updated.
- If link is used the code and email does not need to be entered.


Authentication Code
- Generates a 10 character code for an account with an expiration time
- Only one code should be present for user.
- Does not deactivate account or removes current password.


Initial Admin
- Only for creating an owner account if no owner account is present or all are revoked.
- Since no account can revoke themselves, this page can only create a new account at setup or if database is accessed.
- This page does not use an activation code. The user directly creates the password while setting up the account.


### Insert/Register Debt Account
For entering the information of a debt account. As a safety measure, we will have a database for the debt information and another for the name and Id. The debtor's name will be the only identifiable information saved about the person who owes the debt.

The new debt page will accept the following information:
- name [string]
- debt amount [number]
- file id [string]
- minimum payment [number]
- start date [date]

#### **Outline**
- Form
- Debtor collection
- Debt collection
- Encyption
- Data conversion

#### **Breakdown**
- Any type of account can create a new debt account.
- Data collected is verified.
    - No field can be left empty 
    - The data submitted must match the type of data for that field
    - Payment and debt can not be 0 and will be saved without decimals.
- Name and file id will be stored encypted.
- If debt information can't be saved to the database then we will remove the debtor information previously saved
- The id created by the database for the debtor information will be used to relate all the data for that debtor.
- Only one debt per person should be registered
    - file id will be used to verify the uniqueness of a debtor


### Debtor List
A user can see a list/table of all the accounts with basic information for each one. It will have a link to go to a full overview of the case. 

The list will display the following information
- name [string]
- current debt [number]
- payments left [int]
- late payment [boolean]

#### **Outline**
- information display
- calculations
    - current debt
    - payments left
    - is payment late
- link to overview page

#### **Breakdown**
- The page only displays the information provided by the server.
- The list is constructed on the server with only the pertinate information needed for the displayed information.

### Case Overview
The case overview page will use the information already in the database to calculate additional information for each case and then display all the information on the page. This includes all the information entered from the registration page and any payments made. 

The information displayed from the database will be:
- name [string]
- debt amount [number]
- file id [string]
- minimum payment [number]
- start date [date]
- payment date [date]
- payment amount [number]
- payment comment [string]

The calculated information displayed will be:
- current debt [number]
- debt payoff date [date]
- payments left [int]
- payments made [int]
- late payments [boolean]

#### **Outline**
- information display/dashboard
- edit debt/debtor information
- list debt accounts
- edit or eliminate payment
- table view for payments
- merge view for payments
- print view

#### **Breakdown**
Basic Display
- Displays the information for the account
- Dropdown has a list of all other cases and switches to those case when selected.
- Data is collected on server and used to create displayed information.
- Data is formatted

Calculations
- current debt: how much the account currently owes after applying all payments
- debt payoff date: estimate date the account will be paid off, based on the amount currently owed and on the minimun payment.
- payments left: amount of minimun payments need to payoff the current debt.
- payments made: how many payments have been made. Not minimun, just the total amount of payments registered.
- late payments: if the account holder is late on its current payment. If current payment is excused this calculation starts from that date onward.

Edit
- Show a prefilled form
- Submitted data is verified:
    
    Payments
    - Only the comment field can be left empty 
    - The data submitted must match the type of data for that field
    - Payment can not be 0 and will be saved without decimals.
    - The payment can be the same date and amount for the same debtor to avoid duplicates
    - payments can't be duplicate (same debtor, date, payment amount)
    - payment will reference debtor for id
    
    Debtor
    - No field can be left empty 
    - The data submitted must match the type of data for that field
    - Payment and debt can not be 0 and will be saved without decimals.
    - debtor file id can't be the same for another account

    Both
    - debtor/payment information must already exist 
    

Delete
- Removes a payment
- Debtor/debt can not be removed

Merge View
- Displays bills and payments side by side.
- Bills and payments will expand across their counter part displaying how much they cover. Meaning a payment that covers two bills will expand to occupy the same rows as those two bills or half way is it covers part of the bill. Bills will do the same thing, if various payments are used to cover the bill, it will occupy those rows or half if it is a partial use.
- Displays whether the the bill is paid or the amount of that bill that is owed.

Table View
- Displays payments and bills linearly.
- Bills and payments are order in ascending order.
- A running balance is kept ending in a positive number if there is an over-payment or a negative if there is an under-payments or 0 if all payments are up-to-date.

### Insert/Register Payment
This page is for entering payment information. 

This information will be:
- date [date]
- the amount paid [number]
- reference to the debtor information [string]
- comments [string]

#### **Pages Outline**
- Enter payment information form

#### **Pages Breakdown**
- Any type of account can create a new debt account.
- Data collected is verified.
    - Only the comment field can be left empty 
    - The data submitted must match the type of data for that field
    - Payment can not be 0 and will be saved without decimals.
    - The payment can be the same date and amount for the same debtor to avoid duplicates
- The id for the debtor will be used as the reference


### Print View
The page will function as a printout for clients, indicating the current status of an account. It will include all the pertinent information about the debt and payments in an easy-to-understand format.

The information contained on this page will be:

Basic Information
- current date [date]
- name [string]
- start date [date]
- initial balance [number]
- amount paid [number]
- estimated payoff [date]
- payments made [int]
- payments due [int]
- amount owed [number]

Payment History
- number [int]
- payment date [date]
- inicial balance [number]
- amount [number]
- comments [string]
- final balance [number]

#### **Outline**
- Display account summary
- Calculate data

#### **Breakdown**
- Lays out the information in an easy-to-understand format with just the information necessary for the debtor to know how much they owe, how long it will take to pay off and to verify payments made.
- Payments are displayed in ascending order with a running balance of the total debt owed are the payment is applied.




## Databases
* Names
    - ID [string]
    - Name [string]
    - File id [string]

* Debt Information
    - ID (=Names.id) [string]
    - Debt amount [number]
    - Minimun payment [number]
    - Start date [date] 

* Payment History
    - ID [string]
    - Reference (=Names.id) [string]
    - Date [date]
    - Amount paid [number]
    - Comments [string]

* Registration
    - ID [string]
    - Email [string]
    - Token [string]
    - createdAt [date]

* Accounts
    - Email [string]
    - Password [string]
    - AccountType [enum]
    - Revoked [boolean]

## User/Client Interface
### Login Page

![login page](https://github.com/diannedejesus/debt_tracker/blob/main/resources/login.png "Login Page")
***

### User Admin
![User Admin](https://github.com/diannedejesus/debt_tracker/blob/main/resources/user-admin.png?raw=true "User Administration Page")
***

### Debt Views
![Debt View - Table](https://github.com/diannedejesus/debt_tracker/blob/main/resources/debts-table.png?raw=true "Debt View - Table")

![Debt View - Merge](https://github.com/diannedejesus/debt_tracker/blob/main/resources/debts-merge.png?raw=true "Debt View - Merge")

***


<!-- User Interfase
There’s a good chance your coding project is going to be an application, which means it will have a user interface. (If your project is a library or something similar, there won’t be an interface.) As clients, UX designers, and programmers discuss and plan the user interface, it’s easy for the lines to get crossed. If the client doesn’t adequately communicate their vision, your teams might build out the user interface only to have the design shot down.  

Here’s the good news: These mishaps are, for the most part, entirely avoidable. You just need to discuss a few questions with the client before you start developing. Do certain elements of the interface change (animations)? Which elements are buttons? How many unique screens can the user navigate to? And, of course, what does all of this actually look like?

And there’s more good news: Wireframe diagrams can help you answer all of these questions! As your client shares their vision for the user interface (perhaps sending rough sketches), your teams should build out wireframe diagrams.

Once these wireframes are approved by the client, include them in the user interface section of your software design document.
-->

## Goals and milestones
Fixes
- [~] fix the small view for user administration (not cutting off anymore but still distorting page a bit.)
- [X] Fix grey bg of header when printing
- Adjust views for distint screens (https://stackoverflow.com/questions/47760132/any-way-to-get-breakpoint-specific-width-classes)

Modifications
- [X] have buttons disabled if that account cant do action in user management
- [X] highlight excused payments
- [X] add payment button to cases
    - [X] one at the top of payment and another at the bottom if a certain number of payments/bills have been added.
- modify how excused payment are shown in print view
    - the excused payment should show the bills that where excused
- in print view if an amount is owed then print the bills owed and the amount for each bill.

Funtionality
- add future bills if payments exceed currently dued.
    - Change how these look to distinguish them

<!-- Secondary Goals, Wishlist Feature, Future -->

### Additional Features
* [X] Modify so currency is displayed as such
* [X] Have the individual case page have an option to switch to another case with out going to list page.
* Access log: Keep track of case workers' logins, edits, and views. Plus changes made to users and debts
* Letters: This is a wish list item. A page that produces a letter for different situations when working with debt accounts.
* Have revoke and reset accounts ask for user password for extra security
    - have payment deletion verify deletion.
* Implement an email sender for verification codes
* Edit an account to change type
* Implement secure a chosen password verifier.
* Review code / optimize

### Issues
<!-- Things that should be looked into but an alternative solution was/can be implemented  -->
- Fix the style sheet of pages
    - [X] create header for pages that are guest / not signed in users
    - Change page titles

### Brain Dump
- verify how password reset and initial creation should be displayed and handled. since we need to know whether it was successful but dont want it stuck in pending if password was recovered and reset is not needed. 
- verify if expired reset keys still show up as pending.

- test late payment verifier




<!-- NOTES
Account Creation & Login
To setup the page you need to go to the route "pageurl/auth/admin" to create the intial owner account. After the owner account is created this page won't let you create anymore accounts. The newly created owner account can create any kind of new accounts. If all owner accounts are remove or revoked then this page can be used to create a new owner account.
This can be done manually in the database. NOTE:: But it might be posible for two owner accounts to revoke each others access while both are login in at the same time.

Only an admin account can create user account. The user creation process will verify if the current user session is an administor before creating an account.

if the authentication code is not created and/or displayed the administrator can just reset the password to get a new code

*If the web app requiered the creation of accounts without an administrator then an authentication process should be implemented. Most likely by adding additional databases to handle authentication of users to avoid abandoned signups.

*This application is ment for small databases. If used with and extensive database then the way data is worked with should be reevaluated to avoid long loading times. You could cache the data locally to avoid calling to the database frequently and setting an interval for verifying for changes. Also modify calls the entire database for only a select amount of data to be displayed. Setting the display data to pages.

================

NOTE:: Check testing routes with postmen or similar app to ensure restrictions work. [research]
NOTE:: Revisit tests
NOTE:: verify error handling, throw errors [research]
NOTE:: submitting request for delete or others without forms [research]
NOTE:: try consolidating views
NOTE:: removing all saved session to prevent access to revoked user.
NOTE:: verify changeing password hashing to data model

DONE:: Verify callback and awaits in same application. Is it ok?? [research]
DONE:: Verify render vs redirect?? [research]
Done:: How to validate a comment field
 -->

### Completed
- [X] database connection *
- [X] configure passport local login *
- [X] local session variable handler *
- [X] encryption *

- [X] Account summary
    - [X] basic page layout
    - [X] pull info from database

- [X] Register Debt Page
    - [X] basic form page
    - [X] verify data
        - [X] identifier is not already present in database
            - [X] if so then debt case is already present and should be added to that case
        - [X] data is in correct format and sanitized
    - [X] save data to database
        - [X] Name and case id is encrypted and saved to seperate database
        - [X] debt information save to seperate database with account identifier

- [X] Login Page
    - [X] basic layout
        - [X] admin only registration message
    - [X] data verification
        - [X] assure that format is correct
        - [X] user is present in database
        - [X] password matches
    - [X] verify if account/email exists and is registered
        - [X] message if account does not exist or is not registered
        - [X] match password if exists
        - [X] create session if password matches with account

- [X] Reset Password
    - [-] verify email validity
    - [extra] send email with link *
    - [X] basic reset password form page
    - [X] change password

- [X] Registration Page
    - [X] basic page layout
    - [-] add temporary user
        - [-] temporary password
        - [-] basic initial login/user registration page
            - [-] reset initial password
    - [X] user list page
    - [X] revoke user access
    - [extra] send email with link *

- [X] Register payment page
    - [X] basic layout
    - [X] verify data
        - [X] correct formats
        - [~] duplicate payments (warning + edit to remove)
    - [X] save to database

- [X] Debtor Page
    - [X] basic page that shows debtors
        - [X] show debt payoff info and late payments
    - [X] page for debtors info, debt and payments
    - [X] edit payment /edit info
    - [X] delete
    - [X] verify
    - [X] submit

* Issues Resolved
- [X] can we use req.flash to store other messages besides errors? [test using other name and merging to messages]
- [X] how to handle the reset of an admin password [implement owner/appAdmin account who can create admins but admins can't manage]
    - [X] revoked owner still prevents new admin creation
- [X] make sure an account can't be both owner and manager
- [X] sepearate data handlers for printview and cases
- [X] login page should not appear if user is already login
- [X] loggedin user should not have access to verify account page
- [X] error when user create is submitted can't find page redirect.
- [X] getting header error when submitting user that is already created and it is giving me the verification code and it is creating the invalid account
- [X] verify variable naming schema for password reset and account verification since both use the same code.
- [X] how should payments that are greater than the minimun payment be processed?
- [X] payments for a debtor with the same date and payment amount will issue an error.
- [X] verify how accurate payments left is
- [X] how to handle late/missed payments? (zero payment only for pay/bill date to indicated excused payment? server calculation add to object)
- [X] Test payments over dued amount
- [X] verify how other routes need to handle revoked access [research]
    - [X] Implement warning about revoking access, saying it only stop the user from logging in at their next attempt.
    - [-] how to remove the current session of a user?
Fixes
- [X] update the debt list and dashboard page with the new calculation for when a debt is late.
- [X] excused payment access
- [X] have edit payment check for duplicate values
    - [x] verify display of error
- [X] verify how excused payments and late payments are calculated.

Modifications
- [X] Either switch or include name for registering payment info or implement alternate method for doing
    - [X] possible have a look up in file id input
- [X] place id on debt list view
- [X] have identifier for admin account instead of name
- [X] have user section of header display a name and not the whole email.
- [X] include payment info (date, comments) for merge view.
- [X] change the way info is displayed in merge view. Have rolling balance.
- [X] create a footer

Funtionality
- [X] merge view: edit so it displays all payments even if no more bills are due
- [X] set limits for dates that are entered: payments/edit, debt/edit

- [X] Have insert/edit debt/payment return data on error for correction
- [X] excuse payment prefill
- [X] Verify render paths of insert debt/payment
- [X] extra payments in merge view have a running balance
- [X] adjust login, manualcode, verifyaccount, administrator, index styles
- [X] implement check for unicode icon for compatibility
- [X] debtor list modify debt as currency and possible center info


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