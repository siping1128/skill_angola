<script setup lang="ts">
import {
  NConfigProvider,
  NDialogProvider,
  NMessageProvider
} from 'naive-ui';
import store from './store/store';
import { handleSelectLanguage } from './functions/general';
import { onBeforeMount } from 'vue';

// 这里是用来判断用户是否正在使用移动端设备来访问我们的页面
store.state.display.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());

const themeOverrides = {
  common: {
    "primaryColor": "#9D2D22FF", // 这里可以自定义主题色
    "primaryColorHover": "#DC6E64FF",
    "primaryColorPressed": "#7B2119FF",
    "primaryColorSuppl": "#E14C27FF",
  },
};

onBeforeMount(() => {
  const curLang = localStorage.getItem("lang")
  if (!curLang) {
    handleSelectLanguage("en")
  } else {
    handleSelectLanguage(curLang)
  }
})
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-dialog-provider>
      <n-message-provider>
        <div class="app">
          <router-view />
        </div>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<style lang="less">
@import "./style.css";

#app {
  margin: 0 auto;
  padding: 0;
}
</style>