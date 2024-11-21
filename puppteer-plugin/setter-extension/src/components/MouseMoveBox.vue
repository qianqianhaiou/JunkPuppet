<template>
  <div
    :class="{
      'rect-box': true,
      active: globalSelectVisible,
      pointervisible: rectBoxPointerVisible,
    }"
    ref="rectBoxRef"
  ></div>
</template>

<script setup lang="ts">
import { DomService } from '@/util/selector';
import { inject, onMounted, ref, watch } from 'vue';

const selectSimilar: any = inject('selectSimilar');
const globalSelectVisible: any = inject('globalSelectVisible');
const handleChangeGlobalSelectVisible: any = inject('handleChangeGlobalSelectVisible');
const setSelectingResult: any = inject('setSelectingResult');

// 鼠标跟随框
const rectBoxRef: any = ref(null);
const rectDomEl: any = ref();
const rectBoxPointerVisible = ref(false);
const rectBoxMove = () => {
  document.body.addEventListener(
    'mousemove',
    (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      rectDomEl.value = el;
      if (el.tagName === 'A' && (el as HTMLAnchorElement).target === '_blank') {
        (el as HTMLAnchorElement).target = '_self';
      }
      const rectData = el.getBoundingClientRect();
      (rectBoxRef.value as HTMLElement).style.top = rectData.top + 'px';
      (rectBoxRef.value as HTMLElement).style.left = rectData.left + 'px';
      (rectBoxRef.value as HTMLElement).style.width = rectData.width + 'px';
      (rectBoxRef.value as HTMLElement).style.height = rectData.height + 'px';
    },
    false,
  );
};

const getSelectorFromElement = () => {
  let newSelector = null;
  if (selectSimilar.value) {
    newSelector = DomService.getSelectorWithClass(rectDomEl.value);
  } else {
    const simpleSelect = DomService.getSelectorSimple(rectDomEl.value);
    newSelector = DomService.getSelectorWithNthUniq(simpleSelect, rectDomEl.value);
  }
  DomService.addClass(newSelector, 'puppeteer_sunsilent_light_selecting');
  return {
    ...newSelector,
    similar: selectSimilar.value,
  };
};

onMounted(() => {
  rectBoxMove();
});

const selector = ref();
const bodyClickStopPropagation = (e: any) => {
  document.body!.style.pointerEvents = 'none';
  selector.value = getSelectorFromElement();
  setTimeout(() => {
    globalSelectOff();
  }, 500);
};
const globalSelectOn = () => {
  selector.value = null;
  document.body.addEventListener('mousedown', bodyClickStopPropagation);
};
const globalSelectOff = () => {
  document.body!.style.pointerEvents = 'auto';
  document.body.removeEventListener('mousedown', bodyClickStopPropagation);
  handleChangeGlobalSelectVisible(false);
  setSelectingResult(selector.value);
};

watch(globalSelectVisible, (cur) => {
  if (cur) {
    globalSelectOn();
  } else {
    globalSelectOff();
  }
});
</script>
