<template>
  <div class="select-input">
    <div class="select-icon" @click="handleSelectElement">
      <selectActive v-if="selectEnable"></selectActive>
      <Select v-else></Select>
    </div>
    <input
      v-model="selector.selector"
      :style="{ paddingRight: similarable ? '48px' : '28px' }"
      placeholder="请选择元素"
      type="text"
      @blur="handleInputChange"
      @keydown.enter="handleInputChange"
    />
    <div class="fast-selection">
      <div class="up">
        <ArrowsUp @click="handleSelectParent"></ArrowsUp>
      </div>
      <div class="down">
        <ArrowsDown @click="handleSelectChildren"></ArrowsDown>
      </div>
    </div>
    <div v-if="similarable" class="select-similar" @click="handleChangeSimilar">
      <SimilarOn v-if="similar"></SimilarOn>
      <SimilarOff v-else></SimilarOff>
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import Select from './icons/Select.vue';
import SelectActive from './icons/SelectActive.vue';
import ArrowsDown from './icons/ArrowsDown.vue';
import ArrowsUp from './icons/ArrowsUp.vue';
import SimilarOn from './icons/SimilarOn.vue';
import SimilarOff from './icons/SimilarOff.vue';
import { DomService } from '@/util/selector';

const props = defineProps({
  similarable: {
    type: Boolean,
    default: false,
  },
});

const selectSimilar: any = inject('selectSimilar');
const handleChangeSelectSimilar: any = inject('handleChangeSelectSimilar');

const emits = defineEmits(['change']);

const globalSelectVisible: any = inject('globalSelectVisible');
const selectingResult: any = inject('selectingResult');
const handleChangeGlobalSelectVisible: any = inject('handleChangeGlobalSelectVisible');

const selector = ref({
  iframeIndex: -1,
  selector: '',
  similar: false,
}); // selection xpath

const selectEnable = ref(false);
const handleSelectElement = async () => {
  handleChangeSelectSimilar(similar.value);
  if (globalSelectVisible.value) {
    if (selectEnable.value) {
      selectEnable.value = false;
      handleChangeGlobalSelectVisible(false);
    }
  } else {
    selectEnable.value = true;
    handleChangeGlobalSelectVisible(true);
    if (selector.value.selector)
      DomService.removeClass(selector.value, 'puppeteer_sunsilent_light_selecting');
    selector.value = { iframeIndex: -1, selector: '', similar: selectSimilar.value };
  }
};

const similar = ref(false);
const handleChangeSimilar = () => {
  similar.value = !similar.value;
  handleChangeSelectSimilar(similar.value);
};

const resetFields = () => {
  similar.value = false;
  selector.value = { iframeIndex: -1, selector: '', similar: false };
  selectEnable.value = false;
  handleChangeSelectSimilar(false);
  handleChangeGlobalSelectVisible(false);
};

const handleSelectParent = () => {
  if (selector.value.selector)
    DomService.removeClass(selector.value, 'puppeteer_sunsilent_light_selecting');

  const element = DomService.getElementBySelector(selector.value);
  let newSelector: any = null;
  if (element && element.parentElement) {
    if (similar.value) {
      newSelector = DomService.getSelectorWithClass(element.parentElement);
    } else {
      const simpleSelect = DomService.getSelectorSimple(element.parentElement);
      newSelector = DomService.getSelectorWithNthUniq(simpleSelect, element.parentElement);
    }
    DomService.addClass(newSelector, 'puppeteer_sunsilent_light_selecting');
  }
  selector.value.iframeIndex = newSelector.iframeIndex;
  selector.value.selector = newSelector.selector;
  selector.value.similar = similar.value;
};
const handleSelectChildren = () => {
  if (selector.value.selector)
    DomService.removeClass(selector.value, 'puppeteer_sunsilent_light_selecting');

  const element: any = DomService.getElementBySelector(selector.value);
  let newSelector: any = null;
  if (element && element.firstElementChild) {
    if (similar.value) {
      newSelector = DomService.getSelectorWithClass(element.firstElementChild);
    } else {
      const simpleSelect = DomService.getSelectorSimple(element.firstElementChild);
      newSelector = DomService.getSelectorWithNthUniq(simpleSelect, element.firstElementChild);
    }
    DomService.addClass(newSelector, 'puppeteer_sunsilent_light_selecting');
  }
  selector.value.iframeIndex = newSelector.iframeIndex;
  selector.value.selector = newSelector.selector;
  selector.value.similar = similar.value;
};

const handleInputChange = () => {
  DomService.removeClass(
    { iframeIndex: -1, selector: '.puppeteer_sunsilent_light_selecting' },
    'puppeteer_sunsilent_light_selecting',
  );
  DomService.addClass(selector.value, 'puppeteer_sunsilent_light_selecting');
  emits('change', selector.value);
};

defineExpose({ resetFields });

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
