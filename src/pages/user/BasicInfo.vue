<template>
  <div class="q-px-md q-py-sm form">
    <div class="line row">基本信息</div>
    <div class="line row">
      <div class="title text-grey-7" style="line-height: 100px">头像</div>
      <div class="content">
        <q-avatar size="100px" font-size="50px" color="white" text-color="grey" icon="person" />
      </div>
    </div>
    <div class="line row">
      <div class="title text-grey-7">UUID</div>
      <div class="content">
        {{ authStore.userId }}
      </div>
    </div>
    <div class="line row">
      <div class="title text-grey-7">用户权限</div>
      <div class="content">普通用户</div>
    </div>
    <div class="line row">
      <div class="title text-grey-7">用户名</div>
      <div class="content">
        {{ authStore.userName }}
      </div>
    </div>
    <div class="line row">
      <div class="title text-grey-7">邮箱</div>
      <div class="content">
        {{ authStore.email }}
      </div>
    </div>
    <div class="line row">
      <div class="title text-grey-7">姓名</div>
      <div class="content cursor-pointer" :class="[!(authStore.lastName && authStore.firstName) ? 'text-grey-7' : '']">
        {{ authStore.lastName && authStore.firstName ? `${authStore.lastName}${authStore.firstName}` : '未填写'
        }}<span class="text-primary q-pl-sm">点击修改</span>
        <q-popup-proxy>
          <div class="row q-pa-md">
            <q-input
              class="q-mr-md"
              :maxlength="15"
              filled
              v-model="editName.lastName"
              dense
              autofocus
              placeholder="请输入姓"
            />
            <q-input :maxlength="15" filled v-model="editName.firstName" dense autofocus placeholder="请输入名" />
            <q-btn flat dense color="negative" icon="cancel" v-close-popup />
            <q-btn
              flat
              dense
              color="positive"
              icon="check_circle"
              v-close-popup
              @click.stop.prevent="
                (authStore.lastName = editName.lastName),
                  (authStore.firstName = editName.firstName),
                  save({ lastName: editName.lastName, firstName: editName.firstName })
              "
            />
          </div>
        </q-popup-proxy>
      </div>
    </div>

    <div class="line row">
      <div class="title text-grey-7">昵称</div>
      <div class="content cursor-pointer" :class="[!authStore.nickName ? 'text-grey-7' : '']">
        {{ authStore.nickName ? authStore.nickName : '未填写' }}<span class="text-primary q-pl-sm">点击修改</span>
        <q-popup-edit
          v-model="authStore.nickName"
          v-slot="scope"
          @update:model-value="save({ nickName: authStore.nickName })"
        >
          <q-input :maxlength="15" filled v-model="scope.value" dense autofocus placeholder="请输入昵称">
            <template v-slot:after>
              <q-btn flat dense color="negative" icon="cancel" @click.stop.prevent="scope.cancel" />
              <q-btn
                flat
                dense
                color="positive"
                icon="check_circle"
                @click.stop.prevent="scope.set"
                :disable="scope.validate(scope.value) === false || scope.initialValue === scope.value"
              />
            </template>
          </q-input>
        </q-popup-edit>
      </div>
    </div>
    <div class="line row">
      <div class="title text-grey-7">手机号</div>
      <div class="content cursor-pointer" :class="[!authStore.userPhone ? 'text-grey-7' : '']">
        {{ authStore.userPhone ? authStore.userPhone : '未填写' }}<span class="text-primary q-pl-sm">点击修改</span>
        <q-popup-edit
          v-model="authStore.userPhone"
          :validate="(val:string) => phoneValidation(val)"
          v-slot="scope"
          @update:model-value="save({ userPhone: authStore.userPhone })"
        >
          <q-input
            :maxlength="11"
            filled
            v-model="scope.value"
            dense
            autofocus
            mask="###########"
            placeholder="请输入手机号"
          >
            <template v-slot:after>
              <q-btn flat dense color="negative" icon="cancel" @click.stop.prevent="scope.cancel" />
              <q-btn
                flat
                dense
                color="positive"
                icon="check_circle"
                @click.stop.prevent="scope.set"
                :disable="scope.validate(scope.value) === false || scope.initialValue === scope.value"
              />
            </template>
          </q-input>
        </q-popup-edit>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { UserService } from 'src/service';
import { useAuthStore } from 'src/stores/auth';
import { ref } from 'vue';

const authStore = useAuthStore();
const $q = useQuasar();

const phoneValidation = (val: string) => {
  const regex =
    /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/;
  if (regex.test(val)) return true;
  else return false;
};
const save = async (form: { [key: string]: string }) => {
  try {
    await UserService.updateOidcUserInfo(form);
    $q.notify({
      type: 'positive',
      message: '保存成功',
    });
  } catch {
    console.log('error: 保存失败');
  }
};
const editName = ref({
  lastName: authStore.lastName,
  firstName: authStore.firstName,
});
</script>

<style lang="scss" scoped>
.form .line {
  padding: 12px 0;
}
.form .line .title {
  width: 100px;
  padding: 0 8px;
}
.form .line .content {
  padding: 0 8px;
  position: relative;
}
</style>
