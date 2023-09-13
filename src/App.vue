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
          <el-col :span="4"><el-button type="primary" @click="inputClick">开始捏脸</el-button>
          </el-col>
        </el-row>
        <el-row id="iter">迭代次数：<el-input-number v-model="iter_num" @change="handleChange" :min="1" :max="200"
            label="迭代轮数"></el-input-number>
        </el-row>
        <el-divider></el-divider>
        <h2>捏脸结果</h2>
        <el-row :gutter="0" v-loading="loading"><el-col :span="12"><el-card shadow="hover" style="width: 90%;">
              <div style="width: 100%; display: inline-block; text-align: center;">
                <el-image style="width:85%; " id="result_img" :src="url" :fit="fill"></el-image>
              </div>
            </el-card>
          </el-col>
          <el-col :span="11">
            <el-card shadow="hover" style="width: 100%;">
              <div style="width: 100%; display: inline-block; ">
                <el-statistic group-separator="," :precision="2" decimal-separator="." :value="clip_score"
                  title="CLIP Score">
                </el-statistic>
              </div>
            </el-card>
            <el-card shadow="hover" style="width: 100%;margin-top: 20px; ">
              <div style="width: 100%; display: inline-block; ">
                <el-statistic :value="gen_time" :precision="2" title="生成用时(s)">
                </el-statistic>
              </div>
            </el-card><el-card shadow="hover" style="width: 100%;margin-top: 20px; ">
              <div style="width: 100%; display: inline-block; ">
                <el-statistic :value="r_pre" title="R-Precision">
                </el-statistic>
              </div>
            </el-card>
          </el-col></el-row>
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
import { Loading } from 'element-ui';


const ipcRenderer = require('electron').ipcRenderer;
var id = 0;
var recent_msg;
var msg_rcvd = false;
ipcRenderer.on('generated-reply', (e, msg) => {
  console.log(msg);
  recent_msg = JSON.parse(msg);
  msg_rcvd = true;
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
      iter_num: 50,
      clip_score: 27.855,
      input_text: '',
      r_pre: 0.5,
      url: require('./assets/test.png')
    }
  },
  methods: {
    inputClick() {
      ipcRenderer.send('text-input', [this.input_text, this.iter_num]);
      this.timer = setInterval(this.checkResult, 1000);
    },
    handleClick() {

    },
    checkResult() {
      if (msg_rcvd) {
        this.url = recent_msg.img_path //"data:image/jpg;base64," + recent_msg.img_path
        this.clip_score = recent_msg.clip_score;
        this.gen_time = recent_msg.time;
        msg_rcvd = false;
        clearInterval(this.timer);
      }
    },
    mounted() {
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
