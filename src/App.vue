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
        <h2>捏脸结果<span v-if="generated">: {{ this.last_input }}</span></h2>
        <el-row :gutter="0" v-loading="loading"><el-col :span="14"><!--el-card shadow="hover" style="width: 90%;">
            </el-card-->
            <div style="width: 100%; display: inline-block; text-align: center;">
              <el-image style="width:70%; " id="result_img" :src="url"></el-image>
            </div>
          </el-col>

          <el-col :span="8">
            <el-card shadow="hover" style="width: 100%;">
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
            </el-card>
            <el-card shadow="hover" style="width: 100%;margin-top: 20px; " v-show="show_aes">
              <div style="width: 100%; display: inline-block; ">
                <el-statistic group-separator="," :precision="1" decimal-separator="." :value="aes"
                  title="Aesthetic Prediction">
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
          <el-col :span="13">
            <div class="comp_title">
              <h2>Ours</h2>
              <el-image style="width:480px; height: 300px;" id="result_img"
                :src="comp_data.t2p.img_path"></el-image><el-card id="t2p_clip_score" :style="{ backgroundColor: t2p_bg }"
                shadow="hover" class="comp_score" style="width: 200px;">
                <el-statistic id="t2p" group-separator="," :precision="2" decimal-separator="."
                  :value="comp_data.t2p.clip_score" title="CLIP Score">
                </el-statistic>
              </el-card>
              <!--el-card id="nsh" :style="{ backgroundColor: t2p_aes_bg }" v-if="false" class="comp_score" shadow="hover"
                style="width: 200px">
                <el-statistic group-separator="," :precision="2" decimal-separator="." :value="comp_data.t2p.aes"
                  title="Aesthetics Prediction">
                </el-statistic>
              </el-card-->
            </div>
          </el-col><el-col :span="11">
            <div class="comp_title" id="comp_right">
              <h2>逆水寒</h2>
              <el-image style="height:300px; width: 300px;" id="result_img"
                :src="comp_data.nsh.img_path"></el-image><el-card id="nsh_clip_score" :style="{ backgroundColor: nsh_bg }"
                class="comp_score" shadow="hover" style="width: 200px">
                <el-statistic group-separator="," class="comp_score" :precision="2" decimal-separator="."
                  :value="comp_data.nsh.clip_score" title="CLIP Score">
                </el-statistic>
              </el-card><!--el-card id="nsh" :style="{ backgroundColor: nsh_aes_bg }" v-if="false" class="comp_score"
                shadow="hover" style="width: 200px">
                <el-statistic group-separator="," :precision="2" decimal-separator="." :value="comp_data.nsh.aes"
                  title="Aesthetics Prediction">
                </el-statistic>
              </el-card-->
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
import { data } from './assets/data'

const ipcRenderer = require('electron').ipcRenderer;
var id = 0;
let that;
var recent_msg = {
  img_path: '',
  clip_score: 30,
  time: 3
};
let alerted = false;
var msg_rcvd = false;
var failed_rcvd = false;
var error;
ipcRenderer.on('generated-reply', (e, msg) => {
  console.log('rcvd')
  console.log(msg)
  recent_msg = JSON.parse(msg);
  msg_rcvd = true;
});
ipcRenderer.on('generated-failed', (e, msg) => {
  alerted = false;
  console.log('failed')
  console.log(msg)
  error = JSON.parse(msg);
  failed_rcvd = true;
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
      iter_num: 20,
      clip_score: 27.855,
      last_iter: 10,
      show_aes: false,
      lang: 'en',
      // t2p_img_path: require('../comp/T2P/01.A woman with large bright eyes and long eyelashes..png'),
      // nsh_img_path: require('../comp/NSH/01.png'),
      comp_data: {
        t2p: { img_path: require('../comp/T2P1/定义明确的下巴和柔和的面部特征构成了她迷人的面容_engine.png'), clip_score: 30, aes: 6.3 },
        nsh: { img_path: require('../comp/NSH/01.png'), clip_score: 30, aes: 5.7 }
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
      url: require('../comp/T2P/61.A baby face with big, cute and adorable eyes.png')
    }
  },
  mounted() {
    for (let key in comp_data['中文']) {
      this.options.push({ label: comp_data.中文[key], value: key })
    }
    this.compChange('1')
    that = this;
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
        try {
          //let result = JSON.parse(data_str)
          this.generated = true;
          // console.log(result["img_path"])
          // console.log(result['clip_score'])
          // console.log(result['time'])
          this.url = recent_msg.img_path;
          this.clip_score = recent_msg.clip_score;
          this.gen_time = recent_msg.time;
          if (recent_msg.aes) {
            this.show_aes = true;
            this.aes = recent_msg.aes;
          }
          else {
            this.show_aes = false;
          }
          msg_rcvd = false;
          this.loading = false
          clearInterval(this.timer);
          this.last_input = this.input_text;
          this.last_iter = this.iter_num;
        } catch (error) {
          console.log(error);
        }
      }
      else if (failed_rcvd && !alerted) {
        alerted = true;
        failed_rcvd = false;
        this.loading = false;
        if (error['message']) {
          this.$alert(`请确认app.py服务器是否打开并已加载完成<br />${error['message'] ? '错误信息: ' + error['message'] : ''}`, '生成出错', {
            confirmButtonText: '确定',
            dangerouslyUseHTMLString: true
          });
        }
      }
    },
    compChange(value) {
      this.comp_data.t2p.clip_score = data['t2p'].find(item => {
        return item['index'] == value;
      })['clip_score'];

      this.comp_data.nsh.clip_score = data['nsh'].find(item => {
        return item['index'] == value;
      })['clip_score'];
      this.comp_data.t2p.aes = data['t2p'].find(item => {
        return item['index'] == value;
      })['aes'];

      this.comp_data.nsh.aes = data['nsh'].find(item => {
        return item['index'] == value;
      })['aes'];
      if (this.comp_data.nsh.clip_score > this.comp_data.t2p.clip_score) {
        this.nsh_bg = '#67C23A';
        this.t2p_bg = '#FFFFFF';
      }
      else {
        this.t2p_bg = '#67C23A';
        this.nsh_bg = '#FFFFFF';
      }
      if (this.comp_data.nsh.aes > this.comp_data.t2p.aes) {
        this.nsh_aes_bg = '#67C23A';
        this.t2p_aes_bg = '#FFFFFF';
      }
      else {
        this.t2p_aes_bg = '#67C23A';
        this.nsh_aes_bg = '#FFFFFF';
      }
      if (comp_data.英文[value].charAt(1) == '.') {
        //this.comp_data.t2p.img_path = require('../comp/T2P/0' + comp_data.英文[value].charAt(0) + '.' + comp_data.英文[value].slice(3) + '.png')
        this.comp_data.t2p.img_path = require(`../comp/T2P1/${this.comp_data.nsh.aes = data['nsh'].find(item => {
          return item['index'] == value;
        })['text']}_engine.png`)
        this.comp_data.nsh.img_path = require('../comp/NSH/0' + comp_data.中文[value].charAt(0) + '.png')
      }
      else {
        this.comp_data.t2p.img_path = require(`../comp/T2P1/${this.comp_data.nsh.aes = data['nsh'].find(item => {
          return item['index'] == value;
        })['text']}_engine.png`)
        //this.comp_data.t2p.img_path = require('../comp/T2P/' + comp_data.英文[value].slice(0, 2) + '.' + comp_data.英文[value].slice(4) + '.png')
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
  /* margin-left: 123px;
  margin-top: 25px;*/
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
}


#t2p_clip_score {
  margin-left: 155px;
  margin-top: 25px;
}

#nsh_clip_score {
  margin-left: 122px;
  margin-top: 25px;
}
</style>
