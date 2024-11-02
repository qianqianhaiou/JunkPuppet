<template>
  <div class="select-input">
    <div class="select-icon" @click="handleSelectElement">
      <selectActive v-if="selectEnable"></selectActive>
      <Select v-else></Select>
    </div>
    <input v-model="selector.selector" placeholder="请选择元素" type="text" />
    <div class="fast-selection">
      <div class="up">
        <ArrowsUp></ArrowsUp>
      </div>
      <div class="down">
        <ArrowsDown></ArrowsDown>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import type { Ref } from 'vue';
import Select from './icons/Select.vue';
import SelectActive from './icons/SelectActive.vue';
import ArrowsDown from './icons/ArrowsDown.vue';
import ArrowsUp from './icons/ArrowsUp.vue';
import { removeClass } from '@/util/dom';

const props = defineProps({
  selectSimilar: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['change']);

const globalSelectVisible: any = inject('globalSelectVisible');
const selectingResult: any = inject('selectingResult');
const handleChangeGlobalSelectVisible: any = inject('handleChangeGlobalSelectVisible');

const selector = ref({
  iframeIndex: -1,
  selector: '',
}); // selection xpath

const selectEnable = ref(false);
const handleSelectElement = async () => {
  if (globalSelectVisible.value) {
    if (selectEnable.value) {
      selectEnable.value = false;
      handleChangeGlobalSelectVisible(false);
    }
  } else {
    selectEnable.value = true;
    handleChangeGlobalSelectVisible(true);
    removeClass('puppeteer_sunsilent_light_selecting', selector.value);
    selector.value = { iframeIndex: -1, selector: '' };
  }
};

watch(selectingResult, (cur: any) => {
  if (selectEnable.value) {
    selectEnable.value = false;
    selector.value = cur;
  }
});

watch(selector, (cur) => {
  emits('change', cur);
});
</script>
