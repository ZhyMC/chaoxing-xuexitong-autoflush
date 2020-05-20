var sleep=(t)=>new Promise((y)=>setTimeout(y,t));
var CourseList=require("./courselist.js");
let Table=require("tty-table");
let prompt=require("prompts");
let {LiveContainer,LiveArea}=require("clui-live");

class CoursePicker{
	constructor(user){
		this.user=user;
		this.list=[];
		this.pickinfos={};

		this.gui=new LiveContainer();
		this.gui_area=this.gui.createLiveArea();

	}
	async getAllCourses(){
		this.list=await new CourseList(this.user).getList();
	}
	toggle(clazzid){
		if(!this.pickinfos[clazzid])
			this.pickinfos[clazzid]={picked:true};

		this.pickinfos[clazzid].picked=!this.pickinfos[clazzid].picked;
	}
	printCoursesGUI(){

		let gui="";
		let header=[{value:"序号"},{value:"课程ID"},{value:"标题"},{value:"选中",color:"red",width:10,
			formatter:function(val){
				if(val=="是")
					return this.style(val,"green","bold");
				else
					return this.style(val,"red");
			}
		}];

		let built=[];
		for(let i in this.list){
			let info=this.pickinfos[this.list[i].clazzId] || {picked:true};
			built.push([i,this.list[i].courseId,this.list[i].title,info.picked?"是":"否"]);
		}
		let tb=new Table(header,built).render();

		gui+=tb+"\n\n";
		gui+="请选择你要切换选中的课程序号,不填则直接开始刷课:\n"

		this.gui_area.write(gui);
		//console.log(gui);

	}
	async input(){
		return (await prompt({type:"text",name:"input",message:""}));
	}
	async pick(config){
		await this.getAllCourses();

		while(!config.pick && true){
			this.printCoursesGUI();

			let chosen=await this.input();
			if(!chosen.input || chosen.input.length<=0)
				break;
			if(!this.list[chosen.input])
				break;

			this.toggle(this.list[chosen.input].clazzId);

			await sleep(200);
		}

		if(config.pick) {
			if( config.pickinfos ) {
				this.pickinfos  = config.pickinfos;

				let header=[{value:"序号"},{value:"课程ID"},{value:"标题"},{value:"选中",color:"red",width:10,
					formatter:function(val){
						if(val=="是")
							return this.style(val,"green","bold");
						else
							return this.style(val,"red");
					}
				}];

				let built=[];
				for(let i in this.list){
					let info=this.pickinfos[this.list[i].clazzId] || {picked:true};
					built.push([i,this.list[i].courseId,this.list[i].title,info.picked?"是":"否"]);
				}
				let tb=new Table(header,built).render();
				this.gui_area.write(tb);
				await sleep(1000);
			} else {
				const pickinfos = {};
				for(const i of this.list) {
					pickinfos[i.clazzId] = {
						picked: true,
						title: i.title,
					}
				}
				config.pickinfos = pickinfos;
				await config.write();
				console.log("课程获取完毕请调成config.json并重启该程序");
				process.exit(0);
			}
		}


		let picks=[];
		for(let i in this.list){
			let info=this.pickinfos[this.list[i].clazzId] || {picked:true};
			if(info.picked)picks.push(this.list[i]);
		}
		return picks;
	}

}



module.exports=CoursePicker;
