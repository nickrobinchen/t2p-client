<template>
  <div id="app">
    <h1 style="text-align: center;">RPGT2P 文本捏脸系统</h1>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="文本捏脸" name="main">
        <el-row :gutter="10">
          <el-col :span="4">
            <el-select v-model="select" placeholder="请选择">
              <el-option label="英文CLIP" value="en"></el-option>
              <el-option label="中文CLIP" value="cn"></el-option>
            </el-select>
          </el-col>
          <el-col :span="15">
            <el-input placeholder="请输入文本" v-model="input_text" class="input-with-select">
            </el-input>
          </el-col>
          <el-col :span="4"><el-button type="primary" @click="start">开始捏脸</el-button>
          </el-col>
        </el-row>
        <el-row id="iter">迭代次数：<el-input-number v-model="num" @change="handleChange" :min="1" :max="200"
            label="迭代轮数"></el-input-number>
        </el-row>
        <el-divider></el-divider>
        <h2>捏脸结果</h2>
        <el-row :gutter="0"><el-col :span="12"><el-card shadow="hover" style="width: 90%;">
              <div style="width: 100%; display: inline-block; text-align: center;">
                <el-image style="width:85%; " id="result_img" :src="url" :fit="fill"></el-image>
              </div>
            </el-card>
          </el-col>
          <el-col :span="11">
            <el-card shadow="hover" style="width: 100%;">
              <div style="width: 100%; display: inline-block; ">
                <el-statistic group-separator="," :precision="2" decimal-separator="." :value="value1" title="CLIP Score">
                </el-statistic>
              </div>
            </el-card>
            <el-card shadow="hover" style="width: 100%;margin-top: 20px; ">
              <div style="width: 100%; display: inline-block; ">
                <el-statistic :value="gen_time" title="生成用时(s)">
                </el-statistic>
              </div>
            </el-card><el-card shadow="hover" style="width: 100%;margin-top: 20px; ">
              <div style="width: 100%; display: inline-block; ">
                <el-statistic :value="r_pre" title="R-Precision">
                </el-statistic>
              </div>
            </el-card>
          </el-col></el-row>
        <!--div>
          <el-row :gutter="20">
            <el-col :span="14">
              <el-card shadow="hover" style="width: 100%;">
                <div style="width: 100%; display: inline-block; ">
                  <el-statistic :value="deadline2" time-indices title="🎉商品降价🎉">
                    <template slot="suffix">
                      抢购即将开始
                    </template>
                  </el-statistic>
                </div>
              </el-card>
              <el-card shadow="hover" style="width: 100%;margin-top: 20px; ">
                <div style="width: 100%; display: inline-block; ">
                  <el-statistic @finish="hilarity" :value="deadline3" time-indices title="时间游戏">
                    <template slot="suffix">
                      <el-button type="primary " size="mini" @click="add">add 10s</el-button>
                    </template>
                  </el-statistic>
                </div>
              </el-card>
              <el-card shadow="hover" style="width: 100%;margin-top: 20px; ">
                <div style="width: 100%; display: inline-block;">
                  <el-statistic format="DD天HH小时mm分钟" :value="deadline5" time-indices title="🚩距离立夏还有：">
                  </el-statistic>
                </div>
              </el-card>
            </el-col>
            <el-col :span="10">
              <el-card shadow="hover" style="width: 100%;">
                <div slot="header" class="clearfix">
                  <span>文嘉《明日歌》</span>
                  <el-button style="float: right; padding: 3px 0" type="text" @click="clickFn">暂停</el-button>
                </div>
                <div style="font-size: 18px;text-align: center; margin-top: 35px;">
                  明日复明日
                </div>
                <div style="font-size: 18px;text-align: center;">明日何其多</div>
                <div style="font-size: 18px;text-align: center;">我生待明日</div>
                <div style="font-size: 18px;text-align: center;">万事成蹉跎</div>
                <div style="margin-top: 35px;"></div>
                <el-statistic ref="statistic" @finish="hilarity" format="HH:mm:ss" :value="deadline4" title="距离明日："
                  time-indices>
                </el-statistic>
              </el-card>
            </el-col>
          </el-row>
        </div-->
      </el-tab-pane>
      <el-tab-pane label="结果对比" name="second">
        <el-select v-model="value" placeholder="请选择">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'

const ipcRenderer = require('electron').ipcRenderer;
ipcRenderer.on('cs-reply', (e, msg) => {
  console.log("hi")
});

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      activeName: 'main',
      select: 'en',
      gen_time: 3.24,
      num: '50',
      value1: 27.855,
      input_text: '',
      r_pre: 0.5,
      url: require('./assets/test.png')
    }
  },
  methods: {
    start() {
      ipcRenderer.send(this.input_text)
      var x = 1
      if (1 == x) {
        ipcRenderer.send('open-child-now');
      } else {
        ipcRenderer.send('kill-child-now');
      }
    },
    handleClick() {

    },
    mounted() {
      //this.url = '@/assets/test.png';
    },
  }
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  /*margin-top: 60px;*/
}

#result_img {
  /* margin: 10px; */
  /* width: 200px;
  height: 200px; */
}

#iter {
  margin-left: 6px;
}

.el-row {
  margin-bottom: 10px;
}
</style>
