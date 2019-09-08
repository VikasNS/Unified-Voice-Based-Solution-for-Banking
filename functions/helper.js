const firebase = require('firebase');
const request = require('request');

firebase.initializeApp({
    serviceAccount: './service_config.json',
    databaseURL: 'https://amex-hack.firebaseio.com/',
});
/* eslint-disable */
const database = firebase.database().ref('/user');

// Get Account Balance
exports.getAccountBalance = async (accNo) => {
    return new Promise((resolve, reject) => {
        return database.once('value')
            .then((snap) => {
                if (accNo !== 0)
                    return resolve(snap.val()[accNo].ac_balance);
                return reject();
            });
    });
};

//list of transactions
exports.getListOfTransactions = async (accNo) => {
    const database_ref = firebase.database().ref('/user/' + accNo + 
        '/transactions');
    return new Promise((resolve,reject) => {
        return database_ref.once('value')
            .then((snap) => {
                if (accNo !== 0)
                    return resolve(snap);
                return reject();
            });
    });
};

// Transfer money from sender to receiver
exports.transferFunds = async (from, to, amt) => {
    const data_ref = firebase.database()
        .ref(`/user/${from}/ac_balance`);
    const trans_ref = firebase.database()
        .ref(`/user/${from}/transactions`);
    const to_data_ref = firebase.database()
        .ref(`/user/${to}/ac_balance`);
    const to_trans_ref = firebase.database()
        .ref(`/user/${to}/transactions`);
        
    return new Promise((resolve, reject) => {
        
        return data_ref.once('value')
        .then((snap) => {
            const bal = snap.val();
            const rem_balance = bal - amt;
            // Update balance of the from account No
            snap.ref.set(rem_balance);
            
            trans_ref.push({
                date: Date.now(),
                amt,
                rem_balance,
                to_ac: to,
            }).then((res, rej) => {
                     to_data_ref.once('value')
                    .then((snap) => {
                        const bal = snap.val();
                        const remBalance = bal + amt;
                        snap.ref.set(remBalance);
                        
                        to_trans_ref.push({
                            date: Date.now(),
                            amt,
                            rem_balance: remBalance,
                            from_ac: from,
                        }).then((reso, reje) => {
                            return resolve('Transaction Done');
                        });
                    });
            })
            .catch((err) => {
                return reject(err);
            });
        });
    });
};

//mobile recharge
exports.rechargeMobile = async (phone_number, acNo, amt) => {
    const data_ref = firebase.database()
        .ref(`/user/${acNo}/ac_balance`);
    const trans_ref = firebase.database()
        .ref(`/user/${acNo}/transactions`);
        
    return data_ref.once('value')
        .then((snap) => {
            const bal = snap.val();
            const rem_balance = bal - amt;
            // Update balance of the from account No
            return snap.ref.set(rem_balance).then(()=>{
				return trans_ref.push({
                date: Date.now(),
                amt,
                rem_balance,
                to_ac: "MOBILE RECHARGE",
            });
			});
            
                
			
            /*
            const jsonValue = {
                "phone_number": phone_number,
                "message": "Hi this is test demo",
            };
            
            request({
                url: 'https://u5qzyunow0.execute-api.us-east-1.amazonaws.com/prod/sms-one',
                method: 'POST',
                json: true,
                body: jsonValue,
                }, (err, res, body) => {
                   if (err)
                        console.log(err);
                });*/
        });
};

//pay electric bill using bank ac
exports.payElectricBill = (id,acNo) =>{
    const dbRef = firebase.database().ref(`bills/electric/${id}`);
    return dbRef.once('value')
        .then((snap) => {
            const amt = 432;
            const data_ref = firebase.database()
            .ref(`/user/${acNo}/ac_balance`);
            const trans_ref = firebase.database()
            .ref(`/user/${acNo}/transactions`);
            
            data_ref.once('value')
            .then((snap) => {
            
            const bal = snap.val();
            const rem_balance = bal - amt;
            // Update balance of the from account No
            return snap.ref.set(rem_balance).then(()=>{
				return trans_ref.push({
                date: Date.now(),
                amt,
                rem_balance,
                to_ac: "ELECTRIC BILL",
            })
			});
            
            
        });
    });
};

