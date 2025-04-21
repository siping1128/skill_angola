<script setup lang='ts'>
import { ref } from 'vue'
import {
    NLayout, NLayoutHeader, NLayoutContent, NLayoutFooter
} from 'naive-ui'
</script>

<template>
    <n-layout>
        <n-layout-header>
        </n-layout-header>
        <n-layout-content>
            <router-view />
        </n-layout-content>
    </n-layout>
</template>

<style lang='less' scoped></style>