const fs = require("fs");

class Config {
	constructor(path) {
		this.path = path;
		this.uname;
		this.password;
		this.speed;
		this.pick;
		this.test;
		this.pickinfos;
	}

	async write() {
		const c = {
			"uname": this.uname,
			"password": this.password,
			"speed": this.speed,
			"test": this.test,
			"pick": this.pick,
			"pickinfos": this.pickinfos
		}

		const config = JSON.stringify(c, null,"\t")
		return await fs.promises.writeFile(this.path,config,{
			encoding: "utf8"
		})
	}

	async read(path) {
		return await fs.promises.readFile(this.path,{
				encoding: "utf8"
		}).then(c=>{
			try {
				const config = JSON.parse(c);
				for(const key in config)
					this[key] = config[key]
				return this;
			} catch(e) {
				console.error(e);
				process.exit(0);
			}
		}).catch(e=>{
			console.error(e);
			return this;
		})
	}
}

module.exports = Config;
