## ABI接口<br>
### 充值
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio deposit '["user11111111","100000.0000 EOS"]' -p user11111111

actions: [{
      account: 'eosio',
      name: 'deposit',
      authorization: [{
        actor: 'user11111111',
        permission: 'active',
      }],
      data: {
        owner: 'useraaaaaaaa',
        amount: '100000.0000 EOS',
      },
    }]

### 提现
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio withdraw '["user22222222","50000.0000 EOS"]' -p user22222222

actions: [{
      account: 'eosio',
      name: 'withdraw',
      authorization: [{
        actor: 'user22222222',
        permission: 'active',
      }],
      data: {
        owner: 'user22222222',
        amount: '50000.0000 EOS',
      },
    }]

### 购买REX
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio buyrex '["user11111111","50000.0000 EOS"]' -p user11111111

actions: [{
      account: 'eosio',
      name: 'buyrex',
      authorization: [{
        actor: 'user11111111',
        permission: 'active',
      }],
      data: {
        owner: 'user11111111',
        amount: '50000.0000 EOS',
      },
    }]

### 使用抵押资源购买REX
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio unstaketorex '["user22222222","user22222222","50.0000 EOS","50.0000 EOS"]' -p user22222222

actions: [{
      account: 'eosio',
      name: 'unstaketorex',
      authorization: [{
        actor: 'user22222222',
        permission: 'active',
      }],
      data: {
        owner: 'user22222222',
        receiver: 'user22222222',
	from_net: '50.0000 EOS',
	from_cpu: '50.0000 EOS',
      },
    }]


### 卖出REX
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio sellrex '["user11111111","500000000.0000 REX"]' -p user11111111

actions: [{
      account: 'eosio',
      name: 'sellrex',
      authorization: [{
        actor: 'user11111111',
        permission: 'active',
      }],
      data: {
        from: 'user11111111',
        rex: '500000000.0000 REX',
      },
    }]

### 取消订单
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio cnclrexorder '["user11111111"]' -p user11111111

actions: [{
      account: 'eosio',
      name: 'cnclrexorder',
      authorization: [{
        actor: 'user11111111',
        permission: 'active',
      }],
      data: {
        owner: 'user11111111',
      },
    }]


### 租赁CPU
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio rentcpu '["user22222222","user22222222","20.0000 EOS","0.0000 EOS"]' -p user22222222

actions: [{
      account: 'eosio',
      name: 'rentcpu',
      authorization: [{
        actor: 'user22222222',
        permission: 'active',
      }],
      data: {
        from: 'user22222222',
	receiver: 'user22222222',
        loan_payment: '20.0000 EOS',
	loan_fund: '0.0000 EOS',
      },
    }]

### 租赁NET
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio rentnet '["user22222222","user22222222","20.0000 EOS","0.0000 EOS"]' -p user22222222

actions: [{
      account: 'eosio',
      name: 'rentnet',
      authorization: [{
        actor: 'user22222222',
        permission: 'active',
      }],
      data: {
        from: 'user22222222',
	receiver: 'user22222222',
        loan_payment: '20.0000 EOS',
	loan_fund: '0.0000 EOS',
      },
    }]

### 存CPU贷款基金
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio fundcpuloan '["user22222222", "1", "20.0000 EOS"]' -p user22222222

actions: [{
      account: 'eosio',
      name: 'fundcpuloan',
      authorization: [{
        actor: 'user22222222',
        permission: 'active',
      }],
      data: {
        from: 'user22222222',
	loan_num: '1',
        amount: '20.0000 EOS',
      },
    }]
### 存NET贷款基金
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio fundnetloan '["user22222222", "1", "20.0000 EOS"]' -p user22222222

actions: [{
      account: 'eosio',
      name: 'fundnetloan',
      authorization: [{
        actor: 'user22222222',
        permission: 'active',
      }],
      data: {
        from: 'user22222222',
	loan_num: '1',
        amount: '20.0000 EOS',
      },
    }]

### 取回CPU贷款基金
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio defcpuloan '["user22222222", "1", "20.0000 EOS"]' -p user22222222

actions: [{
      account: 'eosio',
      name: 'defcpuloan',
      authorization: [{
        actor: 'user22222222',
        permission: 'active',
      }],
      data: {
        from: 'user22222222',
	loan_num: '1',
        amount: '20.0000 EOS',
      },
    }]
### 取回NET贷款基金
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 push action eosio defnetloan '["user22222222", "1", "20.0000 EOS"]' -p user22222222

actions: [{
      account: 'eosio',
      name: 'defnetloan',
      authorization: [{
        actor: 'user22222222',
        permission: 'active',
      }],
      data: {
        from: 'user22222222',
	loan_num: '1',
        amount: '20.0000 EOS',
      },
    }]



### 查看节点:
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 system listproducers

### 投票
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 system  voteproducer prods user11111111 producer1111 producer1114 producer111f producer111h producer111p producer111w producer111b producer111c producer111d producer111e producer111g producer111j producer111k producer111l producer111q producer111r producer111z producer1113 producer111u producer111v producer111i

actions: [{
      account: 'eosio',
      name: 'voteproducer',
      authorization: [{
        actor: 'user11111111',
        permission: 'active',
      }],
      data: {
        voter: 'user11111111',
	proxy: '',
        producers: [
              "producer1111",
              "producer1114",
              "producer111f"
            ]
      },
    }]


### 查看投票结果
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 get table eosio eosio voters -L user11111111 -l 1

### 购买REX: 价格: [total_rex*(total_lendable+amount)/total_lendable - total_rex] / amount
### 租赁CPU: 价格:  [total_unlent*amount / (total_rent + amount)]/ amount
cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 get table eosio eosio rexpool
{
  "rows": [{
      "version": 0,
      "total_lent": "0.0149 EOS",		已租出的EOS总量
      "total_unlent": "300.9851 EOS",		可出租的EOS总量
      "total_rent": "20001.0000 EOS",		总的租金=20000.0000(初始值) + 1.0000(实际)
      "total_lendable": "301.0000 EOS",		总的EOS量=total_lent+total_unlent
      "total_rex": "3000000.0000 REX",		REX总量
      "namebid_proceeds": "0.0000 EOS",
      "loan_num": 1
    }
  ],
  "more": false
}


cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 get table eosio eosio rexfund -l 1 -L user11111111
{
  "rows": [{
      "version": 0,
      "owner": "user11111111",
      "balance": "400.0000 EOS"			充值但未花费的EOS量
    }
  ],
  "more": true
}


cleos  --wallet-url http://localhost:6666 --url http://localhost:8000 get table eosio eosio rexbal -l 1 -L user11111111 
{
  "rows": [{
      "version": 0,
      "owner": "user11111111",
      "vote_stake": "200.0000 EOS",		已花费的EOS量
      "rex_balance": "2000000.0000 REX",	用户REX持有量
      "matured_rex": 0,
      "rex_maturities": [{
          "first": "2019-03-31T00:00:00",	解冻时间
          "second": "20000000000"
        }
      ]
    }
  ],
  "more": true
}







