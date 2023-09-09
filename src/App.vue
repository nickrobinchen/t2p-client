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
          <el-col :span="12">
            <el-input placeholder="请输入文本" v-model="input3" class="input-with-select">
            </el-input>
          </el-col>
          <el-col :span="4"><el-button type="primary" @click="startClick">开始捏脸</el-button>
          </el-col>
        </el-row>
        <el-row id="iter">迭代次数：<el-input-number v-model="num" @change="handleChange" :min="1" :max="200"
            label="迭代轮数"></el-input-number>
        </el-row>
        <el-divider></el-divider>
        <h2>捏脸结果</h2>
        <el-row><el-col :span="11" :offset="1"><el-image id="result_img" :src="url" :fit="fit"></el-image>
          </el-col><el-col :span="12">
            <h3>生成图片指标</h3>
            <p>CLIP score: 30</p>
            <p>R-precision: </p>
            <p>生成时间: 2s</p>
          </el-col></el-row>
      </el-tab-pane><el-tab-pane label="结果对比" name="second">
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
      num: '50',
      input3: '',
      url: require('./assets/test.png')
    }
  },
  methods: {
    startClick() {
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
