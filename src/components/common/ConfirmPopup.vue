<template>
  <q-popup-proxy>
    <q-card class="popup-card" style="background: transparent">
      <q-item class="q-pt-md">
        <q-item-section top avatar>
          <q-icon :name="icon" color="warning" size="40px" />
        </q-item-section>
        <q-item-section>
          <q-item-label style="font-size: 16px">{{ label }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-card-section align="right" class="q-pt-none">
        <q-btn dense flat outline color="grey-7" label="取消" v-close-popup class="q-mr-sm" @click="onCancel" />
        <q-btn dense flat outline color="primary" label="确定" v-close-popup @click="onOk" />
      </q-card-section>
    </q-card>
  </q-popup-proxy>
</template>

<script lang="ts" setup>
defineProps({
  icon: {
    type: String,
  },
  label: {
    type: String,
  },
});
const emit = defineEmits(['onOk', 'onCancel']);

const onOk = () => {
  emit('onOk');
};
const onCancel = () => {
  emit('onCancel');
};
</script>

<style scoped>
.popup-card {
  min-width: 200px;
}
</style>
