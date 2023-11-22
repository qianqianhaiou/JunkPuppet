<template>
  <div ref="popupRef" class="popup-box" v-show="popupVisible">
    <!-- <div class="pop-item">设为下一层页面</div> -->
    <!-- <div class="pop-item">进入下一层页面</div> -->
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';

// popup弹出框
const popupVisible = ref(false);
const popupRef: any = ref(null);
const showPopupBox = ($el: HTMLElement) => {
  popupVisible.value = true;
  nextTick(() => {
    const elClientRect = $el.getBoundingClientRect();
    const popupBoxRect = popupRef.value.getBoundingClientRect();
    popupRef.value.style.top = elClientRect.top - popupBoxRect.height + 'px';
    popupRef.value.style.left =
      elClientRect.left +
      elClientRect.width / 2 -
      popupBoxRect.width / 2 +
      'px';
  });
};
const globalAListener = () => {
  popupRef.value.addEventListener('mouseenter', () => {
    popupVisible.value = true;
  });
  popupRef.value.addEventListener('mouseleave', () => {
    popupVisible.value = false;
  });
  Array.prototype.map.call(
    document.querySelectorAll('a'),
    ($el: HTMLAnchorElement) => {
      $el.target = '_self';
      $el.addEventListener('mouseenter', (event: MouseEvent) => {
        showPopupBox($el);
        event.stopPropagation();
      });
      $el.addEventListener('mouseleave', (event: MouseEvent) => {
        popupVisible.value = false;
        event.stopPropagation();
      });
    }
  );
};

const initGlobalListener = () => {
  globalAListener();
};
onMounted(async () => {
  initGlobalListener();
});
</script>
