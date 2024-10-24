<template>
  <div ref="popupRef" class="popup-box" v-show="popupVisible">
    <div v-if="elContext === 'anchor'" class="pop-item" @click="handleClickNavigate">
      点 击 跳 转
    </div>
    <div v-if="elContext === 'anchor'" class="pop-item" @click="handleGetLink">提 取 链 接</div>
    <div v-if="elContext === 'contextmenu'" class="pop-item" @click="handleClickElement">
      点 击 元 素
    </div>
  </div>
</template>

<script setup lang="ts">
import { addClass } from '@/util/dom';
import { DomService } from '@/util/selector';
import { computed, nextTick, onMounted, ref } from 'vue';

const emits = defineEmits(['addUserDoData', 'clickAndWaitNavigator']);

const props = defineProps({
  selectSimilar: {
    type: Boolean,
    default: () => false,
  },
});

const selectSimilar = computed(() => props.selectSimilar);

// popup弹出框
const popupVisible = ref(false);
const popupRef: any = ref(null);
const elContext = ref('');
const targetRef = ref<any>(null);

const showPopupBox = ($el: HTMLElement) => {
  targetRef.value = $el;
  popupVisible.value = true;
  nextTick(() => {
    const elClientRect = $el.getBoundingClientRect();
    const popupBoxRect = popupRef.value.getBoundingClientRect();

    let computedTop: number = elClientRect.top - popupBoxRect.height;
    if (computedTop <= 0) {
      computedTop = elClientRect.height + elClientRect.top;
    }
    if (computedTop > window.innerHeight) {
      computedTop = Math.floor(window.innerHeight / 2);
    }
    popupRef.value.style.top = computedTop + 'px';
    popupRef.value.style.left =
      elClientRect.left + elClientRect.width / 2 - popupBoxRect.width / 2 + 'px';
  });
};
const globalAListener = () => {
  Array.prototype.map.call(document.querySelectorAll('a'), ($el: HTMLAnchorElement) => {
    if (typeof $el.target === 'string' && $el.target !== '_self') {
      // 过滤 svg 下的 a标签
      $el.target = '_self';
    }
    $el.addEventListener('mouseenter', (event: MouseEvent) => {
      elContext.value = 'anchor';
      showPopupBox($el);
      event.stopPropagation();
    });
    $el.addEventListener('mouseleave', (event: MouseEvent) => {
      popupVisible.value = false;
      event.stopPropagation();
    });
  });
};
const globalContextListener = () => {
  document.body.addEventListener('contextmenu', (e: any) => {
    const $el = e.target;
    e.preventDefault();
    elContext.value = 'contextmenu';
    showPopupBox($el);
    e.stopPropagation();
  });
};

const handleClickNavigate = () => {
  const simpleSelect = DomService.getSelectorSimple(targetRef.value);
  const newSelector = DomService.getSelectorWithNthUniq(simpleSelect, targetRef.value);
  const rectDomElRect = targetRef.value.getBoundingClientRect();
  targetRef.value.className =
    targetRef.value.className + ` puppeteer_sunsilent_light_click_navigator`;
  // 通过 readystatechange 判断是否需要等待 load 事件
  // 有些网站会有不断的http请求，这时可以只需要等待 load 事件，不需要等待 networkidle0
  emits('addUserDoData', {
    type: 'clickAndWaitNavigator',
    slot: true,
    urlChange: true,
    waitForNavigation: {
      timeout: 10 * 1000,
      waitUntil: ['load', 'networkidle0'],
    },
    data: {
      screenX: rectDomElRect.left + rectDomElRect.width / 2,
      screenY: rectDomElRect.top + rectDomElRect.height / 2,
      selector: newSelector,
    },
  });
  emits('clickAndWaitNavigator', {
    selector: newSelector,
    screenX: rectDomElRect.left + rectDomElRect.width / 2,
    screenY: rectDomElRect.top + rectDomElRect.height / 2,
  });
};

const handleClickElement = () => {
  const rectDomElRect = targetRef.value.getBoundingClientRect();
  const simpleSelect = DomService.getSelectorSimple(targetRef.value);
  const newSelector = DomService.getSelectorWithNthUniq(simpleSelect, targetRef.value);
  targetRef.value.className =
    targetRef.value.className + ` puppeteer_sunsilent_light_click_element`;
  targetRef.value.click();
  emits('addUserDoData', {
    type: 'clickElement',
    label: '',
    multiple: selectSimilar.value,
    slot: true,
    data: {
      selector: newSelector,
      screenX: rectDomElRect.left + rectDomElRect.width / 2,
      screenY: rectDomElRect.top + rectDomElRect.height / 2,
    },
  });
};

const handleGetLink = () => {
  let newSelector = null;
  if (selectSimilar.value) {
    newSelector = DomService.getSelectorWithClass(targetRef.value);
  } else {
    const simpleSelect = DomService.getSelectorSimple(targetRef.value);
    newSelector = DomService.getSelectorWithNthUniq(simpleSelect, targetRef.value);
  }

  addClass(newSelector, 'puppeteer_sunsilent_light_attribute');

  emits('addUserDoData', {
    type: 'getAttribute',
    label: '',
    multiple: selectSimilar.value,
    attributes: targetRef.value.getAttributeNames(),
    attribute: 'href',
    slot: true,
    data: newSelector,
  });
};

const initGlobalListener = () => {
  popupRef.value.addEventListener('mouseenter', () => {
    popupVisible.value = true;
  });
  popupRef.value.addEventListener('mouseleave', () => {
    popupVisible.value = false;
  });
  globalAListener();
  globalContextListener();
};
onMounted(async () => {
  initGlobalListener();
});
</script>
