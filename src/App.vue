<template>
  <div id="app">
    <h1 style="text-align: center;">RPGT2P 文本捏脸系统</h1>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="文本捏脸" name="main">
        <el-row :gutter="10"> <!--el-col :span="3" class="label_pre">选择模型：</el-col-->
          <el-col :span="6"><el-radio-group v-model="lang">
              <el-radio-button label="en">英文CLIP</el-radio-button>
              <el-radio-button label="cn">中文CLIP</el-radio-button>
            </el-radio-group></el-col>
          <el-col :span="8"><el-radio-group v-model="gender">
              <el-radio-button label="female">女性</el-radio-button>
              <el-radio-button label="male" disabled>男性</el-radio-button>
            </el-radio-group></el-col>
        </el-row>
        <el-row :gutter="10">
          <!--el-col :span="4">
            <el-select v-model="select" placeholder="请选择">
              <el-option label="英文CLIP" value="en"></el-option>
              <el-option label="中文CLIP" value="cn"></el-option>
            </el-select>
          </el-col-->
          <el-col :span="19">
            <el-input placeholder="请输入文本" v-model="input_text" class="input-with-select">
            </el-input>
          </el-col>
          <el-col :span="4"><el-button type="primary" @click="inputClick">开始捏脸</el-button>
          </el-col>
        </el-row>
        <el-row id="iter">迭代次数：<el-input-number v-model="iter_num" @change="handleChange" :min="1" :max="200"
            label="迭代轮数"></el-input-number>
        </el-row>
        <el-row><el-switch active-text="同时展示游戏引擎结果（需手动打开模拟器）" inactive-text="不使用游戏引擎" v-model="use_engine"
            active-color="#13ce66" inactive-color="#ff4949">
          </el-switch></el-row>
        <el-divider></el-divider>
        <h2>捏脸结果<span v-if="generated">:{{ this.last_input }}</span></h2>
        <el-row :gutter="0" v-loading="loading"><el-col :span="12"><el-card shadow="hover" style="width: 90%;">
              <div style="width: 100%; display: inline-block; text-align: center;">
                <el-image style="width:85%; " id="result_img" :src="url"></el-image>
              </div>
            </el-card>
          </el-col>
          <el-col :span="11">
            <el-card shadow="hover" style="width: 100%;margin-top: 20px; ">
              <div style="width: 100%; display: inline-block; ">
                <el-statistic :value="last_iter" title="迭代次数">
                </el-statistic>
              </div>
            </el-card>
            <el-card shadow="hover" style="width: 100%;margin-top: 20px; ">
              <div style="width: 100%; display: inline-block; ">
                <el-statistic :value="gen_time" :precision="2" title="生成用时(s)">
                </el-statistic>
              </div>
            </el-card>
            <el-card shadow="hover" style="width: 100%;margin-top: 20px; ">
              <div style="width: 100%; display: inline-block; ">
                <el-statistic group-separator="," :precision="2" decimal-separator="." :value="clip_score"
                  title="CLIP Score">
                </el-statistic>
              </div>
            </el-card><!--el-card shadow="hover" style="width: 100%;margin-top: 20px; ">
              <div style="width: 100%; display: inline-block; ">
                <el-statistic :value="r_pre" title="R-Precision">
                </el-statistic>
              </div>
            </el-card-->
          </el-col></el-row>
      </el-tab-pane>
      <el-tab-pane label="结果对比" name="second">
        <el-select v-model="comp_selected" style="width: 100%;" @change="compChange" placeholder="请选择">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <el-row type="flex" justify="center">
          <el-col :span="11">
            <div class="comp_title">
              <h2>Ours</h2>
              <el-image style="height:300px; width: 300px;" id="result_img"
                :src="comp_data.t2p.img_path"></el-image><el-card :style="{ backgroundColor: t2p_bg }" shadow="hover"
                class="comp_score" style="width: 200px;">
                <el-statistic id="t2p" group-separator="," :precision="2" decimal-separator="."
                  :value="comp_data.t2p.clip_score" title="CLIP Score">
                </el-statistic>
              </el-card>
            </div>
          </el-col><el-col :span="11">
            <div class="comp_title" id="comp_right">
              <h2>逆水寒</h2>
              <el-image style="height:300px; width: 300px;" id="result_img"
                :src="comp_data.nsh.img_path"></el-image><el-card id="nsh" :style="{ backgroundColor: nsh_bg }"
                class="comp_score" shadow="hover" style="width: 200px">
                <el-statistic group-separator="," :precision="2" decimal-separator="." :value="comp_data.nsh.clip_score"
                  title="CLIP Score">
                </el-statistic>
              </el-card>
            </div>
          </el-col>
        </el-row>
        <!--el-row type="flex" justify="center"><el-col :span="12">
            <el-card class="comp_score" shadow="hover" style="width: 200px;">
              <el-statistic group-separator="," :precision="2" decimal-separator="." :value="clip_score"
                title="CLIP Score">
              </el-statistic>
            </el-card>
          </el-col><el-col :span="12">
            <el-card class="comp_score" shadow="hover" style="width: 50%; text-align: center;">
              <el-statistic group-separator="," :precision="2" decimal-separator="." :value="clip_score"
                title="CLIP Score">
              </el-statistic>
            </el-card>
          </el-col></el-row-->
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { Loading } from 'element-ui';
import { comp_data } from './assets/comp_data'

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
      generated: false,
      activeName: 'main',
      select: 'en',
      gen_time: 3.24,
      iter_num: 50,
      clip_score: 27.855,
      last_iter: 10,
      lang: 'en',
      // t2p_img_path: require('../comp/T2P/01.A woman with large bright eyes and long eyelashes..png'),
      // nsh_img_path: require('../comp/NSH/01.png'),
      comp_data: {
        t2p: { img_path: require('../comp/T2P/01.A woman with large bright eyes and long eyelashes..png'), clip_score: 30 },
        nsh: { img_path: require('../comp/NSH/01.png'), clip_score: 30 }
      },
      gender: 'female',
      input_text: '',
      use_engine: false,
      r_pre: 0.5,
      t2p_bg: '#FFFFFF',
      nsh_bg: '#FFFFFF',
      loading: false,
      options: [],
      comp_selected: '',
      last_input: '',
      url: require('./assets/test.png')
    }
  },
  mounted() {
    // comp_data.中文.forEach(element => {
    // });
    for (let key in comp_data['中文']) {
      this.options.push({ label: comp_data.中文[key], value: key })
    }
    this.compChange('1')
  },
  methods: {
    inputClick() {
      this.loading = true;
      ipcRenderer.send('text-input', { text: this.input_text, iter: this.iter_num, engine: this.use_engine, lang: this.lang });
      this.timer = setInterval(this.checkResult, 1000);
    },
    handleClick() {

    },
    handleChange() {

    },
    checkResult() {
      if (msg_rcvd) {
        this.generated = true;
        this.url = recent_msg.img_path;
        this.clip_score = recent_msg.clip_score;
        this.gen_time = recent_msg.time;
        msg_rcvd = false;
        this.loading = false
        clearInterval(this.timer);
        this.last_input = this.input_text;
        this.last_iter = this.iter_num;
      }
    },
    compChange(value) {
      this.comp_data.t2p.clip_score = comp_data['T2Pclip_socre-en'][value] * 100;
      this.comp_data.nsh.clip_score = comp_data['逆水寒clip_socre'][value] * 100;//#67C23A
      if (this.comp_data.nsh.clip_score > this.comp_data.t2p.clip_score) {
        this.nsh_bg = '#67C23A';
        this.t2p_bg = '#FFFFFF';
      }
      else {
        this.t2p_bg = '#67C23A';
        this.nsh_bg = '#FFFFFF';
      }
      if (comp_data.英文[value].charAt(1) == '.') {
        this.comp_data.t2p.img_path = require('../comp/T2P/0' + comp_data.英文[value].charAt(0) + '.' + comp_data.英文[value].slice(3) + '.png')
        this.comp_data.nsh.img_path = require('../comp/NSH/0' + comp_data.中文[value].charAt(0) + '.png')
      }
      else {
        this.comp_data.t2p.img_path = require('../comp/T2P/' + comp_data.英文[value].slice(0, 2) + '.' + comp_data.英文[value].slice(4) + '.png')
        this.comp_data.nsh.img_path = require('../comp/NSH/' + comp_data.中文[value].slice(0, 2) + '.png')
      }
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

.comp_title {
  text-align: center;
}

.comp_score {
  margin-left: 123px;
  margin-top: 20px;
  text-align: center;
  align-items: center;
  justify-content: center;
}

#result_img {
  /* margin: 10px; */
  /* width: 200px;
  height: 200px; */
}

.comp_score_block {
  align-items: center;
  justify-content: center;
}

#label_pre {
  margin-top: 20px;
}

#iter {
  margin-left: 6px;
}

#comp_right {
  margin-top: -3px;
  /* I don't know why */
}

.el-row {
  margin-bottom: 20px;
}

.comp_score_block {
  width: 80%;
  display: inline-block;
  margin-right: 20px;
}
</style>
