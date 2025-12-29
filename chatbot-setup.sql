CREATE DATABASE fitness_chatbot;
USE fitness_chatbot;

CREATE TABLE chatbot_qa (
    id INT PRIMARY KEY AUTO_INCREMENT,
    keywords VARCHAR(300),
    answer TEXT
);

INSERT INTO chatbot_qa (keywords, answer) VALUES

('website,about,project',
'This website is a personalized fitness and diet planning application that helps users achieve their health goals through customized diet plans and recipes.'),

('who,use,app',
'Anyone who wants to lose weight, gain weight, maintain fitness, or follow a healthy diet can use this app.'),

('free,cost,price',
'Yes, the application is free for users.'),

('fitness,diet,app',
'It is both a fitness and diet planning application.'),

('account,signup,login',
'Yes, users need to sign up to access personalized diet plans.'),

('login,required,why',
'Login is required to save user data and generate accurate diet plans.'),

('data,safe,privacy',
'Yes, the system ensures user privacy and data security.'),

('information,provide,profile',
'Users must provide age, weight, height, gender, and health goals.'),

('age,weight,why',
'This information is used to calculate calorie needs and generate a personalized diet plan.'),

('update,profile,edit',
'Yes, users can update their profile information anytime.'),

('diet,plan,generate',
'The diet plan is generated based on user profile data and selected health goals.'),

('health,goals,options',
'Lose weight, gain weight, maintain weight, and diabetes-friendly diet.'),

('personalized,custom,diet',
'Yes, every diet plan is personalized for each user.'),

('calculate,calories',
'Yes, the app calculates daily calorie intake.'),

('calorie,divide,distribution',
'Calories are divided as Breakfast 25%, Lunch 35%, Dinner 30%, Snacks 10%.'),

('daily,follow,plan',
'Yes, the plan is designed for daily use.'),

('recipes,available',
'Yes, the app has a searchable recipe database.'),

('recipe,details',
'Each recipe includes ingredients, preparation steps, and calorie count.'),

('search,recipes',
'Yes, users can search recipes easily.'),

('diet,recipes,include',
'Yes, diet plans include recommended recipes.'),

('track,calories',
'Yes, calorie intake is calculated and managed.'),

('meal,calorie,details',
'Yes, calorie details are shown for every meal.'),

('calculation,accurate',
'The system follows validated nutrition formulas.'),

('technology,used',
'The app is built using Node.js, React, SQL database, and Socket programming.'),

('real,time,application',
'Yes, it supports real-time features like chatbot using sockets.'),

('database,used',
'Yes, an SQL database is used to store data.'),

('chatbot,work',
'This chatbot answers questions related to the fitness and diet website.'),

('ai,chatbot',
'It is a rule-based chatbot using predefined knowledge.'),

('socket,chatbot,how',
'It uses socket programming for real-time communication.'),

('medical,advice',
'The chatbot only answers questions related to the application.'),

('track,progress',
'Yes, progress tracking is planned in future updates.'),

('diet,history,save',
'Yes, user data can be saved with accounts.'),

('mobile,responsive',
'Yes, the app is responsive on all devices.'),

('user,friendly,ui',
'Yes, the UI is clean and easy to use.'),

('share,data',
'No, user data is private and secure.'),

('authentication,secure',
'Yes, secure login methods are used.'),

('university,project',
'Yes, this project is developed for academic purposes.'),

('problem,solve',
'It solves the issue of generic diet plans by offering personalized solutions.'),

('unique,feature',
'Personalized diet plans combined with recipe search.'),

('unrelated,question',
'Sorry, I can only answer questions related to this fitness and diet website.');
