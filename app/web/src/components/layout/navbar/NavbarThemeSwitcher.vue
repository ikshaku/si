<template>
  <!-- FIXME(nick,theo): dropdown-classes needs to be removed in favor of the dropdown knowing whether or not it is offscreen. -->
  <NavbarButton ref="buttonRef" tooltipText="Change theme">
    <Icon :name="currentTheme === 'light' ? 'sun' : 'moon'" />

    <template #dropdownContent>
      <DropdownMenuItem
        :checked="!userOverrideTheme"
        icon="bolt"
        @select="userOverrideTheme = null"
      >
        System theme
      </DropdownMenuItem>
      <DropdownMenuItem
        :checked="userOverrideTheme === 'light'"
        icon="sun"
        @select="userOverrideTheme = 'light'"
      >
        Light theme
      </DropdownMenuItem>
      <DropdownMenuItem
        :checked="userOverrideTheme === 'dark'"
        icon="moon"
        @select="userOverrideTheme = 'dark'"
      >
        Dark theme
      </DropdownMenuItem>
    </template>
  </NavbarButton>
</template>

<script setup lang="ts">
import {
  Icon,
  DropdownMenuItem,
  userOverrideTheme,
  useTheme,
} from "@si/vue-lib/design-system";
import NavbarButton from "./NavbarButton.vue";

const { theme: currentTheme } = useTheme();
</script>
