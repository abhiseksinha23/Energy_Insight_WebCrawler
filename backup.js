////////////////checking(tradingeconomics api)////////////////
//const te = require('tradingeconomics');
//te.login();
// let data = te.getMarketCommodity(category = 'Markets').then(function(data){
//     console.log(data)
// })
// data = te.getMarketSnap(marketsField = 'commodities').then(function(data){
//        console.log(data)
//    });
// data = te.getMarketSnap(search_term = 'united states').then(function(data){
//         console.log(data)
//     });



//////////////////////////////////////////////////////////////
const c = new crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log($("title").text());
            console.log($(".sub-header__page-title").text());
            // $("ul li").each((i,element)=>{
            //   let ele = $(element);
            //   console.log(ele.trim());
            // });
      //    console.log($("#stream").text());
        }
        done();
    }
});
let name ="";
const craw = new crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            let $ = res.$;
  //           let $ = cheerio.load(res,{
  //             xml: {
  //     normalizeWhitespace: true,
  //   }
  // });
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
          //  console.log($("title").text());
            //  name +=
              $(".o-teaser-collection__list").each((i, element)=>{
                console.log($(element).text());
              });

          //    console.log($(".sub-header__page-title").html());
          //    console.log($(".stream-item").text());
            // $("img").each((i,element)=>{
            //   let ele = $(element);
            //   console.log(ele);
            // });
      //    console.log($("#stream").text());
        }
        done();
    }
});

let urls = ['https://www.ft.com/companies/energy','https://www.google.com','https://www.mckinsey.com/industries/oil-and-gas/how-we-help-clients/energy-insights/overview'];
//craw.queue(urls);

//craw.queue(['https://www.ft.com/companies/energy','https://www.ft.com/companies/oil-gas']);
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// function stringtodate(date){
//   let l = [];
//   let a=" ";
//   for(let i =0; i<date.length; i++){
//     if(date[i]==','|| date[i]==" "){
//       if(a!=0 && a!=" ")
//         l.push(a);
//       if(i<date.length && date[i+1]>='0' && date[i+1]<='9'){
//         a = 0;
//       }
//       continue;
//     }
//     if(date[i]>='0' && date[i]<='9'){
//       a += a*10+
//     }
//   }
//   console.log(l);
// }



/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////site for price checking///////////////////////////
//https://economictimes.indiatimes.com/markets/commodities
//https://markets.businessinsider.com/commodities
//https://www.moneycontrol.com/commodity/
//https://money.cnn.com/data/commodities/
//https://in.finance.yahoo.com/commodities
//https://tradingeconomics.com/commodities
//https://www.moneycontrol.com/commodity/mcx.php
//https://github.com/tradingeconomics/tradingeconomics/tree/master/nodejs


//////////////////////////////////////////////////world trade meter///////////////////////
require('events').EventEmitter.prototype._maxListeners = 10000;
function tradePrice(){

  //let url = "https://tradingeconomics.com/commodities";
  //emitter.setMaxListeners(10);
   //let url = "https://markets.businessinsider.com/commodities";
   let url = "https://www.moneycontrol.com/commodity";
  request({
    //jar: true,
    url: url,
    //followRedirect: false,
  //  method: "GET"
  }, (error, response, body)=>{
    //console.log(url);
    if(error){
      console.log(error);
    }
    else if(response.statusCode === 200){
        let $ = cheerio.load(body);
        //  console.log($.text());
      // console.log($(".table-responsive").text());
        $(".commodity_container .active tr").each((i,element)=>{
          // let eachelement = $(element).find('.robo_medium').text();
          // let price = $(element).find('td').text().split('');
          let date = $(element).find('.robo_medium .date').text()
           let eachelement = $(element).text().split('\n\t\t\t');
           let name="",price="";
           let forname = eachelement[1];
        //   let forprice = eachelement[2];
           if(typeof(forname)!=='undefined'){
              //  console.log(forname);
              price = eachelement[2];
                for(let x=0; x<forname.length; x++){
                  if(forname[x]>='0' && forname[x]<='9'){
                    break;
                  }
                  name += forname[x];
                }
                let contents = {
                  sno: i,
                  name: name,
                  date: date,
                  price: "Rs." + price + "/unit"
                };
                commodities.push(contents);
                // console.log(name, date, price);
           }

        });
    //    console.log(commodities);
    }
  });
}
tradePrice();

app.get("/tricker",(req,res)=>{
  //tradePrice();
  res.render("show.ejs",{data: commodities});
});
