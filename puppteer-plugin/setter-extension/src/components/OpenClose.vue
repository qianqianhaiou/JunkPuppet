<template>
  <span
    :class="{ active: currentState === props.name[0] }">{{
        props.name[0]
    }}</span>
  <div class="open-close" @click="changeState">
    <div
      :class="{ 'open-close-circle': true, 'left': currentState === props.name[0], 'right': currentState === props.name[1] }">
      <div class="arrow"></div>
    </div>
    </div>
    <span
      :class="{ active: currentState === props.name[1] }">{{
          props.name[1]
      }}</span>
</template>

<script setup lang="ts">
import { watch } from 'fs';
import { ref, watchEffect } from 'vue'
const props = defineProps<{ name: [string, string], activeName: string }>()
const emit = defineEmits(['change'])
const currentState = ref(props.name[0])
const changeState = () => {
  if (currentState.value === props.name[0]) {
    currentState.value = props.name[1]
  } else {
    currentState.value = props.name[0]
  }
  emit('change', currentState.value)
}
watchEffect(() => {
  currentState.value = props.activeName
})
</script>

<style scoped>

</style>
