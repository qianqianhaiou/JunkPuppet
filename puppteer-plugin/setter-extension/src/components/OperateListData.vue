<template>
  <div class="list">
    <div class="list-item" v-for="(item, index) in operateListData">
      <div class="item-header" @click="item.expand = !item.expand">
        <div class="title">
          <div class="index">{{ index + 1 }}：</div>
          <div classs="name">{{ item.operateData.name }}</div>
        </div>
        <div v-if="item.expand" class="expand">收起</div>
        <div v-else class="expand">展开</div>
      </div>
      <div v-if="item?.expand" class="item-body">
        <div>选择的元素：{{ item.mainSelector }}</div>
        <div v-if="item.previousLimit">前置条件：{{ item.previousLimit }}</div>
        <div v-if="item.parentLimit">父元素范围：{{ item.parentLimit }}</div>
        <div v-if="item.recordList">录制键鼠数据：{{ item.recordList }}</div>
        <div>操作数据：{{ item.operateData }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const operateListData: any = inject('operateListData');
</script>
