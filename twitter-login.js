const dotenv = require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const mysql = require('mysql');
const { Console } = require('console');
const axios = require('axios');

// 获取当前日期
const currentDate = format(new Date(), 'yyyy-MM-dd');

// 构建文件路径
const filePath = path.join(__dirname+'/log', `${currentDate}.txt`);
// 代理类别
const proxyType = "proxy-store";//
const proxyKey = "019241a185dcd30a33327077b14a3415";//


//like -- 点赞数量 -- 大于0的时候启动  可以搭配tag使用
//keyword和comments -- 根据关键取数据，在特定帖子里面@人  -- 同时有数据任务才启动
//
// tag -- 根据tag查询推文 -- 根据推文点赞   %23 == #
// const accounts = [
//   {name:'newman_vic776',password:'Zr0gYS33', proxy: '', like:0, keyword : 'CoinbaseExch', tag:'claim', twitterAddress:'', comments:''},
//   {name:'EmersonHar54301',password:'V1mdSu63', proxy: '', like:106, keyword : 'CoinbaseExch', tag:'claim', twitterAddress:'', comments:''},
// ];

//创建mysql数据库访问连接（数据库主机地址，用户名和密码，数据库名称根据情况自行修改）
const connection = mysql.createConnection({
	host: '49.235.252.234',
	user: 'tw',
	password: 'SmjffkjNPmJyjWZp',
	database: 'tw'
});

//连接数据库
connection.connect();

(async () => {
  try {
    connection.query("select * from  account where first=0 and isgoing=1 and (`like` >0 or keyword<>'' or followkeyword <>'' or  (IFNULL(twitterAddress,'')<>'' and IFNULL(sendMessage,'')<>'')) LIMIT 10 ", function(error, results, fields){
      
      // const tweetText = await firstTweet.$eval('div[lang] ', el => el.textContent);
      // console.log(`Sticky tweet text: ${tweetText}`);

      // 关闭浏览器
      // await browser.close();
      for(let i = 0;i<results.length;i++){
        let account = results[i];
        task(account);
      }
    });

  } catch (error) {
    console.error(error);
    // 捕获错误

    // 构建错误信息
    let errorMessage = `[${new Date().toISOString()}] 错误信息 --- ${error.stack}\n`;

    // 将错误信息写入文件
    fs.appendFileSync(filePath, errorMessage, 'utf8');

    console.log(`错误信息已写入文件：${filePath}`);
  } finally {
    

  }
})();


const task = async(account) => {


  connection.query('update account set isgoing = 0  where name="'+account.name+'"', function(errorGo, resultsGo, fieldsGo){
  });


// for (const account of accounts) {
  // for(let i = 0;i<results.length;i++){
    // let account = results[i];
    // account.like = 0;
    // account.followkeyword = "%23loyal %23erc20 %23loyaleth";
    // account.twitterAddress = "https://twitter.com/3orovik/status/1658612393100861440";



    const launchOptions = {headless: false,
      // args: [
      //   '--proxy-server=192.168.1.25:30000',
      // ] ,
      userDataDir: '/path/to/user/data/dir/'+account.name,
    };
    
    

    // // if(account.proxy){
    //   // 发送 HTTP 请求到 Rola API 获取代理地址
    //   const response = await axios.get(`https://proxy-store.com/api/${proxyKey}/getproxy`);
    
    //   const proxy = response.data; // 获取代理地址
    //   if(proxy){
      
    //   }
    //   console.log('proxy----',response.data);
    
      // launchOptions.args = ['--proxy-server=43.130.10.70:20439'];
    // }
    console.log('launchOptions----',launchOptions);
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    // await page.authenticate({ username: 'tik2012120311_protonmail', password: 'fbe34d2406' });

    // add condition to check if user name has been requested
    // review repos
    //create a new branch for the new changes
    // fbe34d2406
    // await page.goto("https://www.whoer.net/");

    // if(account.cookie){
    //   // 解码 Base64 Cookie 并将 Cookie 设置到页面中
    //   const decodedCookie = decodeBase64ToCookie(account.cookie);
    //   console.log('cookies',decodedCookie.cookies);
    //   // 将 Cookie 设置到页面中
    //   await page.setCookie(decodedCookie.cookies);
    // }

    await page.goto("https://twitter.com/home", { waitUntil: 'networkidle2' });
    await page.waitForTimeout(5000);

    console.log('Login account name1',account.name);
    // 检查用户是否已登录
    const loginButton = await page.$('input[autocomplete="username"]');

    // console.log('loginButton',loginButton);
    if (loginButton) {
      console.log('Login account name2',account.name, account.password);
      // await page.goto("https://twitter.com/i/flow/login");
      
      await page.type('input[autocomplete="username"]', account.name, { delay: 100 });

      page.click('div[class="css-18t94o4 css-1dbjc4n r-sdzlij r-1phboty r-rs99b7 r-ywje51 r-usiww2 r-2yi16 r-1qi8awa r-1ny4l3l r-ymttw5 r-o7ynqc r-6416eg r-lrvibr r-13qz1uu"]');

      
      await page.waitForSelector('input[autocomplete="current-password"]', { timeout: 50000 });

      await page.type('input[autocomplete="current-password"]', account.password, { delay: 100 });
      
      await Promise.all([
        page.click('div[class="css-18t94o4 css-1dbjc4n r-sdzlij r-1phboty r-rs99b7 r-19yznuf r-64el8z r-1ny4l3l r-1dye5f7 r-o7ynqc r-6416eg r-lrvibr"]'),
        page.waitForNavigation(),
      ]);
      await page.waitForSelector('div[data-testid="SideNav_AccountSwitcher_Button"]', { timeout: 30000 });
      const isLoggedIn = await page.evaluate(() => {
        return document.querySelector('div[data-testid="SideNav_AccountSwitcher_Button"]') !== null;
      });
      if (isLoggedIn) {
        console.log('Login successful!');
      } else {
        console.log('Login failed!');
      }
    }

    // // 等待登录完成后，获取 Cookie
    // const cookies = await page.cookies();
    // console.log('cookies',cookies);
    
    

    if(account.like > 0 ){
      console.log("tag",account.tag);
      if(account.tag){
        await page.goto(`https://twitter.com/search?q=%23${account.tag}&src=typed_query`);
      }
      else {
        await page.goto(account.twitterAddress);
      }
      const faileCount = 0;
      await page.waitForTimeout(5000);
      for (let i = 0; i < 1000&& account.like >0 ; i++) {

        // 获取当前页面的 URL
        const currentUrl = await page.evaluate(() => window.location.search);

        // 创建 URLSearchParams 对象并解析 URL
        const urlParams = new URLSearchParams(currentUrl);
        if(account.tag){
          // 获取指定参数的值
          const paramValueF = urlParams.get('f');

          if (paramValueF) {
            await page.goto(`https://twitter.com/search?q=%23${account.tag}&src=typed_query`);
            console.log('currentUrl-----'+currentUrl,'paramValueF----'+paramValueF);
            continue;
          }

          const paramValueQ = urlParams.get('q');
          if(!paramValueQ){
            await page.goto(`https://twitter.com/search?q=%23${account.tag}&src=typed_query`);
            console.log('currentUrl-----'+currentUrl,'paramValueQ----'+paramValueQ);
            continue;
          }
          
          if(faileCount>10){
            await page.goto(`https://twitter.com/search?q=%23${account.tag}&src=typed_query`);
            console.log('faileCount-----');
            faileCount = 0;
            continue;
          }
        }

        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight*2);
        });
        await page.waitForTimeout(2000);
        // 获取所有未点赞推文的属性值
        const likes = await page.$$('div[data-testid="like"]');

        // 随机选择一个未点赞推文进行点赞
        const randomIndex = Math.floor(Math.random() * likes.length);
        console.log('未点赞推文数量：'+likes.length,'  当前滚动次数：'+i);
        if(likes.length>0){
          const tweetToLike = await page.$$('div[data-testid="like"]');
          // 设置点击概率为75%
          const clickProbability = 0.75;

          // 生成一个0到1之间的随机数
          const random = Math.random();

          // 判断是否进行点击操作
          if (random < clickProbability) {
            await tweetToLike[randomIndex].click();
            account.like--;
            console.log('已点赞推文  剩余:'+account.like);
            connection.query('update account set `like` = '+account.like+' where name="'+account.name+'"', function(error, results, fields){
              
            });
          }
        }
        let errorMessage = `[${new Date().toISOString()}] 点赞任务 --- 用户:${account.name} \n 剩下:${account.like}\n`;

        // 将错误信息写入文件
        fs.appendFileSync(filePath, errorMessage, 'utf8');

        const time = Math.random()*3000;
        await page.waitForTimeout(time);
      }
    }
    

    //@用户 帖子
    //关键查询->获取非认证的用户
    if(account.twitterAddress ){
      if(account.keyword){
        let commenterNames = [];//@人
        let count = 12 ;//数量

        // await page.goto('https://twitter.com/explore');
        // await page.waitForTimeout(5000);
        
        // // // 点击进入“探索”页面
        // // await page.waitForSelector('nav[data-testidaria-label="主要"] a[data-testid="AppTabBar_Explore_Link"]');
        // // await page.click('nav[data-testid="primaryColumn"] a[data-testid="AppTabBar_Explore_Link"]');
        // // await page.waitForNavigation();

        // // 在“探索”页面输入关键字
        // await page.waitForSelector('input[data-testid="SearchBox_Search_Input"]');
        // // await page.type('input[data-testid="SearchBox_Search_Input"]', account.keyword, { delay: 100 });
        // await page.waitForTimeout(3000);
        // await page.keyboard.press('Enter');
        // // await page.waitForNavigation();

        await page.goto(`https://twitter.com/search?q=${account.keyword}&src=typed_query&f=user`);

        // 等待页面加载完成
        await page.waitForSelector('div[data-testid="UserCell"]');

        // 查找第一个相关用户
        const users = await page.$$('div[data-testid="UserCell"]');
        const firstUser = users[0];
        const username = await firstUser.$eval('div[class="css-901oao r-1awozwy r-18jsvk2 r-6koalj r-37j5jr r-a023e6 r-b88u0q r-rjixqe r-bcqeeo r-1udh08x r-3s2u2q r-qvutc0"] span[class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0"]', el => el.textContent);
        console.log(`First user: ${username}`);

        // // 进入该用户的页面
        await firstUser.click();
        await page.waitForTimeout(5000);

        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });

        await page.waitForTimeout(3000);

        // // 查找置顶帖
        // 等待置顶推文加载完成
        await page.waitForSelector('article[data-testid="tweet"]:nth-child(1)');

        // 点击置顶推文，进入推文页面
        // await page.click('article[data-testid="tweet"]:nth-child(1)');
        // 使用 page.evaluate 方法点击置顶推文
        await page.evaluate(() => {
          const tweetElement = document.querySelector('article[data-testid="tweet"]:nth-child(1)');
          if (tweetElement) {
            tweetElement.click();
          }
        });

        await page.waitForTimeout(3000);

        

        
        // 向下滚动4次
        for (let i = 0; i < 100&& count >0 ; i++) {
          await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
          });
          await page.waitForTimeout(2000); // 等待滚动加载内容

          const comments = await page.$$('article[data-testid="tweet"]');

          console.log(`comments content: ${comments.length}`);
          for (let j = 0; j < 50 && j < comments.length; j++) {
            const comment = comments[j];
            
            // const isVerified = await comment.$('svg[aria-label="认证账号"]');
            const isVerified = await comment.$('svg[aria-label="Verified account"]');
            // console.log(`认证账号 : ${comments.length} ${isVerified}`);
            if (isVerified) {
              continue; // 跳过认证用户
            }
            const commenterName = await comment.$eval('div[class="css-1dbjc4n r-18u37iz r-1wbh5a2 r-13hce6t"] div[class="css-1dbjc4n r-1wbh5a2 r-dnmrzs"] span', el => el.textContent);
            
            if(!commenterNames.includes(commenterName)){
              console.log(`评论人名称：${commenterName}`);
              commenterNames.push(commenterName)
              count--;
            }
          }
        }

        if(commenterNames.length > 0){
          await page.goto(account.twitterAddress);
      
          // console.log(`tweetToReply ${tweetToReply.length}`);
          await page.waitForSelector('div[aria-label="Reply"]');
          // 点击回复按钮，打开回复框
          await page.click('div[aria-label="Reply"]');

          // 等待回复框加载完成
          await page.waitForSelector('div[data-testid="tweetTextarea_0"]');
          
          // 使用逗号分隔符将数组转换为字符串
          let commenterStr = commenterNames.join(' ');
          console.log(`commenterStr ${account.comments}`);
          let commenterAll = `${commenterStr +' ' + account.comments}`;

          await page.type('div[data-testid="tweetTextarea_0"]', commenterAll);


          // 提交回复
          await page.click('div[data-testid="tweetButton"]');

          let errorMessage = `[${new Date().toISOString()}] 回复任务 --- 用户:${account.name} \n 内容:${commenterAll}\n`;


         

          // 将错误信息写入文件
          fs.appendFileSync(filePath, errorMessage, 'utf8');
          
        }
      } 
      if(account.sendMessage){
          console.log('sendMessage',account);
          connection.query("select * from  sendLog where username='"+account.name+"'  and  twitterAddress ='"+account.twitterAddress+"' order by id  LIMIT 1 ",  async function(error, results, fields){
          let senders = '';  
          if(results.length == 0){
            console.log('sendMessage',"INSERT INTO `sendLog` (`username`,`twitterAddress`) VALUE('"+account.name+"','"+account.twitterAddress+"')");
            connection.query("INSERT INTO `sendLog` (`username`,`twitterAddress`) VALUE('"+account.name+"','"+account.twitterAddress+"')", function(error2, results2, fields2){
              
            });
          }else{
            senders = results[0].senders;
          }

          let sendArr = [];

          if(senders){
            sendArr = senders.split(',');
          }

          if(account.twitterAddress.includes("@")){
            let urlAdd = account.twitterAddress.replace("@","");
            console.log('followers url ',`https://twitter.com/${urlAdd}`);
            await page.waitForTimeout(5000);
            await page.goto('https://twitter.com/'+urlAdd);
            
            await page.waitForTimeout(5000);
            console.log('followers url ',`https://twitter.com/${urlAdd}/followers`);
            await page.goto(`https://twitter.com/${urlAdd}/followers`);

            await page.waitForTimeout(5000);
            // console.log('followers url ',`https://twitter.com/${urlAdd}/followers`);
            let previousHeightF = await page.evaluate(() => {
              return document.documentElement.scrollHeight;
            });
            let currentHeightF = 0;

            let previousHeight = await page.evaluate(() => {
              return document.documentElement.scrollHeight;
            });


            while (previousHeightF !== currentHeightF) {
             

              const folloUsers = await page.$$('div[aria-label="Timeline: Followers"] div[class="css-18t94o4 css-1dbjc4n r-1ny4l3l r-ymttw5 r-1f1sjgu r-o7ynqc r-6416eg"]');
              console.log("folloUsers---",folloUsers.length);

              if(folloUsers.length>0){
                for (let i = 0; i < folloUsers.length ; i++) {
                  // await page.waitForTimeout(100000);

                  let sendNameY = await folloUsers[i].$eval('div[class="css-1dbjc4n r-1awozwy r-18u37iz r-1wbh5a2"] span', el => el.textContent);
                  let sendNameN = sendNameY.replace('@','');
                  console.log('ccc----'+i,sendNameN);

                  let secondPage = await browser.newPage();

                  await secondPage.goto('https://twitter.com/'+sendNameN);
                  await secondPage.waitForTimeout(3000);
                  // 检查是否有发送短信的按钮
                  let messageButton = await secondPage.$('div[data-testid="sendDMFromProfile"]');

                  await secondPage.evaluate(() => {
                    window.scrollTo(0, document.documentElement.scrollHeight);
                  });
                  await secondPage.waitForTimeout(5000);
                  // 检查是否有回复的按钮
                  let replyButtons = await secondPage.$$('div[data-testid="reply"]');
                  console.log("replyButtons----",replyButtons.length);
                  await secondPage.waitForTimeout(10000);


                  if (messageButton) {
                    // 点击发送短信按钮
                    await messageButton.click();
                    await secondPage.waitForTimeout(10000);
                    let closeButton = await secondPage.$('div[aria-label="Close"]');
                    if(closeButton){
                      await closeButton.click();
                    }

                    // 检查是否有发送短信的按钮
                    let sendButton = await secondPage.$('aside[aria-label="Start a new message"] div[aria-label="Send"]');

                    
                    if (sendButton) {
                      console.log('sending-----3');
                      // 点击消息文本框，将焦点移到上面
                      await secondPage.click('div[class="DraftEditor-root"]');
                      await secondPage.keyboard.type(account.sendMessage, { delay: 100 });
                      await sendButton.click();
                      sendArr.push(sendNameN);
                      let senderStr = sendArr.join(',');
                      connection.query("update sendLog set `senders` = '"+senderStr+"'  where username='"+account.name+"'  and  twitterAddress ='"+account.twitterAddress+"'", function(errorSS, resultsSS, fieldsSS){
                      });
                    }
                  

                }else if(replyButtons.length>0){

                  await replyButtons[0].click();

                  await secondPage.waitForTimeout(10000);

                  let tweetTextarea = await secondPage.$('div[data-testid="tweetTextarea_0"]');

                  if(tweetTextarea){

                      await secondPage.type('div[data-testid="tweetTextarea_0"]', account.sendMessage, { delay: 100 });

                      // 提交回复
                      await secondPage.click('div[data-testid="tweetButton"]');

                      await secondPage.waitForTimeout(5000);

                      sendArr.push(sendNameN);
                      let senderStr = sendArr.join(',');

                      connection.query("update sendLog set `senders` = '"+senderStr+"'  where username='"+account.name+"'  and  twitterAddress ='"+account.twitterAddress+"'", function(errorSS, resultsSS, fieldsSS){
                      });
                  }

                 

                }
                await secondPage.waitForTimeout(10000);
                await secondPage.close();

                await page.waitForTimeout(10000);
              }

              }

              await page.evaluate(() => {
                window.scrollTo(0, document.documentElement.scrollHeight);
              });
          
              await page.waitForTimeout(2000);
          
              previousHeightF = currentHeightF;
              currentHeightF = await page.evaluate(() => {
                return document.documentElement.scrollHeight;
              });
            }
            
          }
          await page.waitForTimeout(2000);

          connection.query('update account set twitterAddress = ""  where name="'+account.name+'"', function(errorO, resultsO, fieldsO){
          });

          await browser.close();
        })
      }
     

    }

    if(account.followkeyword){

      await page.goto(`https://twitter.com/search?q=${account.followkeyword}&src=typed_query&f=live`);

      // 等待一段时间，确保页面有足够的时间进行滚动
      await page.waitForTimeout(2000);

      let previousHeight = await page.evaluate(() => {
        return document.documentElement.scrollHeight;
      });
    
      let currentHeight = 0;

      let folloUser = [];
    
      while (previousHeight !== currentHeight) {
        await page.evaluate(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
        });
    
        await page.waitForTimeout(2000);
    
        previousHeight = currentHeight;
        currentHeight = await page.evaluate(() => {
          return document.documentElement.scrollHeight;
        });

        const userList = await page.$$('div[class="css-1dbjc4n r-18u37iz r-1wbh5a2 r-13hce6t"] a[class="css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-1wbh5a2 r-dnmrzs r-1ny4l3l"]');
        console.log("userList---",userList.length);

        if(userList.length>0){

          for (let i = 0; i < userList.length ; i++) {

            await userList[i].click();

            await page.waitForTimeout(2000);
            
            const commenterName = await page.$eval('div[data-testid="UserName"] div[class="css-1dbjc4n r-1awozwy r-18u37iz r-1wbh5a2"] span', el => el.textContent);

            // console.log("commenterName---",commenterName);
            if(!folloUser.includes(commenterName)){

              // // 检查是否已关注用户
              // const isFollowing = await page.evaluate(() => {
              //   return document.querySelector('.follow-button').textContent === 'Following';
              // });

              const folloStr = await page.$eval('div[data-testid="placementTracking"] div[class="css-1dbjc4n r-6gpygo"] span', el => el.textContent);

              console.log("commenterName---followStr",commenterName,folloStr);
              
              if (folloStr=='Follow') {
                // const followButton = await page.$eval('div[data-testid="placementTracking"] div[role="button"]');

                // await followButton.click();

                await page.evaluate(() => {
                  const followButton = document.querySelector('div[data-testid="placementTracking"] div[role="button"]');
                  if (followButton) {
                    followButton.click();
                  }
                });
              } else {
                console.log('已关注用户');
              }
              
              folloUser.push(folloUser)


              // 返回上一页
              await page.goBack();
            }
          }
        }
      }
      connection.query('update account set `followkeyword` = ""  where name="'+account.name+'"', function(error, results, fields){
              
      });
    }
  //   await browser.close();
  // }
  

  let currentHeightX = 0;

  // await page.goto(`https://twitter.com/explore`);

  

  let previousHeightX = 0;
  // await page.evaluate(() => {
  //   return document.documentElement.scrollHeight;
  // });
  let sxsx= false;
  while (sxsx) {
    let randomTime= Math.floor(4000+Math.random()*2000);
    if(previousHeightX !== currentHeightX){
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
  
      await page.waitForTimeout(randomTime);
  
      previousHeightX = currentHeightX;
      currentHeightX = await page.evaluate(() => {
        return document.documentElement.scrollHeight;
      });
    }else{
      let type = Math.floor( Math.random()*5);

      if(type==0){
        await page.goto(`https://twitter.com/explore`);
      }else if(type==1){
        await page.goto(`https://twitter.com/explore/tabs/news_unified`);
        await page.waitForTimeout(randomTime);
        const newList = await page.$$('div[class="css-1dbjc4n"] div[data-testid="cellInnerDiv"] div[data-testid="trend"]');
        if(newList.length>0){
          let randomNew = Math.floor(Math.random() * newList.length);
          await newList[randomNew].click();
          await page.waitForTimeout(randomTime);
          currentHeightX = 0;
          previousHeightX = await page.evaluate(() => {
            return document.documentElement.scrollHeight;
          });
        }
      }else if(type==2){
        await page.goto(`https://twitter.com/explore/tabs/trending`);
        await page.waitForTimeout(randomTime);

        const newList = await page.$$('div[class="css-1dbjc4n"] div[data-testid="cellInnerDiv"] div[data-testid="trend"]');
        if(newList.length>0){
          let randomNew = Math.floor(Math.random() * newList.length);
          await newList[randomNew].click();
          await page.waitForTimeout(randomTime);
          currentHeightX = 0;
          previousHeightX = await page.evaluate(() => {
            return document.documentElement.scrollHeight;
          });
        }
      }else if(type==3){
        await page.goto(`https://twitter.com/explore/tabs/sports_unified`);
        await page.waitForTimeout(randomTime);

        const newList = await page.$$('div[class="css-1dbjc4n"] div[data-testid="cellInnerDiv"] div[data-testid="trend"]');
        if(newList.length>0){
          let randomNew = Math.floor(Math.random() * newList.length);
          await newList[randomNew].click();
          await page.waitForTimeout(randomTime);
          currentHeightX = 0;
          previousHeightX = await page.evaluate(() => {
            return document.documentElement.scrollHeight;
          });
        }
      }else if(type==4){
        await page.goto(`https://twitter.com/explore/tabs/entertainment_unified`);
        await page.waitForTimeout(randomTime);

        const newList = await page.$$('div[class="css-1dbjc4n"] div[data-testid="cellInnerDiv"] div[data-testid="trend"]');
        if(newList.length>0){
          let randomNew = Math.floor(Math.random() * newList.length);
          await newList[randomNew].click();
          await page.waitForTimeout(randomTime);
          currentHeightX = 0;
          previousHeightX = await page.evaluate(() => {
            return document.documentElement.scrollHeight;
          });
        }
      }else{
        await page.goto(`https://twitter.com/explore/tabs/for-you`);
        await page.waitForTimeout(randomTime);

        const newList = await page.$$('div[class="css-1dbjc4n"] div[data-testid="cellInnerDiv"] div[data-testid="trend"]');
        if(newList.length>0){
          let randomNew = Math.floor(Math.random() * newList.length);
          await newList[randomNew].click();
          await page.waitForTimeout(randomTime);
          currentHeightX = 0;
          previousHeightX = await page.evaluate(() => {
            return document.documentElement.scrollHeight;
          });
        }
      }
    }
    await page.waitForTimeout(30000);
  }

  // Base64 编码
  function encodeCookieToBase64(cookie) {
    const jsonCookie = JSON.stringify(cookie);
    return Buffer.from(jsonCookie).toString('base64');
  }

  // Base64 解码
  function decodeBase64ToCookie(base64) {
    const jsonCookie = Buffer.from(base64, 'base64').toString();
    return JSON.parse(jsonCookie);
  }

}



