//you can use this section to declare dependancies that any of your functions can use.

module.exports = { //create a module that will be readable to any code that calls it. In other words when you access this module you will be able to use the individual functions declare in it with dot notation
    index: async (req,res)=>{ //defining a method with the name index, it with be an asychronous function as defined by the async keyword and the arrow function expression. 
        try{ //when working with async we are working with outside requests which can fail for various reasons. The try/catch pair with run the code and if a request fails it will defaults to catch.
            res.render('index.ejs', { //res as in respond, so we are responding by invoking the render method and telling it to render the page (interprete the code and show the resulting html) index.ejs. We can also pass it an object with key/value pairs for the page to use.
                //user: user,
            })
        }catch(err){
            console.log(err) //display the error in the console
        }
    },
    
    useAsyncFunction: async function(req,res){ //defining a method with the name useAsyncFunction, it with be an asychronous function as defined by the async and function keyword. 
        try{//when working with async we are working with outside requests which can fail for various reasons. The try/catch pair with run the code and if a request fails it will defaults to catch.
            res.render('index.ejs', { //res as in respond, so we are responding by invoking the render method and telling it to render the page (interprete the code and show the resulting html) index.ejs. We can also pass it an object with key/value pairs for the page to use.
                //user: user,
            })
        }catch(err){
            console.log(err) //display the error in the console
        }
    },

    useFunction: function(req,res){ //defining a method with the name useFunction, it with be a function as defined by function keyword or could be rewitten as an arrow key function. 
        res.render('index.ejs', { //res as in respond, so we are responding by invoking the render method and telling it to render the page (interprete the code and show the resulting html) index.ejs. We can also pass it an object with key/value pairs for the page to use.
            //user: user,
        })
    },

    

    // export end
}    