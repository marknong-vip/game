// 第一步 把素材样式关卡的配置
// 第二步 草地的大小、样式
// 第三步 整理思路
//1. 先加载地图（第一关）
//2. 初始化事件
//3. 行走或者推动箱子
//4. 是否全部已经推入指定位置 箱子要在坑的上面

//5. 重玩
//6. 初始化下一关
class PushBox {
    constructor(levels) {
        //地图对象
        this.game_screen = document.getElementById("game-screen");
        this.which_level = document.getElementById("which-level");
        this.last = document.getElementById("last");
        this.next = document.getElementById("next");
        //获取所有的关卡
        this.levels = levels;
        this.level = 0; //初始化默认第一关
        this.player = {
            x: 0,
            y: 0
        }; //初始化的坐标
        this.trap = 0; //坑的数量
        this.curr_map = []; // 当前的关卡的配置
        this.trap_arr = []; // 坑的坐标容器
        this.setArrary();
        this.init(this.curr_map);
        this.init_Event();
    }
    //深拷贝 操作curr_map不会影响原来的 游戏配置数组
    setArrary() {
        this.curr_map = this.levels[this.level].slice();
        for (let i = 0; i < this.levels[this.level].length; i++) {
            this.curr_map[i] = this.levels[this.level][i].slice();
        }
    }
    //初始化事件
    init_Event() {
        let self = this;
        window.onkeydown = function () {
            //兼容事件对象
            let e = event || window.event;
            let direction;
            switch (e.keyCode) {
                case 38:
                    direction = "up";
                    break;
                case 40:
                    direction = "down";
                    break;
                case 37:
                    direction = "left";
                    break;
                case 39:
                    direction = "right";
                    break;
            }
            self.player_move(direction);
        };
    }
    //初始化地图
    init(level) {
        //当行走的时候 要记得清空原来的div对象
        this.game_screen.innerHTML = null;
        this.which_level.innerText = `第${this.level + 1}关`
        //重置坑的个数
        this.trap = 0;
        for (let i in level) {
            for (let j in level[i]) {
                //准备好地板砖
                let div = document.createElement("div");
                switch (level[i][j]) {
                    //铺砖
                    case 1:
                        div.classList.add("wall");
                        break;
                    case 2:
                        div.classList.add("trap");
                        //计算坑的个数
                        this.trap = this.trap + 1;
                        break;
                    case 3:
                        div.classList.add("box");
                        break;
                    case 4:
                        div.classList.add("player");
                        //初始化人的位置
                        this.player.x = Number(j);
                        this.player.y = Number(i);
                        // console.log(this.player);
                        break;
                }
                this.game_screen.appendChild(div);
            }
        }
    }
    //移动
    player_move(direction) {
        //坐标问题 当前的坐标  b_co是箱子未来的坐标 p_co是人的未来坐标
        let p_co, b_co;
        p_co = {};
        b_co = {};
        p_co.x = this.player.x;
        p_co.y = this.player.y;
        b_co.x = this.player.x;
        b_co.y = this.player.y;

        //this.player.x; 是当前的坐标
        // p_co.x  是目标的坐标
        // console.log(p_co);
        switch (direction) {
            case "up":
                p_co.y -= 1;
                b_co.y -= 2;
                break;
            case "down":
                p_co.y += 1;
                b_co.y += 2;
                break;
            case "right":
                p_co.x += 1;
                b_co.x += 2;
                break;
            case "left":
                p_co.x -= 1;
                b_co.x -= 2;
                break;
        }
        //判断是否可以行走
        if (this.checking_go(p_co, b_co)) {
            //刷新地图
            this.init(this.curr_map);
            //记录坑的位置和坐标 有多少个
            this.set_trap(this.levels[this.level]);
            if (this.checking_success()) {
                //console.log("箱子已经全部推入！");
                setTimeout(() => {
                    let state = confirm("恭喜过关！是否进入下一关？");
                    if (state) {
                        this.level = this.level + 1;
                        // console.log(this.level);
                        this.setArrary();
                        // console.log(this.curr_map);
                        this.init(this.curr_map);
                        //因为后面要push每一个坑坐标 每一把的游戏坐标不一样 所以要清空
                        this.trap_arr = [];
                    } else {}
                }, 200);
            }
        }
    }
    //行走 可能有障碍
    checking_go(p_co, b_co) {
        //取到当前游戏配置
        let curr_map = this.curr_map;
        //人物不能离开地图
        if (
            p_co.x < 0 ||
            p_co.y < 0 ||
            p_co.x >= curr_map[0].length ||
            p_co.y >= curr_map.length
        ) {
            return false;
        }
        //前面不能是墙
        if (curr_map[p_co.y][p_co.x] == 1) {
            return false;
        }
        //如果前面是箱子
        if (curr_map[p_co.y][p_co.x] == 3) {
            //箱子前面不是墙 可以移动 是墙或者是箱子就走不动

            if (
                curr_map[b_co.y][b_co.x] == 1 ||
                curr_map[b_co.y][b_co.x] == 3
            ) {
                //是墙或者是箱子就走不动
                return false;
            } else {
                //原来的坐标变成草
                curr_map[this.player.y][this.player.x] = 0;
                //要移动的目标位置 变成人
                curr_map[p_co.y][p_co.x] = 4;
                //要箱子移动的目标位置 变成箱子
                curr_map[b_co.y][b_co.x] = 3;
                return true;
            }
        }
        //原来的坐标变成草
        curr_map[this.player.y][this.player.x] = 0;
        //要移动的目标位置 变成人
        curr_map[p_co.y][p_co.x] = 4;
        return true;
    }
    //记录推入的箱子
    set_trap(level_arr) {
        for (let i in level_arr) {
            for (let j in level_arr) {
                if (level_arr[i][j] == 2) {
                    //判断当前的坑的坐标是否已经存在this.trap_arr
                    if (this.trap_arr.length <= this.trap) {
                        this.trap_arr.push({
                            x: j,
                            y: i
                        });
                    }
                    //解决箱子替换了坑  代码是补一块坑
                    let div_trap = document.createElement("div");
                    div_trap.classList.add("ab-position");
                    div_trap.style.left = Number(j) * 30 + "px";
                    div_trap.style.top = Number(i) * 30 + "px";
                    this.game_screen.appendChild(div_trap);
                }
            }
        }
        // console.log(this.trap_arr);
    }
    //检查是否已经全部推入
    //1-墙、2-坑、3-盒子、4-人
    checking_success() {
        //this.trap_arr 坑的位置集合  一张原型图 盖房子的图
        for (let i in this.trap_arr) {
            //this.curr_map 已经改变地图
            //拿着原来图纸坐标 放到现在的成品数组 去对比  不是箱子就没有完成游戏
            if (this.curr_map[this.trap_arr[i].y][this.trap_arr[i].x] != 3) {
                return false;
            }
        }
        return true;
    }
    replay() {
        this.setArrary();
        // console.log(this.curr_map);
        this.init(this.curr_map);
        //因为后面要push每一个坑坐标 每一把的游戏坐标不一样 所以要清空
        this.trap_arr = [];
    }
    last_level() {
        if (this.level >= 1) {
            this.level -= 1;
        }
        this.which_level.value = this.level
        this.setArrary();
        // console.log(this.curr_map);
        this.init(this.curr_map);
        //因为后面要push每一个坑坐标 每一把的游戏坐标不一样 所以要清空
        this.trap_arr = [];
    }
    next_level() {
        if (this.level <= 98) {
            this.level += 1;
        }
        this.which_level.value = this.level
        this.setArrary();
        // console.log(this.curr_map);
        this.init(this.curr_map);
        //因为后面要push每一个坑坐标 每一把的游戏坐标不一样 所以要清空
        this.trap_arr = [];
    }

}

let pb = new PushBox(levels);

//属性
// 1.地图的div对象   2.所有的关卡
//方法
// 1. 初始化地图 2. 初始化事件 3. 推箱子