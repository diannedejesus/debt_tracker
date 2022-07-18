//you can use this section to declare dependancies that any of your functions can use.

module.exports = { //create a module that will be readable to any code that calls it. In other words when you access this module you will be able to use the individual functions declare in it with dot notation
    index: async (req,res)=>{ //defining a variable (property or method) with the name index, it with be an asychronous function as defined by the async keyword and the arrow function expression. You could just as easily written: async function(req,res){}
        try{
            res.render('index.ejs', { 
                //user: user,
            })
        }catch(err){
            console.log(err)
        }
    },
    
    // letterView: async (req,res)=>{
    //     try{
    //         const info = await HistoricImportDB.findOne({accessLink: req.params.idCode})

    //         res.render('letter.ejs', { info, messages: req.query.messages })

    //     }catch(err){
    //         console.log(err)
    //     }
    // },

    

    // export end
}    