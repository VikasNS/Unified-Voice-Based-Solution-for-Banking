/* eslint-disable */
const {
    dialogflow,
    BasicCard,
    BrowseCarousel,
    BrowseCarouselItem,
    Button,
    Permission,
    Carousel,
    Image,
    LinkOutSuggestion,
    List,
    MediaObject,
    Suggestions,
    SimpleResponse,
    Table
} = require('actions-on-google');
var admin = require('firebase-admin');
const app = dialogflow({debug: true});
const functions = require('firebase-functions');
const helper = require('./helper.js')

app.intent('Default Welcome Intent',(conv) => {
	conv.ask("वेलकम बैक विकास, मैं आपकी कैसे मदद कर सकता हूं?"); 
	conv.ask(new Suggestions(["बैंक बैलेंस","लेनदेन","बिजली का बिल","धन हस्तांतरण","मोबाइल रिचार्ज"]));
});

app.intent('धन हस्तांतरण',(conv,{To,Amount,Confirmation,OTP}) => {
	var gotTo = To.length > 0;
	var gotConfirmation = Confirmation.length > 0;
	var gotOTP = OTP.length > 0;
	var gotAmount = Amount.length > 0;
	
	if(!gotTo && !gotAmount && !gotConfirmation && !gotOTP) {
		conv.ask("आप किसका पैसा ट्रांसफर करना चाहते हैं?");
	}else if(gotTo && !gotAmount && !gotConfirmation && !gotOTP) {
		conv.ask("आप कितना ट्रैफ़िक करना चाहते हैं?")
	}else if(gotTo && gotAmount && !gotConfirmation && !gotOTP) {
		conv.ask("कृपया पुष्टि करें");
		conv.ask(new Suggestions(["हाँ","नहीं"]));
	}else if(gotTo && gotAmount && gotConfirmation && !gotOTP) {
		if(Confirmation == "yes") {
            conv.ask("कृपया एसएमएस में भेजे गए ओटीपी को दर्ज करें");
        }else {
            conv.close("ज़रूर, आपकी ट्रांसफर रद्द  हुई है।");
        }
		
	}else if(gotTo && gotAmount && gotConfirmation && gotOTP) {
		return helper.transferFunds(121,123,parseInt(Amount)).then((s)=>{
			conv.ask("थैंक्यू, आपका मनी ट्रांसफर सफल है");
			return conv.ask(new Suggestions(["बैंक बैलेंस","लेनदेन","बिजली का बिल","धन हस्तांतरण","मोबाइल रिचार्ज"]));
		});
		
	}
});

app.intent('Transfer Money',(conv,{To,Amount,Confirmation,OTP}) => {
	var gotTo = To.length > 0;
	var gotConfirmation = Confirmation.length > 0;
	var gotOTP = OTP.length > 0;
	var gotAmount = Amount.length > 0;
	
	if(!gotTo && !gotAmount && !gotConfirmation && !gotOTP) {
		conv.ask("To Whom do you want to send the money?");
	} else if(gotTo && !gotAmount && !gotConfirmation && !gotOTP) {
		conv.ask("What is the amout do you want to send?")
	}else if(gotTo && gotAmount && !gotConfirmation && !gotOTP) {
		conv.ask("Please confirm?ं");
		conv.ask(new Suggestions(["yes","no"]));
	}else if(gotTo && gotAmount && gotConfirmation && !gotOTP) {
		if(Confirmation == "yes") {
            conv.ask("Please enter the OTP sent in SMS");
        }else {
            conv.close("Something went wrong");
        }
		
	}else if(gotTo && gotAmount && gotConfirmation && gotOTP) {
		return helper.transferFunds(121,123,parseInt(Amount)).then((s)=>{
			return conv.ask("Your Money Transfer is successfull.");
			//return conv.ask(new Suggestions(["बैंक बैलेंस","लेनदेन","बिजली का बिल","धन हस्तांतरण","मोबाइल रिचार्ज"]));
		});
	
	}
});





app.intent('पानी का बिल',(conv,{OTP,Confirmation}) => {
	conv.ask("पानी का बिल");
});

app.intent('बिजली का बिल',(conv,{Confirmation,OTP}) => {
	var gotConfirmation = Confirmation.length > 0;
	var gotOTP = OTP.length > 0;
	
	if(!gotConfirmation && !gotOTP) {
		conv.ask("विकास, यहां आपका नवीनतम बिल भुगतान है। कृपया भुगतान की पुष्टि करें।");
		conv.ask(new BasicCard({
			  text: "FEB", 
			  subtitle: 'BESCON',
			  title: '432 RS',
			  image: new Image({
				url: 'https://pbs.twimg.com/profile_images/716947162655920128/ZYw_ISkd_400x400.jpg',
				alt: 'Image alternate text',
			  }),
			  display: 'CROPPED',
			}));
		conv.ask(new Suggestions(["हाँ","नहीं"]));
	} else if(gotConfirmation && !gotOTP) {
		if(Confirmation == "yes") {
            conv.ask("कृपया एसएमएस में भेजे गए ओटीपी को दर्ज करें");
        }else {
            conv.close("ज़रूर, आपकी ट्रांसफर रद्द  हुई है।");
        }
	} else if(gotConfirmation && gotOTP) {
		return helper.payElectricBill("BS123123",121).then(()=>{
			conv.ask("थआपके बिजली बिल का भुगतान कर दिया गया है");
			return conv.ask(new Suggestions(["बैंक बैलेंस","लेनदेन","बिजली का बिल","धन हस्तांतरण","मोबाइल रिचार्ज"]));
		});
	}
	
	
});

app.intent("Pay Electricity Bill",(conv,{Confirmation,OTP}) => {
	var gotConfirmation = Confirmation.length > 0;
	var gotOTP = OTP.length > 0;
	
	if(!gotConfirmation && !gotOTP) {
		conv.ask("Here is the details of the recent electricity Bill, Please confirm Payment.");
		conv.ask(new BasicCard({
			  text: "FEB", 
			  subtitle: 'BESCON',
			  title: '432 RS',
			  image: new Image({
				url: 'https://pbs.twimg.com/profile_images/716947162655920128/ZYw_ISkd_400x400.jpg',
				alt: 'Image alternate text',
			  }),
			  display: 'CROPPED',
			}));
		conv.ask(new Suggestions(["yes","no"]));
	} else if(gotConfirmation && !gotOTP) {
		if(Confirmation == "yes") {
            conv.ask("Please enter the OTP sent in SMS");
        }else {
            conv.close("Something went wrong");
        }
	} else if(gotConfirmation && gotOTP) {
		return helper.payElectricBill("BS123123",121).then(()=>{
			return conv.ask("Your Electricity payment was successfull");
			//return conv.ask(new Suggestions(["बैंक बैलेंस","लेनदेन","बिजली का बिल","धन हस्तांतरण","मोबाइल रिचार्ज"]));
		});
	}
	
	
});



app.intent('बैंक बैलेंस',(conv) => {
	return helper.getAccountBalance(121).then((balance)=>{
		conv.ask('विकास, यहां आपके बैंक बैलेंस विवरण हैं.');
		conv.ask(new BasicCard({
    			  text: "", 
    			  subtitle: "बचत खाता",
    			  title: balance.toString()+ " रुपये",
    			  image: new Image({
    				url: "https://scontent.fblr8-1.fna.fbcdn.net/v/t1.0-9/12494979_1512830899022716_2077678330596252032_n.jpg?_nc_cat=104&_nc_oc=AQkwYcFbUHFwhfOmK3EO-5q0XhOey8nVQwWTwqz4GjClRMC6pu0gU7cnj5pVsSHxiZg&_nc_ht=scontent.fblr8-1.fna&oh=e30462d3c98edf81c877c7cc9e89f65a&oe=5DD357C5",
    				alt: 'Image alternate text',
    			  }),
    			  display: 'CROPPED',
			}));
		return conv.ask("और कुछ, विकास?");
	},()=>{console.log("कुछ गलत हो गया")});
	
});

app.intent("Bank Balance",(conv) => {
	return helper.getAccountBalance(121).then((balance)=>{
		conv.ask("Vikas, Here is your Bank Balance Details.");
		conv.ask(new BasicCard({
    			  text: "", 
    			  subtitle: "Savings Account",
    			  title: balance.toString()+ "Rupee",
    			  image: new Image({
    				url: "https://scontent.fblr8-1.fna.fbcdn.net/v/t1.0-9/12494979_1512830899022716_2077678330596252032_n.jpg?_nc_cat=104&_nc_oc=AQkwYcFbUHFwhfOmK3EO-5q0XhOey8nVQwWTwqz4GjClRMC6pu0gU7cnj5pVsSHxiZg&_nc_ht=scontent.fblr8-1.fna&oh=e30462d3c98edf81c877c7cc9e89f65a&oe=5DD357C5",
    				alt: 'Image alternate text',
    			  }),
    			  display: 'CROPPED',
			}));
		return conv.ask("Anything else Vikas?");
	},()=>{console.log("Something went wrong. Please Try again.")});
	
});




app.intent('मोबाइल रिचार्ज',(conv,{Plan,Confirmation,OTP}) => {
	gotPlan = Plan.length > 0;
	gotConfirmation = Confirmation.length > 0;
	gotOTP = OTP.length > 0;
	
	if(!gotPlan && !gotConfirmation && !gotOTP) {
		conv.ask("कृपया योजना का चयन करें।");
		conv.ask(new BrowseCarousel({
			items: [
			  new BrowseCarouselItem({
				title: 'रुपये 399',
				url: 'https://google.com',
				description: 'अनलिमिटेड कॉलिंग और 84 दिनों के लिए 1 जीबी / दिन',
				image: new Image({
				  url: 'https://s3-ap-southeast-1.amazonaws.com/bsy/iportal/images/airtel-logo-white-text-vertical.jpg',
				  alt: 'Image alternate text',
				}),
				footer: '',
			  }),
			  new BrowseCarouselItem({
				title: 'रुपये 299',
				url: 'https://google.com',
				description: '28 दिनों के लिए अनलिमिटेड कॉलिंग और 3 जीबी / दिन',
				image: new Image({
				  url: 'https://s3-ap-southeast-1.amazonaws.com/bsy/iportal/images/airtel-logo-white-text-vertical.jpg',
				  alt: 'Image alternate text',
				}),
				footer: '',
			  }),
			],
		  }));
		conv.ask(new Suggestions(["योजना_399","योजना_299"]));
	} else if(gotPlan && !gotConfirmation && !gotOTP) {
		if(Plan == "योजना_399" ) {
			conv.ask("कृपया पुष्टि करें, योजना_399");
		} else {
			conv.ask("कृपया पुष्टि करें, योजना_299");
		}
		conv.ask(new Suggestions(["हाँ","नहीं"]));
	} else if(gotPlan && gotConfirmation && !gotOTP) {
		if(Confirmation == "yes") {
            conv.ask("कृपया एसएमएस में भेजे गए ओटीपी को दर्ज करें");
        }else {
            conv.close("ज़रूर, आपकी ट्रांसफर रद्द  हुई है।");
        }
	} else if(gotPlan && gotConfirmation && gotOTP) {
		var amt;
		if(Plan == "योजना_399" ) {
			amt = 399
		} else {
			amt = 299 ;
		}
		return helper.rechargeMobile("+918867474172",121,amt).then(()=>{
			conv.ask("आपका मोबाइल रिचार्ज सफल है");
			return conv.ask(new Suggestions(["बैंक बैलेंस","लेनदेन","बिजली का बिल","धन हस्तांतरण","मोबाइल रिचार्ज"]));
		});
		
		
	}
	
});


app.intent('Recharge Mobile',(conv,{Plan,Confirmation,OTP}) => {
	gotPlan = Plan.length > 0;
	gotConfirmation = Confirmation.length > 0;
	gotOTP = OTP.length > 0;
	
	if(!gotPlan && !gotConfirmation && !gotOTP) {
		conv.ask("Please select the plan Vikas.");
		conv.ask(new BrowseCarousel({
			items: [
			  new BrowseCarouselItem({
				title: 'RS 399',
				url: 'https://google.com',
				description: 'Unlimited Calling and 1 GB/Day for 84 days',
				image: new Image({
				  url: 'https://s3-ap-southeast-1.amazonaws.com/bsy/iportal/images/airtel-logo-white-text-vertical.jpg',
				  alt: 'Image alternate text',
				}),
				footer: '',
			  }),
			  new BrowseCarouselItem({
				title: 'RS 299',
				url: 'https://google.com',
				description: 'Unlimited Calling and 3 GB/Day for 28 days',
				image: new Image({
				  url: 'https://s3-ap-southeast-1.amazonaws.com/bsy/iportal/images/airtel-logo-white-text-vertical.jpg',
				  alt: 'Image alternate text',
				}),
				footer: '',
			  }),
			],
		  }));
		conv.ask(new Suggestions(["PLAN_399","PLAN_299"]));
	} else if(gotPlan && !gotConfirmation && !gotOTP) {
		if(Plan == "PLAN_399" ) {
			conv.ask("Please Confirm, Plan 399");
		} else {
			conv.ask("Please Confirm, Plan 299");
		}
		conv.ask(new Suggestions(["yes","no"]));
	} else if(gotPlan && gotConfirmation && !gotOTP) {
		if(Confirmation == "yes") {
            conv.ask("Please enter the OTP sent in SMS");
        }else {
            conv.close("Something went wrong");
        }
	} else if(gotPlan && gotConfirmation && gotOTP) {
		var amt;
		if(Plan == "PLAN_399" ) {
			amt = 399
		} else {
			amt = 299 ;
		}
		return helper.rechargeMobile("+918867474172",121,amt).then(()=>{
			return conv.ask("Your recharge is successfull");
			 //conv.ask(new Suggestions(["बैंक बैलेंस","लेनदेन","बिजली का बिल","धन हस्तांतरण","मोबाइल रिचार्ज"]));
		});
		
		
	}
	
});


app.intent('लेनदेन',(conv) => {
	conv.ask("विकास, यहां आपके अंतिम 3 लेनदेन विवरण हैं");
	arr = []
	return helper.getListOfTransactions(121).then(transactions=>{
		transactions.forEach(function(child){arr.push([new Date(child.val().date).toString().substr(8,17),child.val().amt,child.val().rem_balance]);});
		return new Promise((resolve,reject)=>{resolve(arr)});
	}).then((arr)=>{
		conv.ask(new Table({
		  dividers: true,
		  columns: ['दिनांक', 'कटौती', 'संतुलन'],
		  rows: arr,
		}));
		return conv.ask("और कुछ, विकास?");
		
	});
	
	
});

app.intent('Last 3 transactions',(conv) => {
	conv.ask("Vikas, Here are the details of your last 3 transactions");
	arr = []
	return helper.getListOfTransactions(121).then(transactions=>{
		transactions.forEach(function(child){arr.push([new Date(child.val().date).toString().substr(8,17),child.val().amt,child.val().rem_balance]);});
		return new Promise((resolve,reject)=>{resolve(arr)});
	}).then((arr)=>{
		conv.ask(new Table({
		  dividers: true,
		  columns: ['Date', 'Deduction', 'Balance'],
		  rows: arr,
		}));
		return conv.ask("Anything else Vikas?");
		
	});
	
	
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

	
	
	
	