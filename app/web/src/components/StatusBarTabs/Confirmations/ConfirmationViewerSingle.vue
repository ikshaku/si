<template>
  <div class="bg-neutral-800 rounded text-left flex flex-col">
    <div class="flex py-2 border-b border-black px-3 capitalize">
      {{ confirmation.title }}
    </div>

    <div class="w-full flex flex-col px-3 py-3 gap-2 text-sm">
      <StatusMessageBox :status="confirmation.status" type="confirmation"
        >Status: {{ confirmation.status }}
      </StatusMessageBox>
      <div v-if="confirmation.description">
        <b>Description: </b>
        <p>{{ confirmation.description }}</p>
      </div>

      <div v-if="confirmation.output" class="text-right">
        <button
          class="underline text-action-400"
          @click="detailsModalRef?.open()"
        >
          View Details
        </button>
      </div>
    </div>

    <Modal ref="detailsModalRef" size="2xl" :title="confirmation.title">
      <div class="my-2">
        <StatusMessageBox :status="confirmation.status" type="confirmation"
          >Status: {{ confirmation.status }}
        </StatusMessageBox>
      </div>

      <div v-if="confirmation.description" class="my-2">
        <b>Description: </b>
        <p>{{ confirmation.description }}</p>
      </div>

      <div
        v-if="confirmation.output?.length"
        class="flex flex-col my-2 p-2 border border-warning-600 text-warning-500 rounded"
      >
        <b>Raw Output:</b>
        <p
          v-for="(output, index) in confirmation.output"
          :key="index"
          class="text-sm break-all"
        >
          {{ output }}
        </p>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { Modal } from "@si/vue-lib/design-system";
import StatusMessageBox from "@/components/StatusMessageBox.vue";
import { Confirmation } from "@/store/fixes.store";

defineProps<{
  confirmation: Confirmation;
}>();

const detailsModalRef = ref<InstanceType<typeof Modal>>();
</script>
