var url=require("url");
var qs=require("querystring");

var {Cookie,Store,CookieJar}=require("tough-cookie");

var fetch=require("node-fetch");
class Net{
	constructor(host){
		let parsed=url.parse(host);
		this.base=parsed;
		this.jar=new CookieJar();
	
	}
	setCookie(str){
		return new Promise((y)=>{
			this.jar.store.putCookie(str,y);	
		})
	}
	
	getCookies(){
		return new Promise((y)=>{
			return this.jar.store.getAllCookies((err,data)=>y(data[0]));
		})
	}
	async get(page,query,savecookie){
		if(!query)query={};
		let obj=Object.assign(this.base,{
			pathname:page,
			query
		});

		let res=await fetch(url.format(obj),{
			headers:{
				"Cookie":await this.getCookies(),
				"User-Agent":Net.UserAgent
			}
		});
		if(savecookie && res.headers.has("set-cookie"))
		await this.setCookie(res.headers.get("set-cookie"));

		return res.text();
	}
	async getJSON(page,query){
		return JSON.parse(await this.get(page,query));
	}
	async rawGet(page,savecookie){
		let res=await fetch(this.base.href+page,{
			headers:{
				"Cookie":await this.getCookies(),
				"User-Agent":Net.UserAgent
			}
		});
		if(savecookie)
			if(res.headers.has("set-cookie"))
			await this.setCookie(res.headers.get("set-cookie"));

		return res.text();
	}
	async getBin(page,savecookie){
		let res=await fetch(this.base.href+page,{
			headers:{
				"Cookie":await this.getCookies(),
				"User-Agent":Net.UserAgent
			}
		});
		if(savecookie)
			if(res.headers.has("set-cookie"))
			await this.setCookie(res.headers.get("set-cookie"));

		return res.buffer();

	}
	async post(page,query,savecookie){
		if(!query)query={};

		let params = new URLSearchParams();
		for(let i in query)
			params.append(i,query[i]);

		let res=await fetch(this.base.href+page,{
			method:"POST",
			headers:{
				"Content-Type": "application/x-www-form-urlencoded",
				"Cookie":await this.getCookies(),
				"User-Agent":Net.UserAgent,
			},
			redirect: "manual",
			body:params
		});


		//console.log(await res.text(),res.headers);

		if(savecookie)
			if(res.headers.has("set-cookie"))
			await this.setCookie(res.headers.get("set-cookie"));

		return res.text();
	}
}
Net.parseCookies=function(cookies){
	let arr=cookies.split("; ");
	let obj={};
	for(let i in arr){
		let item=arr[i].split("=");
		obj[item[0]]=item[1];
	}
	return obj;
}
Net.UserAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36";

module.exports=Net;

//let net=new Net("http://www.baidu.com/");

//net.get("/").then(console.log);
