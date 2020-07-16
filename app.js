const express = require("express");
const app = express();
const cheerio = require('cheerio');
const request = require('request');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const mongoose = require('mongoose');


/////////////////////////////mongodb setup/////////////////////////////////////
const uri = "mongodb+srv://abhisekkumar:passcode23@internproject-zscmu.mongodb.net/internProject?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const { subscribeSchema } = require('./schema/subscription');
const subscriber = mongoose.model("subscriber", subscribeSchema );
const { siteSchema } = require('./schema/site');
const site = mongoose.model("site", siteSchema );
////////basic setups///////////////////////////////////////////////////////////
app.use(bodyParser.urlencoded({extended:true}));
//app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,'public')));

///////////////////////////////////////////////////////////////////////////////


//////////////////////////////GLOBAL CONTAINERS/////////////////////////////////
let commoditiesList = [];
let articles = [];
//let commodities = [];
let defaultImage = ["https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQTm9KNQEBbR-q0d1qvQsGhQk4WrBNvMmZfycKUw9LYNeX6_wjq&usqp=CAU",
"https://image.shutterstock.com/image-photo/business-success-stock-graph-light-260nw-302395604.jpg",
"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcReR8A2BTb55TRGPmmmh1UXJ0C9qDQFmCY9oJxpxmvY3BP1gylx&usqp=CAU",
"https://image.shutterstock.com/image-photo/business-decision-making-on-energy-260nw-503251870.jpg",
"https://thecryptosight.com/wp-content/uploads/2019/07/clean-energy-blockchain.png",
"https://static.coindesk.com/wp-content/uploads/2017/06/power-cables.jpg",
"https://www.bonova.net/wp-content/uploads/2018/01/commodity-trading-1080x675.png"];


//////////////////////////////////Sites Crawl//////////////////////////////



/////////////////////////////CBNN site//////////////////////////
function articleCollect(url){
  request(url,(error,response,body)=>{
    if(error){
      console.log(error);
    }else if(response.statusCode === 200){
      let $ = cheerio.load(body);
      $(".Card-standardBreakerCard").each((index,element)=>{
        let link = $(element).find('.Card-mediaContainer').attr("href");
        let image = $(element).find('img').attr('src');
        if(image===undefined){
          image = defaultImage[index%7];
        }
        let title = $(element).find('.Card-eyebrowContainer').text();
        let content = $(element).find('.Card-title').text();
        let date = $(element).find('.Card-cardFooter ').text();
    //    console.log(date);
        if(image===undefined || link===undefined || title===undefined || date===undefined || content===undefined){
          //console.log("HTTT");
        }else{
        let article = {
          date: date,
          title: title,
          content: content,
          link: link,
          image: image
        };
        articles.push(article);
    }
      });
    }
  });
}

////////////////////ft.com////////////////////////////////////
function apicalls(start,end){
  // let i=1, interval = 500;
for(let i=start; i<=end; i++){
  let x;
  //let u = "https://www.ft.com/companies/oil-gas?page=" + i;
  let u = "https://www.ft.com/companies/energy?page=" + i;
  request(u,(error, response, body)=>{
    if(error){
      console.log(error);
    }else{
      if(response.statusCode === 200){
        let $ = cheerio.load(body);
        let count = 1;
        $(".o-teaser-collection__item").each((i, element)=>{  //collection of articles
          let date =   $(element).find('li .o-date').text();
          let title =  $(element).find('.o-teaser__tag').text();
          let content =  $(element).find('.js-teaser-heading-link').text();
          let content2 = $(element).find('.js-teaser-standfirst-link').text();
         let link =  "https://www.ft.com" + $(element).find('.js-teaser-heading-link').attr('href');
        let image =  $(element).find('.o-teaser__image-placeholder a img').attr('data-src');
          //console.log(date,'\n', title,'\n',  content,'\n', content2, '\n', link, '\n', image, '\n');
          if(image===undefined){
            image = defaultImage[i%7];
          }
          let article = {
            date: date,
            title: title,
            content: content + " " +content2,
            link: link,
            image: image
          };
          articles.push(article);
          count++;
        });
      }
    }
  });
}
}


////////////////////////////Mckinsey Site/////////////////////////////////

function mckinsey(url, titles){
  request(url, (error,response,body)=>{
    if(error){
      console.log(error);
    }else if(response.statusCode === 200){
      let $ = cheerio.load(body);
        $('.four-up .block-list .item').each((index,element)=>{
          let link = "https://www.mckinsey.com" + $(element).find('.image a').attr('href');
           let content = $(element).find('.item-title-link').text();
          // let content = $(element).find('.description').text();
          let title = titles;
           let image = $(element).find('.image a img').attr('src');
           if(image === "/redesign/resources/images/lazy-placeholder.png"){
             image = defaultImage[index%7];
           }
           let date = $(element).find('.description time').text();
           if(content===""){

           }else{
             let article = {
               date: date,
               title: title,
               content: content,
               link: link,
               image: image
             };
             articles.push(article);
           }
        });
    }
  });
}


///////////////////WORLD TRADE MARKET PRICE//////////////////////////////////////////////
function pricetrade(){
  let url = "https://in.finance.yahoo.com/commodities";
  request({
    url: url
  }, (error, response, body)=>{
    if(error){
      console.log(error);
    }
    else if(response.statusCode === 200){
        let $ = cheerio.load(body);
        //  console.log($.html());
        $(".yfinlist-table tbody tr").each((i,element)=>{
        //  let symbol = $(element).find('.data-col0').text();
          let name = $(element).find('.data-col1').text();
          let price = $(element).find('.data-col2').text();
        //  let markettime = $(element).find('.data-col3').text();
          let change = $(element).find('.data-col4').text();
          let changePer = $(element).find('.data-col5').text();
        //  let volume = $(element).find('.data-col6').text();
        //  let openInterest = $(element).find('.data-col7').text();
          let commodity = {
          //  sym: symbol,
            name: name,
            price: "$" + price + "/unit",
          //  markettime: markettime,
            change: change,
            changePer: changePer
          //  volume: volume,
          //  openInterest: openInterest
          };
          commoditiesList.push(commodity);
        });
    }
  });


}

///////////////////////////////////////////////////////////////////////////////
function apicalls2(){
  // let i=1, interval = 500;
// for(let i=start; i<=end; i++){
//   let x;
  //let u = "https://www.ft.com/companies/oil-gas?page=" + i;
  let u = "https://www.economist.com/topics/agriculture";
  request(u,(error, response, body)=>{
    if(error){
      console.log(error);
    }else{
      if(response.statusCode === 200){
        let $ = cheerio.load(body);
        let count = 1;
        $(".clearfix .topic-page-item-list ul li").each((i, element)=>{  //collection of articles
          let date =   $(element).find('.topic-page-meta').text();
          let title =  "Agriculture & Fishing";
          let content =  $(element).find('.topic-item-title').text();
         let link =  "https://www.economist.com" + $(element).find('.topic-item-title a').attr('href');
        let image =  $(element).find('img').attr('src');
        //  console.log(date,'\n', title,'\n',  content,'\n', link, '\n', image, '\n');
        //  console.log($(element).text());
          if(image===undefined){
            image = defaultImage[i%7];
          }
          let article = {
            date: date,
            title: title,
            content: content,
            link: link,
            image: image
          };
          articles.push(article);
          // count++;
        });
      }
    }
  });
// }
}


function apicalls3(start,end){
  // let i=1, interval = 500;
 for(let i=start; i<=end; i++){
  let u = "https://www.economist.com/topics/agriculture?page=" + i;
  request(u,(error, response, body)=>{
    if(error){
      console.log(error);
    }else{
      let topics = ["agriculture","Fishing", "Farming"];
      if(response.statusCode === 200){
        let $ = cheerio.load(body);
        let count = 1;
        $(".clearfix .topic-page-item-list ul li").each((i, element)=>{  //collection of articles
          let date =   $(element).find('.topic-page-meta').text();
          let title =   "Farming";
        //  let content =  $(element).find('.topic-page-rubric').text();
        let content =  $(element).find('.topic-item-title').text();
        let ppp = content.toLowerCase();
        if(content.includes("agriculture")){
          title =   "Agriculture";
        }else if(content.includes("fishing")){
          title =   "Fishing";
        }
         let link =  "https://www.economist.com" + $(element).find('.topic-item-title a').attr('href');
        let image =  $(element).find('img').attr('src');
        //  console.log(date,'\n', title,'\n',  content,'\n', link, '\n', image, '\n');
        //  console.log($(element).text());
          if(image===undefined){
            image = defaultImage[i%7];
          }
          if(title===undefined || content===undefined){

          }else{
          let article = {
            date: date,
            title: title,
            content: content,
            link: link,
            image: image
          };
          articles.push(article);
        }
          // count++;
        });
      }
    }
  });
 }
}
///////////////////////////////////////////////////////////////////////////////

//////////////////home/landing/////////////////////////////////////
app.get("/",(req,res)=>{
  commoditiesList = [];
  articles = [];
  pricetrade();
  //exe1();
  apicalls(1,5);
  articleCollect("https://www.cnbc.com/energy");
  mckinsey("https://www.mckinsey.com/industries/oil-and-gas/our-insights", "Oil and Gas");
  mckinsey("https://www.mckinsey.com/industries/agriculture/our-insights", "Agriculture");
  apicalls(6,7);
  mckinsey("https://www.mckinsey.com/industries/electric-power-and-natural-gas/our-insights", "Electric power and Natural gas");
  mckinsey("https://www.mckinsey.com/industries/metals-and-mining/our-insights", "Metal and Mining");
  apicalls2();
  // apicalls3(1,2);
  articleCollect("https://www.cnbc.com/oil-gas");
  articleCollect("https://www.cnbc.com/renewable-energy");
  res.render("index.ejs");
});

app.get("/home",(req,res)=>{
  let tag="all";
  let sendData = [commoditiesList, articles, tag];
  res.render("articles.ejs",{sendData: sendData});
});

///////////////////////////subscribe////////////////////
app.get("/subscribe",(req,res)=>{
  let sendData = [commoditiesList];
  res.render("subscription.ejs",{sendData: sendData});
});
app.post("/subscribed",(req,res)=>{
  let name = req.body.name;
  let email = req.body.email;
  let topic = req.body.topic;
  let output = `
    <h3> Hi ${name},</h3>
    <p>You have successfully subscribed our website ENERGY INSIGHT!!.</p>
    <p>You will recieve updates regarding the topic "${topic.toUpperCase()}", that you have selected.</p>
    <p>Thank you!</p>
    <p>ENERGY INSIGHT!!</p>
  `
  let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abhisekkumar.intern1@gmail.com',
    pass: 'passcode23'
  },
  tls:{
    rejectUnauthorized:false,
  }
  });

  var mailOptions = {
  from: 'Energy insights.subscribers<abhisekkumar.intern1@gmail.com>',
  to: email,
  subject: 'Successfully subscribed to ENERGY INSIGHT!!!',
  html: output
  };

  transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
    res.render("failure.ejs");
  } else {
    let subs = {name: name, email:email, topic: topic.toLowerCase()};
    subscriber.create(subs, (err, newly) => {
        if (err) {
            console.log(err);
        } else {
            res.render("success.ejs");
        }
    })
  }
  });

});

/////////////////////////////filter/tags////////////////////////
app.get("/tags/:tag",(req,res)=>{
  let tag = req.params.tag.toLowerCase();
  tagArticle = [];
  articles.forEach((article)=>{
    let title = article.title.toLowerCase();
    let content = article.content.toLowerCase();
    let date = article.date.toLowerCase();
    if(title.includes(tag) || content.includes(tag) || date.includes(tag)){
      tagArticle.push(article);
    }
  });
  let sendData = [commoditiesList, tagArticle, tag];
  res.render("tag_article.ejs", {sendData: sendData});
  //res.send(tag);
});

app.post("/filter", (req,res)=>{
  let tag = req.body.input;
  let url = "/tags/" + tag;
  res.redirect(url);
});

/////////////////////////////ADMIN/////////////////////////////////////////////
app.get("/lists",(req,res)=>{
  subscriber.find({},(err,subs)=>{
    if(err){
      console.log(err);
    }else{
      res.render("subscribers.ejs", {subscribers: subs});
    }
  });
});

app.get("/admin",(req,res)=>{
  let msg="";
  res.render("adminlogin.ejs",{msg: msg});
});

app.get("/logout", (req,res)=>{
  res.redirect("/admin");
  // let msg="Successfully logged out!!";
  // res.render("adminlogin.ejs",{msg: msg})
});
app.post("/login",(req,res)=>{
  let username = req.body.username;
  let password = req.body.password;
  if(username==="admin" && password==="passcode23"){
    res.redirect("/sitelist");
  }else{
    let msg = "Wrong username or password!!"
    res.render("adminlogin.ejs",{msg: msg})
  }
});

app.get("/sendmail", (req,res)=>{
  res.render("sendmail.ejs", {msg:""});
});

app.post("/sendmails",(req,res)=>{
  let topic = req.body.topic.toLowerCase();
  let text = req.body.text;
  let mailto = [];
  if(topic==="all"){
    subscriber.find({},(err,subs)=>{
      if(err){
        console.log(err);
      }else{
        subs.forEach((item) => {
            mailto.push(item.email);
        });

        let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'abhisekkumar.intern1@gmail.com',
          pass: 'passcode23'
        },
        tls:{
          rejectUnauthorized:false,
        }
        });

        var mailOptions = {
        from: 'Energy Insight subscribers<abhisekkumar.intern1@gmail.com>',
        to: mailto,
        subject: 'Update regarding your topic!!!',
        html: `<p>${text}</p>`
        };

        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          res.render("sendmail.ejs", {msg:"Sorry!something went wrong!!!!"});
        } else {
            res.render("sendmail.ejs", {msg:"Mails send successfully!!! Send another one if you want!"});
        }
        });
      }
    });
  }else{
    mailto = [];
    subscriber.find({topic:topic || "all"},(err,subs)=>{
      if(err){
        console.log(err);
      }else{
        subs.forEach((item) => {
            mailto.push(item.email);
        });
        let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'abhisekkumar.intern1@gmail.com',
          pass: 'passcode23'
        },
        tls:{
          rejectUnauthorized:false,
        }
        });

        var mailOptions = {
        from: 'Energy Insight subscribers<abhisekkumar.intern1@gmail.com>',
        to: mailto,
        subject: 'Update regarding your topic!!!',
        html: `<p>${text}</p>`
        };

        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          res.render("sendmail.ejs", {msg:"Sorry!something went wrong!!!!"});
        } else {
            res.render("sendmail.ejs", {msg:"Mails send successfully!!! Send another one if you want!"});
        }
        });
      }
    });

  }
});

// app.get("/addsite",(req,res)=>{
//   res.render("addsite.ejs");
// });

app.get("/sitelist",(req,res)=>{
  res.render("sites.ejs");
});

//////////////////////////////////ALL UNATTENDED URLS//////////////////////////

app.get("*",(req,res)=>{
  res.send("This url is not available!!! Please check the url again.")
});
////Listening to port 3000 for the localhost///////////////////
app.listen(3000,()=>{
  console.log("Server is running at port 3000");
});
